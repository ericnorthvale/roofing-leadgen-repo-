import { expect, test } from "@playwright/test";

const CORE_PATHS = [
  "/",
  "/services",
  "/services/roof-replacement",
  "/services/roof-inspection",
  "/the-woodlands",
  "/the-woodlands/roof-replacement",
  "/the-woodlands/storm-damage",
  "/the-woodlands/alden-bridge",
  "/the-woodlands/creekside-park",
  "/spring",
  "/storm-response",
  "/process",
  "/warranty",
  "/about",
  "/contact",
  "/reviews",
  "/blog",
  "/for-homeowners",
  "/for-agents",
  "/for-insurance-partners",
  "/for-hoa",
  "/for-inspectors",
  "/legal/privacy",
  "/legal/terms",
  "/legal/tcpa",
  "/legal/accessibility",
];

for (const path of CORE_PATHS) {
  test(`${path} renders with an h1`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok(), `response status for ${path}`).toBeTruthy();
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("homepage h1 carries the primary keyword", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The Woodlands Roofing Company",
  );
});

test("homepage still surfaces the house tagline", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("Same day. In writing.");
});

test("draft city page is noindex; flagship city page is not", async ({ page }) => {
  await page.goto("/spring");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  await page.goto("/the-woodlands");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
});

test("pages emit a canonical URL", async ({ page }) => {
  await page.goto("/the-woodlands/roof-replacement");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/the-woodlands\/roof-replacement$/);
});
