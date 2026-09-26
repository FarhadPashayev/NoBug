import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import { dialog, localized, row, toast } from "../helpers";

test("LEAD-08: the real public contact form creates a lead", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.waitForTimeout(3500); // the form rejects submits faster than 3 s
  const name = `Forma ${Date.now()}`;
  await page.fill("#k2-name", name);
  await page.fill("#k2-mail", "forma@example.com");
  await page.fill("#k2-msg", "Formadan sorğu");
  await page.locator('form:has(#k2-name) button[type="submit"]').click();
  await expect(page.locator('[role="status"]')).toBeVisible();
  await page.goto("/admin/leads");
  await expect(row(page, name)).toBeVisible();
});

test("LEAD-09..13 / LEAD-16: read-only inbox, status flow, notes, filters, search, pagination", async ({ page }) => {
  await page.goto("/admin/leads");
  await expect(page.getByRole("button", { name: /Əlavə et|Yeni/ })).toHaveCount(0);
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.getByText(/1–10 \//)).toBeVisible();
  await page.getByPlaceholder("Ad, e-poçt, mesaj…").fill("Müştəri 02");
  const r = row(page, "Müştəri 02");
  for (const s of ["IN_PROGRESS", "CONTACTED", "ARCHIVED"]) {
    await r.locator('select[aria-label="Status"]').selectOption(s);
    await toast(page, /Yeniləndi/);
    expect((await db.lead.findFirstOrThrow({ where: { name: "Müştəri 02" } })).status).toBe(s);
  }
  await r.getByRole("button", { name: "Müştəri 02" }).click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).locator("input:not([type=date])")).toHaveCount(0); // name/email/phone/message are text, not inputs
  await dialog(page).locator("#lead-notes").fill("e2e daxili qeyd");
  await dialog(page).locator("#lead-status").focus();
  await toast(page, /Yeniləndi/);
  expect((await db.lead.findFirstOrThrow({ where: { name: "Müştəri 02" } })).notes).toBe("e2e daxili qeyd");
  await page.keyboard.press("Escape");
  await page.getByPlaceholder("Ad, e-poçt, mesaj…").fill("");
  await page.locator('select[aria-label="Status"]').first().selectOption("ARCHIVED"); // toolbar filter is the first select
  await expect(page.locator("tbody tr")).toHaveCount(await db.lead.count({ where: { status: "ARCHIVED" } }));
  await page.getByRole("button", { name: "Təmizlə" }).click();
  await page.getByPlaceholder("Ad, e-poçt, mesaj…").fill("MUSTERI5@example.com");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByPlaceholder("Ad, e-poçt, mesaj…").fill("");
  await page.locator('input[aria-label="Başlanğıc tarix"]').fill("2026-09-01");
  await page.locator('input[aria-label="Son tarix"]').fill("2026-09-04");
  await expect(page.locator("tbody tr")).toHaveCount(await db.lead.count({ where: { createdAt: { gte: new Date("2026-09-01T00:00:00+04:00"), lte: new Date("2026-09-04T23:59:59+04:00") } } }));
});

test("LEAD-15: CSV export honours the active filter and is a BOM-prefixed, quoted file", async ({ page }) => {
  await page.goto("/admin/leads");
  await page.locator('select[aria-label="Status"]').first().selectOption("NEW");
  const expected = await db.lead.count({ where: { status: "NEW" } });
  await expect(page.locator("tbody tr")).toHaveCount(Math.min(expected, 10));
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV" }).click()]);
  const text = readFileSync(await download.path(), "utf8");
  expect(text.charCodeAt(0)).toBe(0xfeff);
  const lines = text.split("\r\n");
  expect(lines[0]).toContain('"Ad";"E-poçt"');
  expect(lines.length - 1).toBe(expected);
  expect(text).toContain('""dırnaq""'); // Müştəri 01 message with quotes, commas and a newline stays one record
  expect(text).toMatch(/Müştəri 01/);
});

test("SET-01..05: phones, email, address in every language, socials, footer links", async ({ page }) => {
  await page.goto("/admin/settings");
  await page.getByRole("button", { name: "Telefon", exact: true }).click();
  await page.getByRole("button", { name: "Telefon", exact: true }).click();
  const phones = page.getByPlaceholder("+994 XX XXX XX XX");
  await phones.nth(0).fill("+994 12 111 11 11");
  await phones.nth(1).fill("+994 50 222 22 22");
  await page.getByRole("button", { name: "Sil" }).first().click(); // remove the first phone → one left
  await page.fill("#email", "not-an-email");
  await page.fill("#linkedin", "linkedin");
  await page.getByRole("button", { name: "Yadda saxla" }).click();
  await expect(page.locator('[role="alert"]', { hasText: "Düzgün e-poçt deyil" })).toBeVisible();
  await expect(page.locator('[role="alert"]', { hasText: "Düzgün ünvan deyil" })).toBeVisible(); // SET-02
  await page.fill("#email", "e2e@nobug.az");
  await page.fill("#linkedin", "");
  await page.fill("#instagram", "https://instagram.com/nobug");
  await localized(page, "address").fill({ AZ: "Bakı, Nizami küç.", EN: "Baku, Nizami st.", RU: "Баку, ул. Низами" });
  await page.getByRole("button", { name: "Link əlavə et" }).click();
  const last = page.locator("div.grid.rounded-lg").last();
  await last.locator("select").selectOption("company");
  await localized(page, `footerLinks.${(await page.locator("div.grid.rounded-lg").count()) - 1}.label`).fill({ AZ: "E2E link" });
  await last.getByPlaceholder("#elaqe və ya /anket").fill("#top");
  // the list is flat (company links first, then services): walk the new link up until it sits above "Əlaqə"
  const links = () => page.locator("div.grid.rounded-lg");
  const total = await links().count();
  for (let i = total - 1; i > 2; i--) await links().nth(i).getByRole("button", { name: "Yuxarı" }).click();
  await page.getByRole("button", { name: "Yadda saxla" }).click();
  await toast(page, /yadda saxlanıldı/);
  expect(await db.siteSettings.count()).toBe(1);
  const s = await db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" }, include: { footerLinks: { orderBy: { order: "asc" } } } });
  expect(s.phones).toEqual(["+994 50 222 22 22"]);
  const company = s.footerLinks.filter((l) => l.group === "company").map((l) => (l.label as { az: string }).az);
  expect(company.indexOf("E2E link")).toBe(company.length - 2);
  for (const [l, addr] of [["az", "Bakı, Nizami küç."], ["en", "Baku, Nizami st."], ["ru", "Баку, ул. Низами"]]) {
    await page.goto(`/${l}`);
    const footer = page.locator("footer");
    await expect(footer).toContainText("+994 50 222 22 22");
    await expect(footer).toContainText(addr);
    await expect(footer).toContainText("e2e@nobug.az");
    await expect(footer.getByRole("link", { name: "Instagram" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveCount(0); // SET-03
    await expect(footer.getByRole("link", { name: "E2E link" })).toHaveAttribute("href", `/${l}#top`);
  }
});

test.describe("image upload component", () => {
  const hasStorage = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  test("UPL-02 / UPL-03 / UPL-07: client-side rejections and remove-before-save", async ({ page }) => {
    await page.goto("/admin/hero");
    const input = page.locator('input[type="file"]').first();
    let uploads = 0;
    page.on("request", (r) => r.url().includes("/api/admin/upload") && uploads++);
    await input.setInputFiles("tests/fixtures/too-large.jpg");
    await toast(page, /Maksimum 5 MB/);
    await input.setInputFiles("tests/fixtures/not-an-image.pdf");
    await toast(page, /Yalnız şəkil faylı/);
    expect(uploads).toBe(0);
    await input.setInputFiles("tests/fixtures/fake.jpg");
    await toast(page, /şəkil deyil/); // server-side sniffing
    expect(await page.locator('img[src*="hero/"]').count()).toBe(0);
    expect((await db.hero.findUniqueOrThrow({ where: { id: "singleton" } })).heroImageUrl).toBeNull();
  });

  test("UPL-01 / HERO-04 / HERO-05: drag-drop preview, upload on save, replace deletes the old file", async ({ page }) => {
    test.skip(!hasStorage, "needs Supabase test-bucket credentials in .env.test.local");
    await page.goto("/admin/hero");
    const input = page.locator('input[type="file"]').first();
    await input.setInputFiles("tests/fixtures/valid.jpg");
    await toast(page, /Şəkil yükləndi/);
    await expect(page.locator('img[src*="/hero/"]').first()).toBeVisible();
    await page.getByRole("button", { name: "Yadda saxla" }).first().click();
    await toast(page, /yadda saxlanıldı/);
    const first = await db.hero.findUniqueOrThrow({ where: { id: "singleton" } });
    expect(first.heroImagePath).toMatch(/^hero\//);
    expect((await page.request.get(first.heroImageUrl!)).status()).toBe(200);
    await page.getByRole("button", { name: "Dəyiş" }).first().click({ trial: true });
    await input.setInputFiles("tests/fixtures/valid.png");
    await toast(page, /Şəkil yükləndi/);
    await page.getByRole("button", { name: "Yadda saxla" }).first().click();
    await toast(page, /yadda saxlanıldı/);
    const second = await db.hero.findUniqueOrThrow({ where: { id: "singleton" } });
    expect(second.heroImagePath).not.toBe(first.heroImagePath);
    // the public CDN keeps serving a deleted object for a while — check the bucket itself
    const storage = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!).storage.from(process.env.MEDIA_BUCKET!);
    const inBucket = async (path: string) => ((await storage.list("hero")).data ?? []).some((o) => `hero/${o.name}` === path);
    await expect.poll(() => inBucket(first.heroImagePath!)).toBe(false);
    expect(await inBucket(second.heroImagePath!)).toBe(true);
    await page.getByRole("button", { name: "Sil" }).first().click();
    await page.getByRole("button", { name: "Yadda saxla" }).first().click();
    await toast(page, /yadda saxlanıldı/);
    await expect.poll(() => inBucket(second.heroImagePath!)).toBe(false);
  });
});
