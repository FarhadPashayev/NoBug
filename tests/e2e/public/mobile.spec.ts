import { expect, test } from "@playwright/test";

test("PUB-05: no horizontal overflow at 390 px and the contact form is usable", async ({ page }) => {
  await page.goto("/az");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator("#cf-name").scrollIntoViewIfNeeded();
  await page.fill("#cf-name", "Mobil test");
  await page.fill("#cf-email", "mobil@example.com");
  await page.fill("#cf-message", "Mobil sorğu");
  const send = page.locator('form:has(#cf-name) button[type="submit"]');
  await send.scrollIntoViewIfNeeded();
  await expect(send).toBeInViewport();
  expect((await send.boundingBox())!.height).toBeGreaterThanOrEqual(44); // touch target
  await page.screenshot({ path: "tests/screenshots/public-mobile.png", fullPage: true });
});
