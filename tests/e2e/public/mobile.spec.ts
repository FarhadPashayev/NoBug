import { expect, test } from "@playwright/test";

test("PUB-05: no horizontal overflow at 390 px and the contact form is usable", async ({ page }) => {
  await page.goto("/az");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator("#k2-name").scrollIntoViewIfNeeded();
  await page.fill("#k2-name", "Mobil test");
  await page.fill("#k2-mail", "mobil@example.com");
  await page.fill("#k2-msg", "Mobil sorğu");
  await expect(page.locator('form:has(#k2-name) button[type="submit"]')).toBeInViewport();
  await page.screenshot({ path: "tests/screenshots/public-mobile.png", fullPage: true });
});
