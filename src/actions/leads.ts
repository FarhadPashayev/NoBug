"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { leadsToCsv } from "@/lib/admin/csv";
import { leadFilterSchema, leadUpdateSchema } from "@/schemas/leads";
import { idSchema } from "@/schemas/common";
import { guarded } from "./run";

const CAP = 1000;

function whereFor(input: unknown): Prisma.LeadWhereInput {
  const f = leadFilterSchema.parse(input);
  const where: Prisma.LeadWhereInput = {};
  if (f.status) where.status = f.status;
  if (f.q) where.OR = ["name", "email", "phone", "message", "service"].map((k) => ({ [k]: { contains: f.q, mode: "insensitive" } }));
  if (f.from || f.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = new Date(`${f.from}T00:00:00+04:00`);
    if (f.to) where.createdAt.lte = new Date(`${f.to}T23:59:59.999+04:00`);
  }
  return where;
}

/** Newest first; the client paginates. Capped so a runaway inbox stays fast. */
export async function listLeads(filter: unknown) {
  return guarded(async () => {
    assertDatabase();
    const where = whereFor(filter);
    const [items, total, fresh] = await Promise.all([prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: CAP }), prisma.lead.count({ where }), prisma.lead.count({ where: { status: "NEW" } })]);
    return { items, total, capped: total > CAP, fresh };
  });
}

export async function updateLead(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = leadUpdateSchema.parse(input);
    return prisma.lead.update({ where: { id: idSchema.parse(id) }, data: v });
  });
}

export async function deleteLead(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    await prisma.lead.delete({ where: { id: idSchema.parse(id) } });
    return null;
  });
}

/** UTF-8 BOM + semicolon separator so Excel (az/ru locales) opens it cleanly. */
export async function exportLeadsCsv(filter: unknown) {
  return guarded(async () => {
    assertDatabase();
    const rows = await prisma.lead.findMany({ where: whereFor(filter), orderBy: { createdAt: "desc" }, take: 5000 });
    return leadsToCsv(rows);
  });
}
