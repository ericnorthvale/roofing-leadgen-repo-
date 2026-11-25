import { test, expect } from "@playwright/test";
import http from "node:http";
import type { Server } from "node:http";

/**
 * The talk-it-through flow, driven in a real browser against a stand-in for
 * the Claude API.
 *
 * WHY A STUB AND NOT THE REAL API. The questions worth asking here are about
 * OUR code — does the button fire, does the response reach the right boxes,
 * does an id outside the catalogue get thrown out before it can be printed on
 * a customer's estimate. A real API call would answer none of those any better
 * and would make the suite cost money, need a key, and fail on a bad day at a
 * provider. What the stub cannot tell us is whether the model obeys the
 * prompt; only a live key answers that, and the rep reviewing every figure is
 * what stands behind it either way.
 *
 * THE FAKE ID IN THE STUB RESPONSE IS THE POINT. "solar-panel-install" is not
 * in ESTIMATE_ITEMS. A model that returns it must not be able to put a $9,000
 * line on an estimate, and the rep must still be told it was asked for. That
 * is the single most valuable assertion in this file.
 *
 * TO RUN IT, start the dev server pointed at the stub, then run the spec:
 *
 *   ESTIMATOR_PIN=<code> ADMIN_SESSION_SECRET=<any> \
 *   ANTHROPIC_API_KEY=stub ANTHROPIC_BASE_URL=http://localhost:4555 pnpm dev
 *
 *   E2E_ESTIMATOR_PIN=<code> E2E_ANTHROPIC_STUB=1 pnpm test:e2e estimator-voice
 *
 * Without E2E_ANTHROPIC_STUB the spec skips rather than report a false red:
 * against a server with no key the route correctly answers 503.
 */

const PIN = process.env.E2E_ESTIMATOR_PIN;
const STUB = process.env.E2E_ANTHROPIC_STUB === "1";

const DRAFT = {
  squares: 30,
  lines: [
    { id: "tear-off", qty: 30, price: 450 },
    { id: "pipe-boots", qty: 2, price: 90 },
    // Spoken, but no price given — must arrive blank, never guessed.
    { id: "ridge-vent", qty: 40, price: null },
    // Not a catalogue id. Must never reach the estimate.
    { id: "solar-panel-install", qty: 1, price: 9000 },
  ],
  notes: "Granule loss across the south slope and two cracked pipe boots.",
  unmatched: [],
};

const TRANSCRIPT =
  "Tear off and replace, thirty squares, four fifty a square. " +
  "Two pipe boots at ninety each. Forty feet of ridge vent. " +
  "Granule loss on the south slope.";

let stub: Server | undefined;
/** Several Playwright workers share one stub; only the one that bound it closes it. */
let ownsStub = false;

test.describe("estimator — talk it through", () => {
  test.skip(!PIN || !STUB, "see the header of this file for how to run it");

  // Serial, and slow on purpose. Against `pnpm dev` the React island is
  // compiled on first request, so a parallel run has several workers all
  // waiting on the same cold compile and timing out on hydration — a fact
  // about the dev server, not about the page. The first test pays that cost
  // once and the rest are quick.
  test.describe.configure({ mode: "serial" });
  test.beforeEach(({}, testInfo) => testInfo.setTimeout(90_000));

  test.beforeAll(async () => {
    stub = http.createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: "msg_stub",
          type: "message",
          role: "assistant",
          model: "claude-opus-5-5",
          content: [{ type: "text", text: JSON.stringify(DRAFT) }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 1200, output_tokens: 180 },
        }),
      );
    });
    await new Promise<void>((done) => {
      stub!.once("error", (err: NodeJS.ErrnoException) => {
        // Another worker got there first. That is the normal case under two
        // projects running in parallel, and it is fine: the stub is stateless.
        if (err.code === "EADDRINUSE") done();
        else throw err;
      });
      stub!.listen(4555, () => {
        ownsStub = true;
        done();
      });
    });
  });

  test.afterAll(async () => {
    if (ownsStub) await new Promise<void>((done) => stub?.close(() => done()));
  });

  test("the draft endpoint refuses a caller with no session", async ({ request }) => {
    const res = await request.post("/api/estimator/draft", {
      data: { transcript: TRANSCRIPT },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
  });

  test("what the rep says lands in the right boxes, and nothing else does", async ({ page }) => {
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");

    const box = page.getByLabel(/What you're quoting/i);
    await expect(box).toBeVisible({ timeout: 15_000 });
    await box.fill(TRANSCRIPT);

    const build = page.getByRole("button", { name: "Build the estimate" });
    await expect(page.locator("[data-hydrated]")).toHaveAttribute("data-hydrated", "true", {
      timeout: 30_000,
    });

    const posted = page.waitForRequest(
      (r) => r.url().includes("/api/estimator/draft") && r.method() === "POST",
      { timeout: 10_000 },
    );
    await build.click();
    await posted;

    // Three of the four lines survive: the made-up id is gone.
    await expect(page.getByText(/Added 3 items/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("solar-panel-install")).toBeVisible();
    await expect(page.getByText("$9,000")).toHaveCount(0);

    await expect(
      page.getByLabel("Quantity for Tear off the existing roof to the deck"),
    ).toHaveValue("30");
    await expect(page.getByLabel("Price for Tear off the existing roof to the deck")).toHaveValue(
      "450",
    );
    await expect(page.getByLabel("Quantity for New pipe boots on every penetration")).toHaveValue(
      "2",
    );

    // Spoken without a price — stays blank. This is the whole safety claim.
    await expect(page.getByLabel("Quantity for Ridge ventilation")).toHaveValue("40");
    await expect(page.getByLabel("Price for Ridge ventilation")).toHaveValue("");

    await expect(page.getByLabel("Squares")).toHaveValue("30");
    await expect(page.getByPlaceholder(/What you saw on the roof/)).toHaveValue(/Granule loss/);

    // 30 x 450 + 2 x 90, computed from the typed figures only.
    await expect(page.getByText("$13,680.00")).toBeVisible();
  });

  test("words typed before React wakes up are not lost", async ({ page }) => {
    // THE REGRESSION THIS GUARDS. The box is server-rendered, so a rep can be
    // talking into it before the page has hydrated. React does not adopt a DOM
    // value it never saw typed, so the text sat there invisible to the app and
    // the button it gated stayed dead. On a cheap phone on bad signal that
    // window is wide. Fill the box the instant it exists — before waiting for
    // any hydration signal — and the estimate must still build.
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");

    const box = page.getByLabel(/What you're quoting/i);
    await box.waitFor({ timeout: 15_000 });
    await box.fill(TRANSCRIPT);
    // Not just the box under test: a rep lands on this page and the first
    // thing in front of them is the customer's name.
    await page.getByLabel("Name").fill("Dale Whitaker");
    await page.getByLabel("Property address").fill("118 Red Cedar Dr, Conroe TX");

    const posted = page.waitForRequest(
      (r) => r.url().includes("/api/estimator/draft") && r.method() === "POST",
      { timeout: 30_000 },
    );
    await expect(page.locator("[data-hydrated]")).toHaveAttribute("data-hydrated", "true", {
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Build the estimate" }).click();
    await posted;
    await expect(page.getByText(/Added 3 items/)).toBeVisible({ timeout: 15_000 });

    // The early typing survived React taking over, rather than being blanked.
    await expect(page.getByLabel("Name")).toHaveValue("Dale Whitaker");
    await expect(page.getByLabel("Property address")).toHaveValue("118 Red Cedar Dr, Conroe TX");
  });

  test("running it again never overwrites a figure the rep corrected", async ({ page }) => {
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");

    const box = page.getByLabel(/What you're quoting/i);
    await expect(box).toBeVisible({ timeout: 15_000 });
    await box.fill(TRANSCRIPT);

    const build = page.getByRole("button", { name: "Build the estimate" });
    await expect(page.locator("[data-hydrated]")).toHaveAttribute("data-hydrated", "true", {
      timeout: 30_000,
    });
    await build.click();
    await expect(page.getByText(/Added 3 items/)).toBeVisible({ timeout: 15_000 });

    const price = page.getByLabel("Price for Tear off the existing roof to the deck");
    await price.fill("500");
    await build.click();
    await page.waitForTimeout(1_500);
    await expect(price).toHaveValue("500");
  });
});
