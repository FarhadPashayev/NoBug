import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { ACTIVE_SERVICES, LEGACY_ORDER, RETIRED_SERVICES } from "../../../src/lib/services";
import { SURVEY } from "../../../src/lib/anket/survey";

test("SEO-04 (feedback A): every service has its own indexable page in three languages", async ({ page, request }) => {
  for (const l of ["az", "en", "ru"] as const) {
    const res = await page.goto(`/${l}/xidmetler/qa`);
    expect(res!.status()).toBe(200);
    const name = DICT[l].services[LEGACY_ORDER.indexOf("qa")][0];
    await expect(page.locator("h1")).toHaveText(name);
    await expect(page).toHaveTitle(`${name} — nobug`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", DICT[l].services[LEGACY_ORDER.indexOf("qa")][1]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${l}/xidmetler/qa$`));
    for (const hl of ["az", "en", "ru", "x-default"]) await expect(page.locator(`link[rel="alternate"][hreflang="${hl}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: DICT[l].cta })).toHaveAttribute("href", `/${l}/anket?xidmet=qa`);
    await expect(page.locator("main")).toContainText(SURVEY[l].q[LEGACY_ORDER.indexOf("qa")][0][0]);
    expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join("")).toContain('"@type":"Service"');
    await expect(page.locator("html")).toHaveAttribute("lang", l);
  }
  expect((await request.get("/az/xidmetler/yoxdur")).status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const slug of ACTIVE_SERVICES) expect(sitemap).toContain(`/az/xidmetler/${slug}</loc>`);
  for (const slug of RETIRED_SERVICES) {
    expect(sitemap).not.toContain(`/xidmetler/${slug}</loc>`);
    const res = await request.get(`/az/xidmetler/${slug}`, { maxRedirects: 0 });
    expect(res.status(), slug).toBe(308);
    expect(res.headers()["location"], slug).toMatch(/\/az#xidmetler$/);
  }
});

test("SEO-04: the home page links to every service page and the language switch stays on the service", async ({ page }) => {
  await page.goto("/az");
  const links = page.locator("#xidmetler a[href^='/az/xidmetler/']");
  await expect(links).toHaveCount(ACTIVE_SERVICES.length);
  await links.first().click();
  await expect(page).toHaveURL(/\/az\/xidmetler\//);
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/xidmetler\//);
  await page.goto("/az");
  await expect(page.locator("footer a[href^='/az/xidmetler/']").first()).toBeVisible(); // footer service column links to the pages (seed)
});
