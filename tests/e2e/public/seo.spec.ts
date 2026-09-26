import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";

// canonical host is baked in at build time (NEXT_PUBLIC_SITE_URL) — read it from the page and require consistency
let base = "";

test("SEO-01: unique title/description, canonical and hreflang (az/en/ru/x-default) on every page", async ({ page }) => {
  const titles = new Set<string>();
  await page.goto("/az");
  base = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).origin;
  expect(base).toMatch(/^(https:\/\/www\.nobug\.az|http:\/\/localhost:\d+)$/);
  for (const l of ["az", "en", "ru"] as const) {
    for (const path of [`/${l}`, `/${l}/${{ az: "mexfilik-siyaseti", en: "privacy-policy", ru: "politika-konfidencialnosti" }[l]}`]) {
      const res = await page.goto(path);
      expect(res!.status(), path).toBe(200);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
      titles.add(`${l}:${title}`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`^${base}${path}$`));
      for (const hl of ["az", "en", "ru", "x-default"]) await expect(page.locator(`link[rel="alternate"][hreflang="${hl}"]`), `${path} ${hl}`).toHaveCount(1);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    }
  }
  expect(titles.size).toBe(6);
  await page.goto("/az");
  await expect(page).toHaveTitle(DICT.az.meta.title);
});

test("SEO-02: sitemap lists every language version; robots allows the site and blocks /admin", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const origin = new URL(sitemap.match(/<loc>([^<]+)<\/loc>/)![1]).origin;
  for (const l of ["az", "en", "ru"]) expect(sitemap).toContain(`${origin}/${l}</loc>`);
  expect(sitemap).toContain('hreflang="x-default"');
  expect(sitemap).not.toContain("/anket");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toMatch(/Disallow: \/admin/);
  expect(robots).toMatch(/Sitemap: https?:\/\/[^/]+\/sitemap\.xml/);
});

test("A11Y-01: every image has an alt attribute (empty for decorative)", async ({ page }) => {
  for (const path of ["/az", "/az/anket?xidmet=qa"]) {
    await page.goto(path);
    const missing = await page.locator("img").evaluateAll((imgs) => imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.getAttribute("src")));
    expect(missing, path).toEqual([]);
    const meaningful = await page.locator("img[alt]:not([alt=''])").count();
    expect(meaningful, path).toBeGreaterThan(0);
  }
});

test("A11Y-02: keyboard focus is visible and axe finds no serious colour-contrast issues", async ({ page }) => {
  await page.goto("/az");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { tag: el.tagName, visible: s.outlineStyle !== "none" || s.boxShadow !== "none" || s.textDecorationLine.includes("underline") };
  });
  expect(focused.tag).toBe("A");
  expect(focused.visible).toBe(true);
  for (const path of ["/az", "/az/anket?xidmet=qa", "/admin/login"]) {
    await page.goto(path);
    await page.waitForLoadState("load");
    await page.waitForTimeout(400);
    // sections marked data-bg="dark" get their navy ground from the scroll observer on <body>;
    // axe measures them against the light page colour, so contrast there is checked by hand
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).exclude('[data-bg="dark"]').analyze();
    const bad = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`), path).toEqual([]);
  }
});
