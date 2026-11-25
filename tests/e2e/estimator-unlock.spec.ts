import { test, expect } from "@playwright/test";

/**
 * The estimator's unlock flow, driven in a real browser.
 *
 * WHY THIS EXISTS. The first version of the unlock script shipped wrapped in a
 * template literal — {`...`} — and Astro emitted that wrapper VERBATIM. The
 * browser received a block statement containing a string: valid JavaScript, no
 * console error, no network request, and the submit handler never attached.
 * The button looked fine and silently did nothing.
 *
 * Nothing else in the suite could have caught it. The unit tests pass (the
 * logic is correct), the API returns 200 to curl (the endpoint is correct),
 * the page renders (the markup is correct), typecheck and lint are clean. Only
 * clicking the button in a browser fails. So that is what this does.
 *
 * REQUIRES ESTIMATOR_PIN TO BE SET for the server under test; without it the
 * route 404s by design and these tests skip rather than report a false red.
 */

const PIN = process.env.E2E_ESTIMATOR_PIN;

test.describe("estimator unlock", () => {
  test.skip(!PIN, "set E2E_ESTIMATOR_PIN (and ESTIMATOR_PIN on the server) to run");

  test("submitting the code actually issues a POST", async ({ page }) => {
    await page.goto("/estimator");
    await expect(page.locator("form")).toBeVisible();

    // The original regression was a click that produced NO request at all.
    const request = page.waitForRequest(
      (r) => r.url().includes("/api/estimator/unlock") && r.method() === "POST",
      { timeout: 5_000 },
    );
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");
    await expect(request).resolves.toBeTruthy();
  });

  test("the code screen works with JavaScript disabled", async ({ browser }) => {
    // The whole reason this is a native form: a driveway tool must not depend
    // on a script that might never attach.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");
    await expect(page.locator("header p", { hasText: "New estimate" })).toBeVisible({
      timeout: 10_000,
    });
    await ctx.close();
  });

  test("a correct code opens the builder and sets a session cookie", async ({ page, context }) => {
    await page.goto("/estimator");
    await page.fill("#pin", PIN!);
    await page.click("button[type=submit]");

    await expect(page.locator("header p", { hasText: "New estimate" })).toBeVisible({
      timeout: 10_000,
    });
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).toContain("nv_estimator_session");
  });

  test("a wrong code is refused, says so, and leaves the button usable", async ({ page }) => {
    await page.goto("/estimator");
    await page.fill("#pin", "000000");
    await page.click("button[type=submit]");

    await expect(page.locator("#pin-error")).toHaveText(/didn't work|Too many tries/);
    // Still on the code screen, and able to try again.
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("button[type=submit]")).toBeEnabled();
  });
});
