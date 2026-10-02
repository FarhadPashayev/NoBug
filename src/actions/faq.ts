"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { faqSchema } from "@/schemas/faq";
import { idSchema, reorderSchema } from "@/schemas/common";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;
// the FAQ renders on the home page and feeds llms.txt
const revalidate = () => revalidateSite("/llms.txt", "/llms-full.txt");

export async function listFaqs() {
  return guarded(async () => {
    assertDatabase();
    return prisma.faq.findMany({ orderBy: { order: "asc" } });
  });
}

export async function createFaq(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = faqSchema.parse(input);
    const last = await prisma.faq.aggregate({ _max: { order: true } });
    await prisma.faq.create({ data: { question: json(v.question), answer: json(v.answer), isActive: v.isActive, order: (last._max.order ?? -1) + 1 } });
    revalidate();
    return null;
  });
}

export async function updateFaq(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = faqSchema.parse(input);
    await prisma.faq.update({ where: { id: idSchema.parse(id) }, data: { question: json(v.question), answer: json(v.answer), isActive: v.isActive } });
    revalidate();
    return null;
  });
}

export async function deleteFaq(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    await prisma.faq.delete({ where: { id: idSchema.parse(id) } });
    revalidate();
    return null;
  });
}

export async function reorderFaqs(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.faq.update({ where: { id }, data: { order } })));
    revalidate();
    return null;
  });
}
