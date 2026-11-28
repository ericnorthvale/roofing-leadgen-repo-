import { test, expect } from "@playwright/test";
import http from "node:http";
import type { Server } from "node:http";

/**
 * The estimator, driven in a real browser against a stand-in for the Claude API.
 *
 * WHY A STUB AND NOT THE REAL API. The questions worth asking are about OUR
 * code — does the button fire, does the answer reach the screen, does a line
 * the model made up get thrown out before it can reach a customer. A real call
 * answers none of those better, and would make the suite cost money, need a
 * key, and fail on a bad day at a provider. What the stub cannot tell us is
 * whether the model obeys the prompt; only a live key answers that.
 *
 * THE FAKE ID IN THE STUB IS THE POINT. "solar-panel-install" is not in
 * ESTIMATE_ITEMS. A model returning it must not be able to put $9,000 on an
 * estimate, and the rep must still be told it was asked for. That is the most
 * valuable assertion in this file.
 *
 * THE STUB ANSWERS ON INPUT, NOT ON CALL COUNT, so it is safe when Playwright
 * workers share it: a request mentioning gutter guards gets the second-turn
 * estimate, anything else gets the first.
 *
 * TO RUN IT, start the dev server pointed at the stub, then run the spec:
 *
 *   ESTIMATOR_PIN=<code> ADMIN_SESSION_SECRET=<any> \
 *   ANTHROPIC_API_KEY=stub ANTHROPIC_BASE_URL=http://localhost:4555 pnpm dev
 *
 *   E2E_ESTIMATOR_PIN=<code> E2E_ANTHROPIC_STUB=1 pnpm test:e2e estimator-voice
 *
 * Without E2E_ANTHROPIC_STUB it skips rather than report a false red: against a
 * server with no key the route correctly answers 503.
 */

const PIN = process.env.E2E_ESTIMATOR_PIN;
const STUB = process.env.E2E_ANTHROPIC_STUB === "1";

/** After turn one. Ridge vent was named but never priced. */
const DRAFT_1 = {
  squares: 30,
  deposit: null,
  lines: [
    { id: "tear-off", qty: 30, price: 450 },
    { id: "pipe-boots", qty: 2, price: 90 },
    { id: "ridge-vent", qty: 40, price: null },
    // Not a catalogue id. Must never reach the estimate.
    { id: "solar-panel-install", qty: 1, price: 9000 },
  ],
  notes: "Granule loss across the south slope and two cracked pipe boots.",
  unmatched: [],
};

/** After turn two: ridge vent gets its price, gutter guards are added. */
const DRAFT_2 = {
  squares: 30,
  deposit: null,
  lines: [
    { id: "tear-off", qty: 30, price: 450 },
    { id: "pipe-boots", qty: 2, price: 90 },
    { id: "ridge-vent", qty: 40, price: 6 },
    { id: "gutter-guards", qty: 1, price: 1250 },
  ],
  notes: "Granule loss across the south slope and two cracked pipe boots.",
  unmatched: [],
};

const TURN_1 =
  "Tear off and replace, thirty squares, four fifty a square. " +
  "Two pipe boots at ninety each. Forty feet of ridge vent. " +
  "Granule loss on the south slope.";

const TURN_2 = "Ridge vent is six a foot. Add gutter guards for twelve fifty.";

let stub: Server | undefined;
/** Several workers share one stub; only the one that bound it closes it. */
let ownsStub = false;

test.describe("estimator — talking out an estimate", () => {
  test.skip(!PIN || !STUB, "see the header of this file for how to run it");

  // Serial, and slow on purpose. Against `pnpm dev` the React island is
  // compiled on first request, so a parallel run has several workers waiting
  // on the same cold compile and timing out — a fact about the dev server, not
  // the page. The first test pays it once.
  test.describe.configure({ mode: "serial" });
  test.beforeEach(({}, testInfo) => testInfo.setTimeout(90_000));

  test.beforeAll(async () => {
    stub = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const draft = body.includes("gutter guards") ? DRAFT_2 : DRAFT_1;
        // Identifies this stub to the guard below.
        res.writeHead(200, { "content-type": "application/json", "x-nv-stub": "spec" });
        res.end(
          JSON.stringify({
            id: "msg_stub",
            type: "message",
            role: "assistant",
            model: "claude-opus-5-5",
            content: [{ type: "text", text: JSON.stringify(draft) }],
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: { input_tokens: 1200, output_tokens: 180 },
          }),
        );
      });
    });
    await new Promise<void>((done, fail) => {
      stub!.once("error", (err: NodeJS.ErrnoException) => {
        // Port already held. Normally that is a sibling worker's copy of this
        // same stub, which is fine — it is stateless and answers identically.
        // But a hand-run stub left over from debugging also holds this port,
        // and then the whole suite quietly tests against someone else's
        // fixture. That has cost two debugging cycles, so it is checked.
        if (err.code === "EADDRINUSE") done();
        else fail(err);
      });
      stub!.listen(4555, () => {
        ownsStub = true;
        done();
      });
    });

    if (!ownsStub) {
      const probe = await fetch("http://localhost:4555/v1/messages", {
        method: "POST",
        body: "{}",
      }).catch(() => null);
      if (probe?.headers.get("x-nv-stub") !== "spec") {
        throw new Error(
          "Something other than this spec's stub is listening on :4555. " +
            "A leftover hand-run stub will serve its own fixture and every " +
            "assertion here will be about the wrong data. Stop it and re-run.",
        );
      }
    }
  });

  test.afterAll(async () => {
    if (ownsStub) await new Promise<void>((done) => stub?.close(() => done()));
  });

  async function unlock(page: import("@playwright/test").Page) {
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");
    await expect(page.getByLabel(/What you're quoting/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[data-hydrated]")).toHaveAttribute("data-hydrated", "true", {
      timeout: 30_000,
    });
  }

  test("the draft endpoint refuses a caller with no session", async ({ request }) => {
    const res = await request.post("/api/estimator/draft", {
      data: { turns: [TURN_1] },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
  });

  test("talking once builds the estimate, and nothing that was not said gets on it", async ({
    page,
  }) => {
    await unlock(page);
    await page.getByLabel(/What you're quoting/i).fill(TURN_1);

    const posted = page.waitForRequest(
      (r) => r.url().includes("/api/estimator/draft") && r.method() === "POST",
      { timeout: 10_000 },
    );
    await page.getByRole("button", { name: "Build the estimate" }).click();
    await posted;

    const estimate = page.locator("section", { hasText: "The estimate" }).last();
    await expect(estimate.getByText("Tear off the existing roof to the deck")).toBeVisible({
      timeout: 15_000,
    });
    await expect(estimate.getByText("$13,500.00")).toBeVisible();
    await expect(estimate.getByText("30 square × $450.00")).toBeVisible();
    await expect(estimate.getByText("2 each × $90.00")).toBeVisible();

    // Named but never priced: shown, and asked for — never guessed.
    await expect(estimate.getByText("needs a price")).toBeVisible();
    await expect(page.getByText(/1 line has no price/)).toBeVisible();

    // The made-up line is refused and surfaced, not silently dropped.
    await expect(page.getByText("solar panel install")).toBeVisible();
    await expect(page.getByText("$9,000")).toHaveCount(0);

    // 30 × 450 + 2 × 90. The unpriced line counts as nothing, not as zero.
    await expect(page.getByText("$13,680.00")).toBeVisible();
    // "across the south slope" is the written-up version; the rep said "on the
    // south slope", so this matches the notes and not the turn above them.
    await expect(estimate.getByText(/Granule loss across the south slope/)).toBeVisible();

    // What the rep said is kept on screen so they can see what it heard.
    await expect(page.getByText(TURN_1)).toBeVisible();
  });

  test("talking again changes the estimate instead of starting a new one", async ({ page }) => {
    await unlock(page);
    await page.getByLabel(/What you're quoting/i).fill(TURN_1);
    await page.getByRole("button", { name: "Build the estimate" }).click();
    await expect(page.getByText("$13,680.00")).toBeVisible({ timeout: 15_000 });

    // Second turn: price the line that had none, and add a new one.
    await page.getByLabel(/What you're quoting/i).fill(TURN_2);
    await page.getByRole("button", { name: "Add this" }).click();

    const estimate = page.locator("section", { hasText: "The estimate" }).last();
    await expect(page.getByText("$15,170.00")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("needs a price")).toHaveCount(0);
    await expect(estimate.getByText("Gutter guards")).toBeVisible();
    await expect(estimate.getByText("40 foot × $6.00")).toBeVisible();
    // A lump sum is qty 1 by convention, not because anyone said "one" — it
    // must not be marked as a figure that could not be traced.
    await expect(estimate.getByText("CHECK THIS")).toHaveCount(0);

    // Both turns stay listed, in order.
    await expect(page.getByText(TURN_1)).toBeVisible();
    await expect(page.getByText(TURN_2)).toBeVisible();
  });

  test("the proposal downloads as a real PDF", async ({ page }) => {
    // The cover photo needs two Google-keyed endpoints this suite has no keys
    // for, so they are stood in for here. The point is not the photo — it is
    // that the button produces a PDF at all, since everything before this is
    // only an estimate on a screen.
    await page.route("**/api/geocode**", (r) =>
      r.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: true, rooftop: true, lat: 30.3118, lng: -95.4561 }),
      }),
    );
    // 204 is how property-image says "nothing for this address" — and 204 is a
    // success status, so this also checks it isn't mistaken for an image.
    await page.route("**/api/property-image**", (r) => r.fulfill({ status: 204, body: "" }));

    await unlock(page);
    await page.getByLabel("Name").fill("Dale Whitaker");
    await page.getByLabel("Property address").fill("118 Red Cedar Dr, Conroe TX 77302");
    await page.getByLabel(/What you're quoting/i).fill(TURN_1);
    await page.getByRole("button", { name: "Build the estimate" }).click();
    await expect(page.getByText("$13,680.00")).toBeVisible({ timeout: 15_000 });

    const download = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: "Proposal" }).click();
    const file = await download;

    expect(file.suggestedFilename()).toBe("Northvale-proposal-Dale-Whitaker.pdf");
    const path = await file.path();
    const { readFileSync } = await import("node:fs");
    const bytes = readFileSync(path!);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    // A PDF that is only a header is not a proposal.
    expect(bytes.byteLength).toBeGreaterThan(20_000);
  });

  test("words typed before React wakes up are not lost", async ({ page }) => {
    // THE REGRESSION THIS GUARDS. The page is server-rendered, so a rep can be
    // typing before it has hydrated. React does not adopt a DOM value it never
    // saw typed — it overwrites it with its own empty state — so the text was
    // destroyed and the estimate built from nothing. Fill everything the
    // instant it exists, before waiting for any hydration signal.
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");

    const box = page.getByLabel(/What you're quoting/i);
    await box.waitFor({ timeout: 15_000 });
    await box.fill(TURN_1);
    await page.getByLabel("Name").fill("Dale Whitaker");
    await page.getByLabel("Property address").fill("118 Red Cedar Dr, Conroe TX");

    await expect(page.locator("[data-hydrated]")).toHaveAttribute("data-hydrated", "true", {
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Build the estimate" }).click();

    await expect(page.getByText("$13,680.00")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel("Name")).toHaveValue("Dale Whitaker");
    await expect(page.getByLabel("Property address")).toHaveValue("118 Red Cedar Dr, Conroe TX");
  });
});
