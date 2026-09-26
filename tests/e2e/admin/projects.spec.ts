import { expect, test } from "@playwright/test";
import { db } from "../db";
import { confirmDelete, dialog, dragHandle, localized, openCreate, row, saveDialog, toast } from "../helpers";

const stamp = () => Date.now().toString().slice(-6);

test("PRJ-01 / PRJ-14: create with transliterated slug; edit form pre-fills every language", async ({ page }) => {
  await page.goto("/admin/projects");
  await openCreate(page);
  const s = stamp();
  await localized(page, "title").fill({ AZ: `Şəbəkə güclü ıçün ${s}`, EN: `Network ${s}`, RU: `Сеть ${s}` });
  await page.fill("#f-year", "2026");
  await saveDialog(page);
  await toast(page, /Əlavə olundu/);
  const created = await db.project.findFirstOrThrow({ orderBy: { createdAt: "desc" } });
  expect(created.slug).toBe(`sebeke-guclu-icun-${s}`);
  await row(page, `Şəbəkə güclü ıçün ${s}`).getByRole("button", { name: "Redaktə et" }).click();
  await expect(dialog(page)).toBeVisible();
  const t = localized(page, "title");
  await expect(await t.use("EN")).toHaveValue(`Network ${s}`);
  await expect(await t.use("RU")).toHaveValue(`Сеть ${s}`);
  await expect(page.locator("#f-slug")).toHaveValue(created.slug);
  await page.keyboard.press("Escape");
});

test("PRJ-02 / PRJ-03 / PRJ-04 / PRJ-05: validation — duplicate slug, custom slug, empty AZ title, bad year", async ({ page }) => {
  await page.goto("/admin/projects");
  await openCreate(page);
  await saveDialog(page);
  await expect(dialog(page).locator('[role="alert"]', { hasText: "Azərbaycanca doldurulmalıdır" })).toBeVisible();
  await expect(dialog(page).locator('[role="alert"]', { hasText: /il/ })).toBeVisible();
  await localized(page, "title").fill({ EN: "Only English" });
  await page.fill("#f-year", "abcd");
  await saveDialog(page);
  await expect(localized(page, "title").tab("AZ").locator("span")).toHaveClass(/bg-ad-danger/);
  await localized(page, "title").fill({ AZ: "Xüsusi slug" });
  await page.fill("#f-year", "2026");
  await page.fill("#f-slug", "qaralama-layihe"); // exists in the seed
  await saveDialog(page);
  await expect(dialog(page).locator('[role="alert"]', { hasText: "artıq istifadə olunur" })).toBeVisible();
  const s = `xususi-${stamp()}`;
  await page.fill("#f-slug", s);
  await saveDialog(page);
  await toast(page, /Əlavə olundu/);
  expect(await db.project.findUnique({ where: { slug: s } })).not.toBeNull();
  const res = await page.request.get(`/az/layiheler/${s}`);
  expect(res.status()).toBe(200);
});

test("PRJ-06 / PRJ-09: Tiptap HTML renders on the detail page, scripts are stripped, unpublished is 404", async ({ page }) => {
  await page.goto("/admin/projects");
  await row(page, "Seçilmiş test layihəsi").getByRole("button", { name: "Redaktə et" }).click();
  const editor = dialog(page).locator(".rich-editor[contenteditable]");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await expect(editor).toHaveText("");
  // paste rich HTML the way an author pastes from a document, then use the toolbar for bold
  const html = '<h2>Alt başlıq</h2><p>Qalın mətn</p><ul><li>bir</li></ul><p><a href="https://nobug.az">link</a></p>';
  await editor.evaluate((el, h) => {
    const dt = new DataTransfer();
    dt.setData("text/html", h);
    dt.setData("text/plain", "Alt başlıq");
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  }, html);
  await expect(editor.locator("h2")).toHaveText("Alt başlıq");
  await expect(editor.locator("li")).toContainText("bir");
  await expect(editor.locator('a[href="https://nobug.az"]')).toHaveText("link");
  await page.keyboard.press("ControlOrMeta+a");
  await dialog(page).getByRole("button", { name: "Qalın", exact: true }).click();
  await expect(editor.locator("strong").first()).toContainText("Alt başlıq");
  await saveDialog(page);
  await toast(page, /Yeniləndi/);
  const stored = (await db.project.findUniqueOrThrow({ where: { slug: "test-secilmis-layihe" } })).content as { az: string };
  expect(stored.az).toContain("<strong>");
  expect(stored.az).toMatch(/<h2>(<strong>)?Alt başlıq(<\/strong>)?<\/h2>/);
  expect(stored.az).toContain("<li>");
  expect(stored.az).toContain('href="https://nobug.az"');
  // script injected straight into the DB must not execute or render
  await db.project.update({ where: { slug: "test-secilmis-layihe" }, data: { content: { az: '<p>ok</p><script>document.title="pwned"</script><img src=x onerror="document.title=\'pwned\'">', en: "", ru: "" } } });
  await page.goto("/az/layiheler/test-secilmis-layihe");
  await expect(page.locator(".rich-text")).toContainText("ok");
  expect(await page.title()).not.toBe("pwned");
  expect(await page.locator(".rich-text script").count()).toBe(0);
  expect((await page.request.get("/az/layiheler/qaralama-layihe")).status()).toBe(404);
  expect((await page.request.get("/az/layiheler/does-not-exist")).status()).toBe(404);
});

test("PRJ-10 / I18N-08: featured first publicly; AZ-only project shows AZ text in /en", async ({ page }) => {
  await page.goto("/en");
  const titles = await page.locator("#layiheler h3").allTextContents();
  expect(titles.slice(0, 2)).toEqual(expect.arrayContaining(["Corporate site and content panel", "Featured test project"]));
  expect(titles).toContain("Yalnız AZ layihə");
  expect(titles).not.toContain("Draft project");
  expect(await page.locator("body").innerText()).not.toContain("undefined");
});

test("PRJ-08: tags are created and linked", async ({ page }) => {
  await page.goto("/admin/projects");
  await row(page, "Yalnız AZ layihə").getByRole("button", { name: "Redaktə et" }).click();
  await page.fill("#f-tags", "E2E Teq, Başqa teq");
  await page.locator("#f-year").focus(); // blur commits the tag list
  await saveDialog(page);
  await toast(page, /Yeniləndi/);
  const p = await db.project.findUniqueOrThrow({ where: { slug: "yalniz-az-layihe" }, include: { tags: true } });
  expect(p.tags.map((t) => t.slug).sort()).toEqual(["basqa-teq", "e2e-teq"]);
});

test("PRJ-11: drag-and-drop reorder persists and drives the public order", async ({ page }) => {
  await page.goto("/admin/projects");
  await page.getByRole("button", { name: "Sıranı dəyiş" }).click();
  const handles = dialog(page).locator('button[aria-label="Sürüşdür"]');
  const count = await handles.count();
  expect(count).toBeGreaterThanOrEqual(5);
  const labels = async () => (await dialog(page).locator("li span.block").allTextContents()).map((s) => s.replace(/^\d+\s*/, ""));
  const before = await labels();
  await dragHandle(page, handles.last(), handles.first());
  const after = await labels();
  expect(after[0]).toBe(before.at(-1));
  await dialog(page).getByRole("button", { name: "Yadda saxla" }).click();
  await toast(page, /Sıra yadda saxlanıldı/);
  await page.reload();
  const first = await page.locator("tbody tr").first().textContent();
  expect(first).toContain(after[0]!);
});

test("PRJ-13: search in any language, sort by year, paginate 10 + 5", async ({ page }) => {
  const extra = Array.from({ length: 10 }, (_, i) => ({ slug: `pg-${i}`, title: { az: `Səhifələmə ${i}`, en: `Paging ${i}`, ru: "" }, shortDescription: { az: "", en: "", ru: "" }, content: { az: "", en: "", ru: "" }, year: String(2001 + i), order: 100 + i }));
  await db.project.createMany({ data: extra });
  try {
    const total = await db.project.count();
    expect(total).toBeGreaterThanOrEqual(15);
    await page.goto("/admin/projects");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await expect(page.getByText(new RegExp(`1–10 / ${total}`))).toBeVisible();
    const seen = new Set<string>();
    for (const r of await page.locator("tbody tr").allTextContents()) seen.add(r);
    await page.getByRole("button", { name: "Növbəti səhifə" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(Math.min(10, total - 10));
    for (const r of await page.locator("tbody tr").allTextContents()) expect(seen.has(r)).toBe(false);
    await page.getByPlaceholder("Layihə axtar…").fill("Paging 3");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByPlaceholder("Layihə axtar…").fill("");
    await page.getByRole("button", { name: "İl" }).click();
    const years = await page.locator("tbody tr td:nth-child(2)").allTextContents();
    expect(years).toEqual([...years].sort());
  } finally {
    await db.project.deleteMany({ where: { slug: { startsWith: "pg-" } } });
  }
});

test("PRJ-12: delete asks for confirmation and removes the row", async ({ page }) => {
  await db.project.create({ data: { slug: "silinecek", title: { az: "Silinəcək layihə", en: "", ru: "" }, shortDescription: {}, content: {}, year: "2026", order: 999 } });
  await page.goto("/admin/projects");
  const r = row(page, "Silinəcək layihə");
  await r.getByRole("button", { name: "Sil" }).click();
  await expect(dialog(page)).toContainText("Layihə silinsin?");
  await dialog(page).getByRole("button", { name: "İmtina" }).click();
  expect(await db.project.findUnique({ where: { slug: "silinecek" } })).not.toBeNull();
  await confirmDelete(page, r.getByRole("button", { name: "Sil" }));
  await toast(page, /Silindi/);
  expect(await db.project.findUnique({ where: { slug: "silinecek" } })).toBeNull();
});
