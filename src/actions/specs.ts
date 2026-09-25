"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { asLocalized, type Localized } from "@/lib/i18n/localized";
import { specGroupSchema, specItemSchema } from "@/schemas/specs";
import { idSchema, reorderSchema } from "@/schemas/common";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export type SpecItemRow = { id: string; groupId: string; name: Localized; value: string; unit: string; order: number };
export type SpecGroupRow = { id: string; name: Localized; order: number; items: SpecItemRow[] };

export async function listSpecs() {
  return guarded(async (): Promise<SpecGroupRow[]> => {
    assertDatabase();
    const groups = await prisma.specGroup.findMany({ orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } });
    return groups.map((g) => ({
      id: g.id,
      name: asLocalized(g.name),
      order: g.order,
      items: g.items.map((i) => ({ id: i.id, groupId: i.groupId, name: asLocalized(i.name), value: i.value, unit: i.unit, order: i.order })),
    }));
  });
}

export async function createSpecGroup(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = specGroupSchema.parse(input);
    const last = await prisma.specGroup.aggregate({ _max: { order: true } });
    const row = await prisma.specGroup.create({ data: { name: json(v.name), order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return row.id;
  });
}

export async function updateSpecGroup(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = specGroupSchema.parse(input);
    await prisma.specGroup.update({ where: { id: idSchema.parse(id) }, data: { name: json(v.name) } });
    revalidateSite();
    return null;
  });
}

export async function deleteSpecGroup(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    await prisma.specGroup.delete({ where: { id: idSchema.parse(id) } }); // items cascade
    revalidateSite();
    return null;
  });
}

export async function reorderSpecGroups(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.specGroup.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}

export async function createSpecItem(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = specItemSchema.parse(input);
    const last = await prisma.specItem.aggregate({ _max: { order: true }, where: { groupId: v.groupId } });
    const row = await prisma.specItem.create({ data: { groupId: v.groupId, name: json(v.name), value: v.value, unit: v.unit, order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return row.id;
  });
}

export async function updateSpecItem(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = specItemSchema.parse(input);
    await prisma.specItem.update({ where: { id: idSchema.parse(id) }, data: { groupId: v.groupId, name: json(v.name), value: v.value, unit: v.unit } });
    revalidateSite();
    return null;
  });
}

export async function deleteSpecItem(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    await prisma.specItem.delete({ where: { id: idSchema.parse(id) } });
    revalidateSite();
    return null;
  });
}

export async function reorderSpecItems(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.specItem.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
