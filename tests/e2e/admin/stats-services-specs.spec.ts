import { expect, test } from "@playwright/test";
import { db } from "../db";
import { confirmDelete, dialog, dragHandle, localized, openCreate, row, saveDialog, toast } from "../helpers";

test("STAT-01..04: create '<2 saat', validation, reorder, delete; public shows it escaped", async ({ page }) => {
  await page.goto("/admin/stats");
  await openCreate(page);
  await page.fill("#f-value", "<2 saat");
  await saveDialog(page);
  await expect(dialog(page).locator('[role="alert"]')).toBeVisible(); // STAT-03 empty AZ label
  await localized(page, "label").fill({ AZ: "e2e cavab", EN: "e2e reply" });
  await saveDialog(page);
  await toast(page, /Əlavə olundu/);
  await expect(row(page, "<2 saat")).toBeVisible();
  await page.goto("/az");
  await expect(page.locator("section", { hasText: "e2e cavab" })).toContainText("<2 saat");
  await page.goto("/admin/stats");
  await page.getByRole("button", { name: "Sıranı dəyiş" }).click();
  const handles = dialog(page).locator('button[aria-label="Sürüşdür"]');
  await dragHandle(page, handles.last(), handles.first());
  await dialog(page).getByRole("button", { name: "Yadda saxla" }).click();
  await toast(page, /Sıra yadda saxlanıldı/);
  expect((await db.stat.findFirstOrThrow({ orderBy: { order: "asc" } })).value).toBe("<2 saat");
  await page.goto("/az");
  const firstFigure = await page.locator("section:has-text('e2e cavab') .tabular-nums, section:has-text('e2e cavab') div.font-semibold").first().textContent();
  expect(firstFigure).toContain("<2 saat");
  await page.goto("/admin/stats");
  await confirmDelete(page, row(page, "<2 saat").getByRole("button", { name: "Sil" }));
  await toast(page, /Silindi/);
  expect(await db.stat.findFirst({ where: { value: "<2 saat" } })).toBeNull();
});

test("SVC-01 / SVC-03 / SVC-04 / SVC-05 / SVC-07: categories, icons, images, visibility", async ({ page }) => {
  await page.goto("/admin/services");
  await page.getByRole("tab", { name: "Kateqoriyalar" }).click();
  await openCreate(page);
  await localized(page, "name").fill({ AZ: "E2E kateqoriya", EN: "E2E category" });
  await saveDialog(page);
  await toast(page, /Əlavə olundu/);
  await page.getByRole("tab", { name: "Xidmətlər" }).click();
  await openCreate(page);
  await localized(page, "name").fill({ AZ: "E2E xidmət", EN: "E2E service" });
  await page.selectOption("#f-categoryId", { label: "E2E kateqoriya" });
  await page.fill("#f-icon", "NotAnIcon");
  await saveDialog(page);
  await expect(dialog(page).locator('[role="alert"]', { hasText: /Lucide/ })).toBeVisible();
  await page.fill("#f-icon", "Shield");
  await page.fill("#f-slug", "qa"); // SVC-07 duplicate slug
  await saveDialog(page);
  await expect(dialog(page).locator('[role="alert"]', { hasText: /artıq/ })).toBeVisible();
  await page.fill("#f-slug", "e2e-xidmet");
  await saveDialog(page);
  await toast(page, /Əlavə olundu/);
  await page.getByPlaceholder("Xidmət axtar…").fill("E2E xidmət"); // the new row is on page 2 otherwise
  await expect(row(page, "E2E xidmət")).toContainText("E2E kateqoriya");

  await page.goto("/az");
  const card = page.locator('a[href*="xidmet=e2e-xidmet"]');
  await expect(card).toBeVisible();
  await expect(card.locator('[data-icon="Shield"] svg')).toBeVisible(); // SVC-03 renders the lucide icon
  const webCard = page.locator('a[href*="xidmet=web"]');
  await expect(webCard.locator("img").first()).toHaveAttribute("src", /services\.webp/); // SVC-04 uploaded image wins

  await page.goto("/admin/services");
  await page.getByPlaceholder("Xidmət axtar…").fill("E2E xidmət");
  await row(page, "E2E xidmət").getByRole("button", { name: "Redaktə et" }).click();
  await dialog(page).locator("#f-isActive").click();
  await saveDialog(page);
  await toast(page, /Yeniləndi/);
  await page.goto("/az");
  await expect(page.locator('a[href*="xidmet=e2e-xidmet"]')).toHaveCount(0); // SVC-05
});

test("SVC-02 / SVC-06: category with services cannot be deleted; empty one can; reorder both", async ({ page }) => {
  await page.goto("/admin/services");
  await page.getByRole("tab", { name: "Kateqoriyalar" }).click();
  await confirmDelete(page, row(page, "E2E kateqoriya").getByRole("button", { name: "Sil" }));
  await toast(page, /xidmət var/);
  expect(await db.serviceCategory.findUnique({ where: { slug: "e2e-kateqoriya" } })).not.toBeNull();
  await page.getByRole("button", { name: "Sıranı dəyiş" }).click();
  const h = dialog(page).locator('button[aria-label="Sürüşdür"]');
  await dragHandle(page, h.last(), h.first());
  await dialog(page).getByRole("button", { name: "Yadda saxla" }).click();
  await toast(page, /Sıra yadda saxlanıldı/);
  expect((await db.serviceCategory.findFirstOrThrow({ orderBy: { order: "asc" } })).slug).toBe("e2e-kateqoriya");
  await db.service.update({ where: { slug: "e2e-xidmet" }, data: { categoryId: null } });
  await page.reload();
  await page.getByRole("tab", { name: "Kateqoriyalar" }).click();
  await confirmDelete(page, row(page, "E2E kateqoriya").getByRole("button", { name: "Sil" }));
  await toast(page, /Silindi/);
  await db.service.delete({ where: { slug: "e2e-xidmet" } });
});

test("SPEC-01..04: inline edit, empty unit, add + reorder items, delete group with items", async ({ page }) => {
  await page.goto("/admin/specs");
  const groupA = page.locator('[data-group="Test qrupu A"]');
  const cell = groupA.locator('input[aria-label="Alət"]').first();
  await cell.fill("A1 alət v2");
  await cell.press("Enter");
  await toast(page, /Yadda saxlanıldı/);
  expect(await db.specItem.findFirst({ where: { value: "A1 alət v2" } })).not.toBeNull();
  await page.goto("/az");
  await expect(page.locator("#texnologiya")).toContainText("A1 alət v2");

  await page.goto("/admin/specs");
  const unit = page.locator('[data-group="Test qrupu A"] input[aria-label="Vəziyyət"]').first();
  await unit.fill("");
  await unit.press("Enter"); // SPEC-02 — empty unit allowed (allowEmpty on non-required cells)
  await page.locator('[data-group="Test qrupu A"]').getByRole("button", { name: "Sətir" }).click();
  await expect(page.locator('[data-group="Test qrupu A"] input[aria-label="Alət"]')).toHaveCount(4);
  await page.waitForLoadState("networkidle");
  const rowsA = page.locator('[data-group="Test qrupu A"] button[aria-label="Sürüşdür"]');
  await dragHandle(page, rowsA.last(), rowsA.first());
  await toast(page, /Sıra yadda saxlanıldı/);
  const g = await db.specGroup.findFirstOrThrow({ where: { name: { path: ["az"], equals: "Test qrupu A" } }, include: { items: { orderBy: { order: "asc" } } } });
  expect(g.items[0].value).toBe("—"); // the new row moved to the top
  await confirmDelete(page, page.locator('[data-group="Test qrupu B"]').getByRole("button", { name: "Qrupu sil" }));
  await toast(page, /Qrup silindi/);
  expect(await db.specGroup.findFirst({ where: { name: { path: ["az"], equals: "Test qrupu B" } } })).toBeNull();
});
