"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { asLocalized } from "@/lib/i18n/localized";
import { settingsSchema, type FooterGroup } from "@/schemas/settings";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function getSettings() {
  return guarded(async () => {
    assertDatabase();
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { footerLinks: { orderBy: [{ group: "asc" }, { order: "asc" }] } } });
    if (!s) return null;
    return {
      phones: s.phones.map((value) => ({ value })),
      email: s.email,
      address: asLocalized(s.address),
      hours: asLocalized(s.hours),
      linkedin: s.linkedin,
      instagram: s.instagram,
      facebook: s.facebook,
      youtube: s.youtube,
      x: s.x,
      footerLinks: s.footerLinks.map((l) => ({ id: l.id, group: l.group as FooterGroup, label: asLocalized(l.label), url: l.url })),
    };
  });
}

export async function saveSettings(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = settingsSchema.parse(input);
    const data = {
      phones: v.phones.map((p) => p.value),
      email: v.email,
      address: json(v.address),
      hours: json(v.hours),
      linkedin: v.linkedin,
      instagram: v.instagram,
      facebook: v.facebook,
      youtube: v.youtube,
      x: v.x,
    };
    // the link list is small: replace it wholesale, order = position in the form
    await prisma.$transaction([
      prisma.siteSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...data }, update: data }),
      prisma.footerLink.deleteMany({ where: { settingsId: "singleton" } }),
      prisma.footerLink.createMany({ data: v.footerLinks.map((l, order) => ({ settingsId: "singleton", group: l.group, label: json(l.label), url: l.url, order })) }),
    ]);
    revalidateSite("/anket");
    return null;
  });
}
