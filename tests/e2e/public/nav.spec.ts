import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { LEGACY_ORDER } from "../../../src/lib/services";
import { SURVEY } from "../../../src/lib/anket/survey";

const inView = async (page: import("@playwright/test").Page, id: string) =>
  page.locator(id).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.top < window.innerHeight;
  });

test("NAV-01: header — About opens the drawer, Contact scrolls to the form without the header covering it", async ({ page }) => {
  await page.goto("/az");
  const nav = page.locator("header nav[aria-label='Main']");
  await nav.getByRole("button", { name: "Haqqımızda" }).click();
  const drawer = page.getByRole("dialog", { name: "nobug haqqında" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Bağla" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Haqqımızda" })).toBeFocused(); // focus returns to the trigger
  await nav.getByRole("link", { name: "Əlaqə" }).click();
  await expect.poll(() => inView(page, "#elaqe")).toBe(true);
});

test("NAV-02: the footer logo returns to #top", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.locator("footer a[href='/az#top']").first().click();
  await expect(page).toHaveURL(/#top$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("NAV-03: the About drawer is full screen on a phone and closes on its backdrop and ✕", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/az");
  await page.getByRole("button", { name: "Haqqımızda" }).click();
  const drawer = page.getByRole("dialog", { name: "nobug haqqında" });
  await expect(drawer).toBeVisible();
  expect((await drawer.boundingBox())!.width).toBeCloseTo(390, 0);
  await drawer.getByRole("button", { name: "Bağla" }).click();
  await expect(drawer).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Haqqımızda" }).click();
  await page.mouse.click(100, 450); // backdrop
  await expect(drawer).toHaveCount(0);
});

test("NAV-04: a direct anchor URL opens on the section", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.waitForLoadState("load");
    await page.waitForTimeout(400);
  await expect.poll(() => inView(page, "#elaqe")).toBe(true);
});

test("NAV-05: every service card opens its page, whose CTA opens the anket at step 2 with that service", async ({ page }) => {
  await page.goto("/az");
  const cards = page.locator("#xidmetler a[href^='/az/xidmetler/']");
  await expect(cards).toHaveCount(7);
  const hrefs = await cards.evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).getAttribute("href")!));
  for (const href of hrefs) {
    const code = href.split("/").pop()!;
    expect(LEGACY_ORDER as readonly string[]).toContain(code);
    await page.goto(href);
    await page.getByRole("link", { name: DICT.az.cta }).first().click();
    await expect(page.getByText(/2 \/ 3|Addım 2/)).toBeVisible();
    await expect(page.locator("h2")).toContainText(SURVEY.az.services[LEGACY_ORDER.indexOf(code as (typeof LEGACY_ORDER)[number])]);
  }
});

test("NAV-06: the home calls to action lead to the anket", async ({ page }) => {
  await page.goto("/az");
  const ctas = page.locator("main").getByRole("link", { name: DICT.az.cta });
  expect(await ctas.count()).toBeGreaterThanOrEqual(2); // statement + FAQ
  for (const a of await ctas.all()) await expect(a).toHaveAttribute("href", "/az/anket");
  await expect(page.locator("#xidmetler a[href='/az/anket']")).toHaveCount(1); // closing tile of the services grid
  await ctas.first().click();
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
