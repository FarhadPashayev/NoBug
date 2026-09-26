import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ deleteImages: vi.fn(async () => {}), hasStorage: false, MEDIA_FOLDERS: ["hero", "partners", "projects", "services"] }));
import { createService, createServiceCategory, deleteService, deleteServiceCategory, reorderServiceCategories, reorderServices, updateService } from "@/actions/services";
import { createStat, deleteStat, reorderStats, updateStat } from "@/actions/stats";
import { createSpecGroup, createSpecItem, deleteSpecGroup, deleteSpecItem, listSpecs, reorderSpecItems, updateSpecItem } from "@/actions/specs";
import { L, noImage, prisma, signInAsAdmin } from "./helpers";

beforeAll(signInAsAdmin);
afterAll(async () => {
  await prisma.service.deleteMany({ where: { slug: { startsWith: "itest-" } } });
  await prisma.serviceCategory.deleteMany({ where: { slug: { startsWith: "itest-" } } });
  await prisma.stat.deleteMany({ where: { value: { startsWith: "itest" } } });
  await prisma.specGroup.deleteMany({ where: { name: { path: ["az"], string_starts_with: "itest" } } });
});

const svc = (over: Record<string, unknown>) => ({ slug: "", name: L("Xidmət"), shortDescription: L(""), details: L(""), icon: "", image: noImage, categoryId: null, isActive: true, ...over });

describe("services & categories", () => {
  it("SVC-01 / SVC-07: category + service; explicit duplicate service slug is rejected", async () => {
    expect((await createServiceCategory({ slug: "itest-cat", name: L("Test kateqoriya") })).ok).toBe(true);
    const cat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "itest-cat" } });
    expect((await createService(svc({ slug: "itest-svc", name: L("Test xidmət"), categoryId: cat.id }))).ok).toBe(true);
    const dup = await createService(svc({ slug: "itest-svc", name: L("Yenə") }));
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.fieldErrors?.slug).toBeTruthy();
  });

  it("SVC-03: an unknown lucide icon name is a field error, a real one is stored", async () => {
    const bad = await createService(svc({ slug: "itest-icon-bad", name: L("İkon"), icon: "NotAnIcon" }));
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.fieldErrors?.icon).toMatch(/Lucide/);
    expect((await createService(svc({ slug: "itest-icon-ok", name: L("İkon"), icon: "Shield" }))).ok).toBe(true);
    expect((await prisma.service.findUniqueOrThrow({ where: { slug: "itest-icon-ok" } })).icon).toBe("Shield");
  });

  it("SVC-02: a category that still has services cannot be deleted; an empty one can", async () => {
    const cat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "itest-cat" } });
    const blocked = await deleteServiceCategory(cat.id);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toMatch(/xidmət var/);
    expect(await prisma.serviceCategory.findUnique({ where: { id: cat.id } })).not.toBeNull();
    await createServiceCategory({ slug: "itest-empty", name: L("Boş") });
    const empty = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "itest-empty" } });
    expect((await deleteServiceCategory(empty.id)).ok).toBe(true);
  });

  it("SVC-06: services and categories reorder independently", async () => {
    const [a, b] = await prisma.service.findMany({ where: { slug: { in: ["itest-svc", "itest-icon-ok"] } }, orderBy: { slug: "asc" } });
    expect((await reorderServices({ ids: [b.id, a.id] })).ok).toBe(true);
    const after = await prisma.service.findMany({ where: { id: { in: [a.id, b.id] } }, orderBy: { order: "asc" } });
    expect(after[0].id).toBe(b.id);
    const cats = await prisma.serviceCategory.findMany({ orderBy: { order: "asc" } });
    expect((await reorderServiceCategories({ ids: cats.map((c) => c.id).reverse() })).ok).toBe(true);
    const catsAfter = await prisma.serviceCategory.findMany({ orderBy: { order: "asc" } });
    expect(catsAfter[0].id).toBe(cats.at(-1)!.id);
    await reorderServiceCategories({ ids: cats.map((c) => c.id) }); // restore
  });

  it("SVC-05 / delete: isActive persists; delete removes the row and its image", async () => {
    const row = await prisma.service.findUniqueOrThrow({ where: { slug: "itest-svc" } });
    expect((await updateService(row.id, svc({ slug: "itest-svc", name: L("Test xidmət"), isActive: false }))).ok).toBe(true);
    expect((await prisma.service.findUniqueOrThrow({ where: { id: row.id } })).isActive).toBe(false);
    expect((await deleteService(row.id)).ok).toBe(true);
    expect(await prisma.service.findUnique({ where: { id: row.id } })).toBeNull();
  });
});

describe("stats", () => {
  it("STAT-01..04: create keeps '<2 saat', reorder, update, missing AZ label rejected, delete", async () => {
    expect((await createStat({ value: "itest <2 saat", label: L("cavab") })).ok).toBe(true);
    expect((await createStat({ value: "itest 2", label: L("iki") })).ok).toBe(true);
    const [a, b] = await prisma.stat.findMany({ where: { value: { startsWith: "itest" } }, orderBy: { order: "asc" } });
    expect(a.value).toBe("itest <2 saat");
    expect((await reorderStats({ ids: [b.id, a.id] })).ok).toBe(true);
    expect((await prisma.stat.findUniqueOrThrow({ where: { id: b.id } })).order).toBeLessThan((await prisma.stat.findUniqueOrThrow({ where: { id: a.id } })).order);
    const bad = await updateStat(a.id, { value: "x", label: L("") });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.fieldErrors?.["label.az"]).toBeTruthy();
    expect((await deleteStat(a.id)).ok).toBe(true);
    expect(await prisma.stat.findUnique({ where: { id: a.id } })).toBeNull();
  });
});

describe("tech specs", () => {
  it("SPEC-01..04: inline update, optional unit, add + reorder items, group delete cascades", async () => {
    const g = await createSpecGroup({ name: L("itest qrup") });
    expect(g.ok).toBe(true);
    const groupId = g.ok ? g.data : "";
    for (const n of ["bir", "iki"]) expect((await createSpecItem({ groupId, name: L(n), value: `${n} alət`, unit: "" })).ok).toBe(true);
    const items = await prisma.specItem.findMany({ where: { groupId }, orderBy: { order: "asc" } });
    expect(items).toHaveLength(2);
    expect(items[0].unit).toBe("");
    expect((await updateSpecItem(items[0].id, { groupId, name: L("bir"), value: "Azure Backup v2", unit: "" })).ok).toBe(true);
    expect((await prisma.specItem.findUniqueOrThrow({ where: { id: items[0].id } })).value).toBe("Azure Backup v2");
    expect((await reorderSpecItems({ ids: [items[1].id, items[0].id] })).ok).toBe(true);
    const listed = await listSpecs();
    if (listed.ok) expect(listed.data.find((x) => x.id === groupId)!.items[0].id).toBe(items[1].id);
    expect((await deleteSpecItem(items[1].id)).ok).toBe(true);
    expect((await deleteSpecGroup(groupId)).ok).toBe(true);
    expect(await prisma.specItem.count({ where: { groupId } })).toBe(0);
  });
});
