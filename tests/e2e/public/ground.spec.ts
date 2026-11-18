import { expect, test } from "@playwright/test";

// Showcase grounds: the home page and the enquiry flow are near-black, the
// case studies (services, projects) are paper — from the first paint,
// including the overscroll area, and the copy keeps AA contrast on each.

const bg = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const lum = (rgb: string) => {
  const [r, g, b] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("GND-01: dark home and enquiry, paper case studies", async ({ page }) => {
  for (const [path, ground] of [
    ["/az", "rgb(8, 8, 8)"],
    ["/az/anket", "rgb(8, 8, 8)"],
    ["/az/xidmetler/qa", "rgb(237, 235, 229)"],
  ] as const) {
    await page.goto(path);
    expect(await bg(page), path).toBe(ground);
  }
});

test("GND-02: section copy on the home ground keeps 4.5:1 contrast", async ({ page }) => {
  await page.goto("/az");
  const ground = lum(await bg(page));
  for (const sel of ["#xidmetler p", "#proses p", "#haqqinda div", "footer a"]) {
    const color = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).color);
    // alpha colours are blended over the ground before measuring
    const blended = await page.locator(sel).first().evaluate((el) => {
      const c = getComputedStyle(el).color.match(/[\d.]+/g)!.map(Number);
      const a = c[3] ?? 1;
      return `rgb(${c.slice(0, 3).map((v) => Math.round(v * a + 8 * (1 - a))).join(", ")})`;
    });
    const fg = lum(blended);
    expect((Math.max(fg, ground) + 0.05) / (Math.min(fg, ground) + 0.05), `${sel} ${color}`).toBeGreaterThanOrEqual(4.5);
  }
});
