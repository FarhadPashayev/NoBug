import { expect, test } from "@playwright/test";
import { db } from "../db";
import { confirmDelete, dragHandle, localized, toast } from "../helpers";

test("I18N-05 / HERO-01: every localized field has AZ/EN/RU tabs; values survive tab switches and reach each locale", async ({ page }) => {
  await page.goto("/admin/hero");
  for (const name of ["title", "subtitle", "primaryCtaLabel", "secondaryCtaLabel"]) {
    const f = localized(page, name);
    for (const l of ["AZ", "EN", "RU"] as const) await expect(f.tab(l)).toBeVisible();
  }
  const title = localized(page, "title");
  const stamp = Date.now().toString().slice(-5);
  await title.fill({ AZ: `Başlıq ${stamp}`, EN: `Title ${stamp}`, RU: `Заголовок ${stamp}` });
  await expect(await title.use("AZ")).toHaveValue(`Başlıq ${stamp}`);
  await expect(await title.use("EN")).toHaveValue(`Title ${stamp}`);
  await page.getByRole("button", { name: "Yadda saxla" }).first().click();
  await toast(page, /yadda saxlanıldı/);
  for (const [l, text] of [["az", `Başlıq ${stamp}`], ["en", `Title ${stamp}`], ["ru", `Заголовок ${stamp}`]]) {
    await page.goto(`/${l}`);
    await expect(page.locator("h1")).toHaveText(text);
  }
});

test("HERO-02 / HERO-03: CTA URL validation", async ({ page }) => {
  await page.goto("/admin/hero");
  // submit with Enter from the field: the button briefly animates after each save
  const save = () => page.locator("#primaryCtaUrl").press("Enter");
  await page.fill("#primaryCtaUrl", "not a url");
  await save();
  await expect(page.locator('form [role="alert"]', { hasText: "Düzgün ünvan deyil" })).toBeVisible();
  for (const u of ["/contact", "https://nobug.az/x"]) {
    await page.fill("#primaryCtaUrl", u);
    await save();
    await toast(page, /yadda saxlanıldı/);
  }
  await page.fill("#primaryCtaUrl", "/anket");
  await save();
  await toast(page, /yadda saxlanıldı/);
});

test("HERO-09: hero is a singleton — no create control, one DB row", async ({ page }) => {
  await page.goto("/admin/hero");
  await expect(page.getByRole("heading", { name: "Banner", exact: true })).toBeVisible();
  expect(await db.hero.count()).toBe(1);
  await expect(page.locator("form").first().getByRole("button", { name: /^Əlavə et$|Yeni/ })).toHaveCount(0);
});

test("HERO-06 / HERO-07 / HERO-08: logos reorder by drag, toggle hides publicly, delete confirms", async ({ page }) => {
  await page.goto("/admin/hero");
  const handles = page.locator('button[aria-label="Sürüşdür"]');
  await expect(handles).toHaveCount(3);
  const names = () => page.locator("li:has(button[aria-label='Sürüşdür'])").locator("span.font-medium").allTextContents();
  const before = await names();
  await dragHandle(page, handles.nth(0), handles.nth(2));
  await toast(page, /Sıra yadda saxlanıldı/);
  const after = await names();
  expect(after).not.toEqual(before);
  expect(after[2]).toBe(before[0]);
  const rows = await db.partnerLogo.findMany({ orderBy: { order: "asc" } });
  expect(rows.map((r) => r.name)).toEqual(after);

  await page.goto("/az");
  await expect(page.locator('ul[aria-label="Partners"] li')).toHaveCount(3);
  await page.goto("/admin/hero");
  const first = page.locator("li:has(button[aria-label='Sürüşdür'])").first();
  const firstName = (await first.locator("span.font-medium").textContent())!;
  await first.getByRole("button", { name: "Redaktə et" }).click();
  await page.getByRole("dialog").getByRole("switch").click();
  await page.getByRole("dialog").getByRole("button", { name: "Yadda saxla" }).click();
  await toast(page, /Loqo yeniləndi/);
  await expect(first.getByText("Gizli")).toBeVisible();
  await page.goto("/az");
  await expect(page.locator('ul[aria-label="Partners"] li')).toHaveCount(2);
  await expect(page.locator('ul[aria-label="Partners"]')).not.toContainText(firstName);

  await page.goto("/admin/hero");
  await confirmDelete(page, page.locator("li:has(button[aria-label='Sürüşdür'])").last().getByRole("button", { name: "Sil" }));
  await toast(page, /Loqo silindi/);
  expect(await db.partnerLogo.count()).toBe(2);
});
