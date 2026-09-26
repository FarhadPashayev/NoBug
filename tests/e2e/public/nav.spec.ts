import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { LEGACY_ORDER } from "../../../src/lib/services";
import { SURVEY } from "../../../src/lib/anket/survey";

const inView = async (page: import("@playwright/test").Page, id: string) =>
  page.locator(id).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.top < window.innerHeight;
  });

test("NAV-01: header menu anchors scroll to their section without the header covering the heading", async ({ page }) => {
  await page.goto("/az");
  for (const [href, label] of DICT.az.nav) {
    await page.locator("header nav[aria-label='Main']").getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect.poll(() => inView(page, href)).toBe(true);
    const top = await page.locator(href).evaluate((el) => el.getBoundingClientRect().top);
    const headerH = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().height);
    expect(top).toBeGreaterThanOrEqual(headerH - 1);
  }
});

test("NAV-02: the footer logo returns to #top", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.locator("footer a[href='/az#top']").first().click();
  await expect(page).toHaveURL(/#top$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("NAV-03: hamburger menu below 1024 px opens, closes on link and on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/az");
  const burger = page.getByRole("button", { name: DICT.az.menu });
  await burger.click();
  const mobileNav = page.locator("nav[aria-label='Main mobile']");
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("link", { name: "Əlaqə" }).click();
  await expect(mobileNav).toHaveCount(0);
  await expect(page).toHaveURL(/#elaqe$/);
  await burger.click();
  await expect(mobileNav).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobileNav).toHaveCount(0);
});

test("NAV-04: a direct anchor URL opens on the section", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.waitForLoadState("load");
    await page.waitForTimeout(400);
  await expect.poll(() => inView(page, "#elaqe")).toBe(true);
});

test("NAV-05: every service card opens the anket at step 2 with the right service", async ({ page }) => {
  await page.goto("/az");
  const cards = page.locator("#xidmetler a[href*='xidmet=']");
  await expect(cards).toHaveCount(12);
  const hrefs = await cards.evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).getAttribute("href")!));
  for (const href of hrefs) {
    const code = new URL(href, "http://x").searchParams.get("xidmet")!;
    expect(LEGACY_ORDER as readonly string[]).toContain(code);
    await page.goto(href);
    await expect(page.getByText(/2 \/ 3|Addım 2/)).toBeVisible();
    await expect(page.locator("h2")).toContainText(SURVEY.az.services[LEGACY_ORDER.indexOf(code as (typeof LEGACY_ORDER)[number])]);
  }
});

test("NAV-06: CTAs lead to the anket and to the services section", async ({ page }) => {
  await page.goto("/az");
  await expect(page.locator("header").getByRole("link", { name: DICT.az.cta })).toHaveAttribute("href", "/az/anket");
  await expect(page.locator("#top").getByRole("link", { name: DICT.az.tpl.ctaSecondary })).toHaveAttribute("href", "/az#xidmetler");
  await expect(page.getByRole("link", { name: DICT.az.tpl.exploreEnquiry })).toHaveAttribute("href", "/az/anket");
  await page.locator("#top").getByRole("link", { name: DICT.az.cta }).first().click();
  await expect(page).toHaveURL(/\/az\/anket$/);
});

test("NAV-07: footer legal links answer 200, social links open in a new tab, mailto is present", async ({ page, request }) => {
  await page.goto("/az");
  const footer = page.locator("footer");
  for (const href of await footer.locator("a[href^='/az/']").evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).getAttribute("href")!))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
  for (const a of await footer.locator("a[href^='http']").all()) {
    await expect(a).toHaveAttribute("target", "_blank");
    await expect(a).toHaveAttribute("rel", /noopener/);
  }
  await expect(footer.locator("a[href^='mailto:']").first()).toHaveAttribute("href", /^mailto:.+@.+/);
});

test("NAV-08: unknown URL → 404 page with its own title and a working home link", async ({ page, request }) => {
  expect((await request.get("/az/olmayan-sehife")).status()).toBe(404);
  await page.goto("/az/olmayan-sehife");
  await expect(page.locator("h1")).toHaveText("Səhifə tapılmadı");
  await expect(page).toHaveTitle(/Səhifə tapılmadı/);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: "Ana səhifə" }).click();
  await expect(page).toHaveURL(/\/az$/);
});
