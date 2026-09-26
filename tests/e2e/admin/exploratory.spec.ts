import { expect, test } from "@playwright/test";
import { db } from "../db";
import { dialog, localized, openCreate, saveDialog, toast } from "../helpers";

const PAGES = ["", "/hero", "/projects", "/stats", "/services", "/specs", "/leads", "/settings", "/profile"];

test("§8: screenshots of every page in dark and light mode", async ({ page }) => {
  for (const theme of ["dark", "light"]) {
    for (const p of PAGES) {
      await page.goto(`/admin${p}`);
      await page.evaluate((t) => localStorage.setItem("theme", t), theme);
      await page.reload();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `tests/screenshots/${theme}${p.replace("/", "-") || "-dashboard"}.png`, fullPage: true });
    }
  }
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
});

test("§8: 1024 px width — tables scroll, layout does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  for (const p of ["/projects", "/leads", "/specs"]) {
    await page.goto(`/admin${p}`);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `tests/screenshots/w1024${p.replace("/", "-")}.png` });
  }
});

test("§8: rapid double-click on Save creates one record and one toast", async ({ page }) => {
  await page.goto("/admin/stats");
  const before = await db.stat.count();
  await openCreate(page);
  await page.fill("#f-value", "dbl");
  await localized(page, "label").fill({ AZ: "ikiqat klik" });
  await dialog(page).getByRole("button", { name: "Yadda saxla" }).dblclick();
  await toast(page, /Əlavə olundu/);
  await page.waitForTimeout(1500);
  expect(await db.stat.count()).toBe(before + 1);
  expect(await page.locator("[data-sonner-toast]", { hasText: "Əlavə olundu" }).count()).toBe(1);
  await db.stat.deleteMany({ where: { value: "dbl" } });
});

test("§8: refresh mid-edit leaves no partial write", async ({ page }) => {
  await page.goto("/admin/stats");
  const before = await db.stat.findMany({ orderBy: { order: "asc" } });
  await openCreate(page);
  await page.fill("#f-value", "yarımçıq");
  await page.reload();
  await expect(dialog(page)).toHaveCount(0);
  expect(await db.stat.findMany({ orderBy: { order: "asc" } })).toEqual(before);
});

test("§8: every form shows helpful errors for obviously invalid data", async ({ page }) => {
  await page.goto("/admin/projects");
  await openCreate(page);
  await page.fill("#f-year", "12");
  await page.fill("#f-slug", "Böyük Hərf");
  await saveDialog(page);
  const alerts = await dialog(page).locator('[role="alert"]').allTextContents();
  expect(alerts.join(" ")).toMatch(/Azərbaycanca doldurulmalıdır/);
  expect(alerts.join(" ")).toMatch(/2000–2100/);
  expect(alerts.join(" ")).toMatch(/kiçik latın/);
});
