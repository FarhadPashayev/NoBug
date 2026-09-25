"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { deleteImages } from "@/lib/supabase";
import { asLocalized, t } from "@/lib/i18n/localized";
import { slugify } from "@/lib/utils";
import { projectSchema, type ProjectInput } from "@/schemas/projects";
import { idSchema, reorderSchema } from "@/schemas/common";
import { ActionError, guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;
const include = { tags: { select: { id: true, slug: true, name: true } } } as const;

function toRow(p: Prisma.ProjectGetPayload<{ include: typeof include }>) {
  return {
    id: p.id,
    slug: p.slug,
    title: asLocalized(p.title),
    shortDescription: asLocalized(p.shortDescription),
    content: asLocalized(p.content),
    duration: p.duration,
    year: p.year,
    cover: { url: p.coverUrl, path: p.coverPath },
    tags: p.tags.map((tg) => t(tg.name)),
    isFeatured: p.isFeatured,
    isPublished: p.isPublished,
    order: p.order,
    updatedAt: p.updatedAt,
  };
}
export type ProjectRow = ReturnType<typeof toRow>;

async function uniqueSlug(base: string, excludeId?: string) {
  const root = base || "layihe";
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const clash = await prisma.project.findFirst({ where: { slug: candidate, NOT: excludeId ? { id: excludeId } : undefined }, select: { id: true } });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  throw new ActionError("Slug üçün boş variant tapılmadı");
}

function tagOps(names: string[]) {
  const seen = new Set<string>();
  return names
    .map((n) => ({ name: n, slug: slugify(n) }))
    .filter((x) => x.slug && !seen.has(x.slug) && seen.add(x.slug))
    .map((x) => ({ where: { slug: x.slug }, create: { slug: x.slug, name: json({ az: x.name, en: "", ru: "" }) } }));
}

function data(v: ProjectInput) {
  return {
    title: json(v.title),
    shortDescription: json(v.shortDescription),
    content: json(v.content),
    duration: v.duration,
    year: v.year,
    coverUrl: v.cover.url,
    coverPath: v.cover.path,
    isFeatured: v.isFeatured,
    isPublished: v.isPublished,
  };
}

export async function listProjects() {
  return guarded(async () => {
    assertDatabase();
    const rows = await prisma.project.findMany({ orderBy: { order: "asc" }, include });
    return rows.map(toRow);
  });
}

export async function createProject(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = projectSchema.parse(input);
    const slug = await uniqueSlug(v.slug || slugify(v.title.az));
    const last = await prisma.project.aggregate({ _max: { order: true } });
    await prisma.project.create({ data: { ...data(v), slug, order: (last._max.order ?? -1) + 1, tags: { connectOrCreate: tagOps(v.tags) } } });
    revalidateSite();
    return null;
  });
}

export async function updateProject(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const pid = idSchema.parse(id);
    const v = projectSchema.parse(input);
    const previous = await prisma.project.findUniqueOrThrow({ where: { id: pid }, select: { coverPath: true } });
    const slug = await uniqueSlug(v.slug || slugify(v.title.az), pid);
    await prisma.project.update({ where: { id: pid }, data: { ...data(v), slug, tags: { set: [], connectOrCreate: tagOps(v.tags) } } });
    if (previous.coverPath && previous.coverPath !== v.cover.path) await deleteImages([previous.coverPath]);
    revalidateSite();
    return null;
  });
}

export async function deleteProject(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    const row = await prisma.project.delete({ where: { id: idSchema.parse(id) } });
    await deleteImages([row.coverPath]);
    revalidateSite();
    return null;
  });
}

export async function reorderProjects(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.project.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
