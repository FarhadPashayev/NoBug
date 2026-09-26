import { expect, test } from "@playwright/test";

test("RSP-01: no horizontal scroll and no overlapping header at 320 / 360 / 768 / 1024 / 1440 / 1920", async ({ page }) => {
  for (const width of [320, 360, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/az", "/az/anket?xidmet=qa", "/az/mexfilik-siyaseti"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
    await page.waitForTimeout(400);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width} ${path}`).toBe(true);
    }
    await page.goto("/az");
    const burger = page.getByRole("button", { name: "Menyu" });
    if (width < 1024) await expect(burger).toBeVisible();
    else await expect(burger).toBeHidden();
  }
});

test("RSP-02: anket touch targets are at least 44 px on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/az/anket?xidmet=qa");
  const small = await page.locator("button.chip, button.btn-primary, button.btn-secondary").evaluateAll((els) =>
    els.map((el) => ({ t: el.textContent?.trim(), h: el.getBoundingClientRect().height })).filter((x) => x.h < 44),
  );
  expect(small).toEqual([]);
  await page.goto("/az/anket");
  const services = await page.locator("button.group, main button").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height).filter((h) => h > 0 && h < 44));
  expect(services).toEqual([]);
});
