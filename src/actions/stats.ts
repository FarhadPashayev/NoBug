"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { statSchema } from "@/schemas/stats";
import { idSchema, reorderSchema } from "@/schemas/common";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function listStats() {
  return guarded(async () => {
    assertDatabase();
    return prisma.stat.findMany({ orderBy: { order: "asc" } });
  });
}

export async function createStat(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = statSchema.parse(input);
    const last = await prisma.stat.aggregate({ _max: { order: true } });
    await prisma.stat.create({ data: { value: v.value, label: json(v.label), source: json(v.source), order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return null;
  });
}

export async function updateStat(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = statSchema.parse(input);
    await prisma.stat.update({ where: { id: idSchema.parse(id) }, data: { value: v.value, label: json(v.label), source: json(v.source) } });
    revalidateSite();
    return null;
  });
}

export async function deleteStat(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    await prisma.stat.delete({ where: { id: idSchema.parse(id) } });
    revalidateSite();
    return null;
  });
}

export async function reorderStats(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.stat.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
