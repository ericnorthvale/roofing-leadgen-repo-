import { expect, test } from "@playwright/test";

const CORE_PATHS = [
  "/",
  "/services",
  "/services/roof-replacement",
  "/services/roof-inspection",
  "/the-woodlands",
  "/spring",
  "/storm-response",
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

test("homepage surfaces the house tagline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Same day");
});
