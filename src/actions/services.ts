"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { deleteImages } from "@/lib/supabase";
import { asLocalized } from "@/lib/i18n/localized";
import { slugify } from "@/lib/utils";
import { icons } from "lucide-react";
import { sanitizeLocalized } from "@/lib/sanitize";
import { serviceCategorySchema, serviceSchema } from "@/schemas/services";
import { idSchema, reorderSchema } from "@/schemas/common";
import { ActionError, guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;
const include = { category: { select: { id: true, name: true } } } as const;

function toRow(s: Prisma.ServiceGetPayload<{ include: typeof include }>) {
  return {
    id: s.id,
    slug: s.slug,
    name: asLocalized(s.name),
    shortDescription: asLocalized(s.shortDescription),
    details: asLocalized(s.details),
    icon: s.icon,
    image: { url: s.imageUrl, path: s.imagePath },
    categoryId: s.categoryId,
    category: s.category && { id: s.category.id, name: asLocalized(s.category.name) },
    isActive: s.isActive,
    order: s.order,
  };
}
export type ServiceRow = ReturnType<typeof toRow>;
export type ServiceCategoryRow = { id: string; slug: string; name: ReturnType<typeof asLocalized>; order: number; count: number };

/** A slug the user typed must be free; one derived from the name gets a numeric suffix. */
async function resolveSlug(model: "service" | "serviceCategory", explicit: string, name: string, excludeId?: string) {
  if (explicit) {
    const where = { slug: explicit, NOT: excludeId ? { id: excludeId } : undefined };
    const clash = model === "service" ? await prisma.service.findFirst({ where, select: { id: true } }) : await prisma.serviceCategory.findFirst({ where, select: { id: true } });
    if (clash) throw new ActionError("Formda xəta var", { slug: "Bu slug artıq istifadə olunur" });
    return explicit;
  }
  return uniqueSlug(model, slugify(name), excludeId);
}

async function uniqueSlug(model: "service" | "serviceCategory", base: string, excludeId?: string) {
  const root = base || model;
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const where = { slug: candidate, NOT: excludeId ? { id: excludeId } : undefined };
    const clash = model === "service" ? await prisma.service.findFirst({ where, select: { id: true } }) : await prisma.serviceCategory.findFirst({ where, select: { id: true } });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  throw new ActionError("Slug üçün boş variant tapılmadı");
}

// ── services ───────────────────────────────────────────────────────────────

export async function listServices() {
  return guarded(async () => {
    assertDatabase();
    return (await prisma.service.findMany({ orderBy: { order: "asc" }, include })).map(toRow);
  });
}

function checkIcon(name: string) {
  if (name && !(name in icons)) throw new ActionError("Formda xəta var", { icon: "Belə Lucide ikonu yoxdur" });
}

export async function createService(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = serviceSchema.parse(input);
    checkIcon(v.icon);
    const slug = await resolveSlug("service", v.slug, v.name.az);
    const last = await prisma.service.aggregate({ _max: { order: true } });
    await prisma.service.create({
      data: {
        slug,
        name: json(v.name),
        shortDescription: json(v.shortDescription),
        details: json(sanitizeLocalized(v.details)),
        icon: v.icon,
        imageUrl: v.image.url,
        imagePath: v.image.path,
        categoryId: v.categoryId,
        isActive: v.isActive,
        order: (last._max.order ?? -1) + 1,
      },
    });
    revalidateSite("/anket");
    return null;
  });
}

export async function updateService(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const sid = idSchema.parse(id);
    const v = serviceSchema.parse(input);
    checkIcon(v.icon);
    const previous = await prisma.service.findUniqueOrThrow({ where: { id: sid }, select: { imagePath: true } });
    const slug = await resolveSlug("service", v.slug, v.name.az, sid);
    await prisma.service.update({
      where: { id: sid },
      data: { slug, name: json(v.name), shortDescription: json(v.shortDescription), details: json(sanitizeLocalized(v.details)), icon: v.icon, imageUrl: v.image.url, imagePath: v.image.path, categoryId: v.categoryId, isActive: v.isActive },
    });
    if (previous.imagePath && previous.imagePath !== v.image.path) await deleteImages([previous.imagePath]);
    revalidateSite("/anket");
    return null;
  });
}

export async function deleteService(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    const row = await prisma.service.delete({ where: { id: idSchema.parse(id) } });
    await deleteImages([row.imagePath]);
    revalidateSite("/anket");
    return null;
  });
}

export async function reorderServices(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.service.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}

// ── categories ─────────────────────────────────────────────────────────────

export async function listServiceCategories() {
  return guarded(async (): Promise<ServiceCategoryRow[]> => {
    assertDatabase();
    const rows = await prisma.serviceCategory.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { services: true } } } });
    return rows.map((c) => ({ id: c.id, slug: c.slug, name: asLocalized(c.name), order: c.order, count: c._count.services }));
  });
}

export async function createServiceCategory(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = serviceCategorySchema.parse(input);
    const slug = await resolveSlug("serviceCategory", v.slug, v.name.az);
    const last = await prisma.serviceCategory.aggregate({ _max: { order: true } });
    await prisma.serviceCategory.create({ data: { slug, name: json(v.name), order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return null;
  });
}

export async function updateServiceCategory(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const cid = idSchema.parse(id);
    const v = serviceCategorySchema.parse(input);
    const slug = await resolveSlug("serviceCategory", v.slug, v.name.az, cid);
    await prisma.serviceCategory.update({ where: { id: cid }, data: { slug, name: json(v.name) } });
    revalidateSite();
    return null;
  });
}

export async function deleteServiceCategory(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    // explicit rule: a category is deleted only once it is empty
    const cid = idSchema.parse(id);
    const used = await prisma.service.count({ where: { categoryId: cid } });
    if (used) throw new ActionError(`Kateqoriyada ${used} xidmət var — əvvəlcə onları başqa kateqoriyaya keçirin`);
    await prisma.serviceCategory.delete({ where: { id: cid } });
    revalidateSite();
    return null;
  });
}

export async function reorderServiceCategories(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.serviceCategory.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
