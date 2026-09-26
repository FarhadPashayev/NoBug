import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ deleteImages: vi.fn(async () => {}), hasStorage: false, MEDIA_FOLDERS: ["hero", "partners", "projects", "services"] }));
import { revalidatePath } from "next/cache";
import { deleteImages } from "@/lib/supabase";
import { createProject, deleteProject, listProjects, reorderProjects, updateProject } from "@/actions/projects";
import { L, noImage, prisma, signInAsAdmin, signOut } from "./helpers";

const base = { shortDescription: L(""), content: L(""), duration: "", year: "2026", cover: noImage, tags: [] as string[], isFeatured: false, isPublished: true, slug: "" };
const made: string[] = [];
const create = async (over: Partial<typeof base> & { title: ReturnType<typeof L> }) => {
  const r = await createProject({ ...base, ...over });
  if (r.ok) {
    const row = await prisma.project.findFirstOrThrow({ orderBy: { createdAt: "desc" } });
    made.push(row.id);
    return row;
  }
  throw new Error(r.error);
};

beforeAll(signInAsAdmin);
afterAll(async () => {
  await prisma.project.deleteMany({ where: { id: { in: made } } });
  await prisma.tag.deleteMany({ where: { slug: { startsWith: "itest-" } } });
});

describe("projects actions", () => {
  it("AUTH-08: rejected without a session, nothing written", async () => {
    signOut();
    const before = await prisma.project.count();
    const r = await createProject({ ...base, title: L("Gizli") });
    expect(r.ok).toBe(false);
    expect(await prisma.project.count()).toBe(before);
    await signInAsAdmin();
  });

  it("PRJ-01: slug is transliterated from the AZ title and the page is revalidated", async () => {
    const row = await create({ title: L("İnteqrasiya şəbəkə layihəsi") });
    expect(row.slug).toBe("inteqrasiya-sebeke-layihesi");
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/az");
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/[lang]/layiheler/[slug]", "page");
  });

  it("PRJ-02: an explicit duplicate slug is a field error; an auto slug gets a suffix", async () => {
    const first = await create({ title: L("Dublikat"), slug: "itest-dup" });
    const r = await createProject({ ...base, title: L("Dublikat 2"), slug: "itest-dup" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.slug).toMatch(/artıq/);
    const auto = await create({ title: L("Dublikat") }); // derived slug "dublikat" — first one is "itest-dup", so this is free
    expect(auto.slug).toBe("dublikat");
    const auto2 = await create({ title: L("Dublikat") });
    expect(auto2.slug).toBe("dublikat-2");
    expect(first.id).not.toBe(auto.id);
  });

  it("PRJ-06: rich text is sanitized on save", async () => {
    const row = await create({ title: L("XSS"), content: L('<p>ok</p><script>alert(1)</script><a href="javascript:x">l</a>') });
    const content = row.content as { az: string };
    expect(content.az).not.toContain("<script");
    expect(content.az).not.toContain("javascript:");
    expect(content.az).toContain("<p>ok</p>");
  });

  it("PRJ-08: tags are shared rows; removing one from a project keeps the tag", async () => {
    const row = await create({ title: L("Teqli"), tags: ["itest-Alpha", "itest-Beta"] });
    const withTags = await prisma.project.findUniqueOrThrow({ where: { id: row.id }, include: { tags: true } });
    expect(withTags.tags.map((t) => t.slug).sort()).toEqual(["itest-alpha", "itest-beta"]);
    const r = await updateProject(row.id, { ...base, title: L("Teqli"), slug: row.slug, tags: ["itest-Alpha"] });
    expect(r.ok).toBe(true);
    const after = await prisma.project.findUniqueOrThrow({ where: { id: row.id }, include: { tags: true } });
    expect(after.tags.map((t) => t.slug)).toEqual(["itest-alpha"]);
    expect(await prisma.tag.findUnique({ where: { slug: "itest-beta" } })).not.toBeNull();
  });

  it("PRJ-11: reorder persists the given order", async () => {
    const a = await create({ title: L("Sıra A") });
    const b = await create({ title: L("Sıra B") });
    const r = await reorderProjects({ ids: [b.id, a.id] });
    expect(r.ok).toBe(true);
    const rows = await prisma.project.findMany({ where: { id: { in: [a.id, b.id] } }, orderBy: { order: "asc" } });
    expect(rows.map((x) => x.id)).toEqual([b.id, a.id]);
  });

  it("PRJ-12 / HERO-05 pattern: delete removes the row and the cover file", async () => {
    const row = await create({ title: L("Silinəcək"), cover: { url: "https://x/y.png", path: "projects/itest.png" } });
    const r = await deleteProject(row.id);
    expect(r.ok).toBe(true);
    expect(await prisma.project.findUnique({ where: { id: row.id } })).toBeNull();
    expect(vi.mocked(deleteImages)).toHaveBeenCalledWith(["projects/itest.png"]);
  });

  it("replacing the cover deletes the previous file", async () => {
    const row = await create({ title: L("Örtük"), cover: { url: "https://x/old.png", path: "projects/old.png" } });
    await updateProject(row.id, { ...base, title: L("Örtük"), slug: row.slug, cover: { url: "https://x/new.png", path: "projects/new.png" } });
    expect(vi.mocked(deleteImages)).toHaveBeenCalledWith(["projects/old.png"]);
  });

  it("listProjects returns localized shapes for the admin table", async () => {
    const r = await listProjects();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data[0].title).toEqual(expect.objectContaining({ az: expect.any(String) }));
      expect(r.data[0].cover).toHaveProperty("url");
      expect(r.data[0].cover).toHaveProperty("path");
    }
  });
});
