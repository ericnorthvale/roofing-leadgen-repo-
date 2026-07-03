import { test, expect } from "@playwright/test";

/**
 * The money path, end-to-end in a real browser: fill the lead form, submit,
 * land on /thank-you. With no integration env keys set (the default in dev/CI)
 * every downstream push cleanly skips, so this exercises the form → API →
 * redirect path in isolation.
 */

test.describe("lead form", () => {
  test("valid submission lands on /thank-you", async ({ page }) => {
    await page.goto("/contact");
    await page.fill('input[name="firstName"]', "Playwright");
    await page.fill('input[name="phone"]', "(281) 555-0123");
    await page.fill('input[name="address"]', "1 Test Lane");
    await page.fill('input[name="city"]', "Spring");
    await page.fill('input[name="zip"]', "77379");
    await page.check('input[name="consent"]');
    await page.click('form[action="/api/lead"] button[type="submit"]');
    await page.waitForURL("**/thank-you");
    await expect(page.getByRole("heading", { name: "We've got it from here." })).toBeVisible();
  });

  test("browser blocks an invalid zip before submit (native validation on)", async ({ page }) => {
    await page.goto("/contact");
    await page.fill('input[name="firstName"]', "Playwright");
    await page.fill('input[name="phone"]', "(281) 555-0123");
    await page.fill('input[name="address"]', "1 Test Lane");
    await page.fill('input[name="city"]', "Spring");
    await page.fill('input[name="zip"]', "773");
    await page.check('input[name="consent"]');
    await page.click('form[action="/api/lead"] button[type="submit"]');
    // Native validation halts submission — we never leave /contact.
    await expect(page).toHaveURL(/\/contact/);
    const invalid = await page
      .locator('input[name="zip"]')
      .evaluate((el) => !(el as HTMLInputElement).checkValidity());
    expect(invalid).toBe(true);
  });

  test("API rejects malformed input that bypasses the browser (422)", async ({ request }) => {
    const res = await request.post("/api/lead", {
      form: {
        firstName: "Bypass",
        phone: "not-a-phone",
        address: "1 Test Lane",
        city: "Spring",
        zip: "77379",
        consent: "yes",
      },
    });
    expect(res.status()).toBe(422);
  });
});
