import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { SURVEY } from "../../../src/lib/anket/survey";
import { LEGACY_ORDER } from "../../../src/lib/services";

test("LOC-01: switching language on the anket keeps the screen and the ?xidmet= parameter", async ({ page }) => {
  await page.goto("/az/anket?xidmet=qa");
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/anket\?xidmet=qa$/);
  await expect(page.locator("h2")).toContainText(SURVEY.en.services[LEGACY_ORDER.indexOf("qa")]);
  await page.getByRole("link", { name: "RU", exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/anket\?xidmet=qa$/);
  await expect(page.locator("h2")).toContainText(SURVEY.ru.services[LEGACY_ORDER.indexOf("qa")]);
});

test("LOC-02 / LOC-03: no untranslated keys, correct lang attribute and title per locale", async ({ page }) => {
  for (const l of ["az", "en", "ru"] as const) {
    for (const path of [`/${l}`, `/${l}/anket`, `/${l}/anket?xidmet=web`]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", l);
      const text = await page.locator("body").innerText();
      expect(text, path).not.toMatch(/\b(tpl|meta|nav|dict|errors|labels|sv)\.[a-zA-Z]+\b|undefined|\[object Object\]|\bNaN\b/);
    }
    await page.goto(`/${l}`);
    await expect(page).toHaveTitle(DICT[l].meta.title);
    await expect(page.locator("h1")).toHaveText(DICT[l].h1);
  }
});

test("LOC-04: Russian copy fits a 360 px screen without horizontal overflow or clipped buttons", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ["/ru", "/ru/anket?xidmet=qa"]) {
    await page.goto(path);
    await page.waitForLoadState("load");
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
    const clipped = await page.locator("a.pill, button.btn-primary, button.btn-secondary, button.chip").evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent));
    expect(clipped, path).toEqual([]);
  }
});

test("LOC-05: validation messages follow the selected language", async ({ page }) => {
  for (const l of ["en", "ru"] as const) {
    await page.goto(`/${l}#elaqe`);
    await page.locator("form:has(#k2-name) button[type='submit']").click();
    await expect(page.locator("form:has(#k2-name) [role='alert']").first()).toHaveText(DICT[l].fieldRequired);
    await page.goto(`/${l}/anket?xidmet=qa`);
    await page.getByRole("button", { name: SURVEY[l].next }).click();
    await expect(page.locator("main [role='alert']").first()).toHaveText(SURVEY[l].errors.answer);
  }
});

test("LOC-06 (local part): the root redirects to /az", async ({ request }) => {
  const res = await request.get("/", { maxRedirects: 0 });
  expect([307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toMatch(/\/az$/);
});
