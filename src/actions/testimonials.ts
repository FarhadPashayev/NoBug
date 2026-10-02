"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { deleteImages } from "@/lib/supabase";
import { testimonialSchema } from "@/schemas/testimonials";
import { idSchema, reorderSchema } from "@/schemas/common";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;

type Row = Awaited<ReturnType<typeof prisma.testimonial.findMany>>[number];
const toClient = (r: Row) => ({
  id: r.id,
  name: r.name,
  role: r.role,
  quote: r.quote,
  rating: r.rating,
  avatar: { url: r.avatarUrl, path: r.avatarPath },
  photo: { url: r.photoUrl, path: r.photoPath },
  isFeatured: r.isFeatured,
  isActive: r.isActive,
  order: r.order,
});

export async function listTestimonials() {
  return guarded(async () => {
    assertDatabase();
    return (await prisma.testimonial.findMany({ orderBy: { order: "asc" } })).map(toClient);
  });
}

const data = (v: ReturnType<typeof testimonialSchema.parse>) => ({
  name: v.name,
  role: json(v.role),
  quote: json(v.quote),
  rating: v.rating,
  avatarUrl: v.avatar.url,
  avatarPath: v.avatar.path,
  photoUrl: v.photo.url,
  photoPath: v.photo.path,
  isFeatured: v.isFeatured,
  isActive: v.isActive,
});

export async function createTestimonial(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = testimonialSchema.parse(input);
    const last = await prisma.testimonial.aggregate({ _max: { order: true } });
    await prisma.testimonial.create({ data: { ...data(v), order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return null;
  });
}

export async function updateTestimonial(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const tid = idSchema.parse(id);
    const v = testimonialSchema.parse(input);
    const previous = await prisma.testimonial.findUniqueOrThrow({ where: { id: tid }, select: { avatarPath: true, photoPath: true } });
    await prisma.testimonial.update({ where: { id: tid }, data: data(v) });
    // replaced files are removed from storage
    const stale = [previous.avatarPath !== v.avatar.path ? previous.avatarPath : null, previous.photoPath !== v.photo.path ? previous.photoPath : null];
    if (stale.some(Boolean)) await deleteImages(stale);
    revalidateSite();
    return null;
  });
}

export async function deleteTestimonial(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    const row = await prisma.testimonial.delete({ where: { id: idSchema.parse(id) } });
    await deleteImages([row.avatarPath, row.photoPath]);
    revalidateSite();
    return null;
  });
}

export async function reorderTestimonials(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.testimonial.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
