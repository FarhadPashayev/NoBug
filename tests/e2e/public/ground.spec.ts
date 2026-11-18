import { expect, test } from "@playwright/test";

// Showcase grounds: the home page and the enquiry flow are navy (the home
// alternates navy and white bands), the case studies (services, projects) are
// white — from the first paint, including the overscroll area, and the copy
// keeps AA contrast on the ground it sits on.

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
    ["/az", "rgb(15, 27, 61)"],
    ["/az/anket", "rgb(15, 27, 61)"],
    ["/az/xidmetler/qa", "rgb(255, 255, 255)"],
  ] as const) {
    await page.goto(path);
    expect(await bg(page), path).toBe(ground);
  }
});

test("GND-02: section copy keeps 4.5:1 contrast on its own ground", async ({ page }) => {
  await page.goto("/az");
  for (const sel of ["#xidmetler p", "#proses p", "#haqqinda div", "footer a"]) {
    // the nearest painted ground; alpha colours are blended over it before measuring
    const [fg, ground, color] = await page.locator(sel).first().evaluate((el) => {
      const rgba = (v: string) => v.match(/[\d.]+/g)!.map(Number);
      let node: Element | null = el;
      let g = [15, 27, 61];
      while (node) {
        const c = rgba(getComputedStyle(node).backgroundColor);
        if ((c[3] ?? 1) > 0.9) { g = c.slice(0, 3); break; }
        node = node.parentElement;
      }
      const c = rgba(getComputedStyle(el).color);
      const a = c[3] ?? 1;
      return [c.slice(0, 3).map((v, i) => Math.round(v * a + g[i] * (1 - a))), g, getComputedStyle(el).color] as const;
    });
    const [lf, lg] = [lum(`rgb(${fg.join(",")})`), lum(`rgb(${ground.join(",")})`)];
    expect((Math.max(lf, lg) + 0.05) / (Math.min(lf, lg) + 0.05), `${sel} ${color}`).toBeGreaterThanOrEqual(4.5);
  }
});
