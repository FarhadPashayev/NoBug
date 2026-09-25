"use server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, assertDatabase } from "@/lib/db";
import { deleteImages } from "@/lib/supabase";
import { heroSchema, partnerLogoSchema } from "@/schemas/hero";
import { idSchema, reorderSchema } from "@/schemas/common";
import { asLocalized } from "@/lib/i18n/localized";
import { guarded } from "./run";
import { revalidateSite } from "./revalidate";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function getHero() {
  return guarded(async () => {
    assertDatabase();
    const [hero, logos] = await Promise.all([prisma.hero.findUnique({ where: { id: "singleton" } }), prisma.partnerLogo.findMany({ orderBy: { order: "asc" } })]);
    return {
      hero: hero && {
        title: asLocalized(hero.title),
        subtitle: asLocalized(hero.subtitle),
        primaryCtaLabel: asLocalized(hero.primaryCtaLabel),
        primaryCtaUrl: hero.primaryCtaUrl,
        secondaryCtaLabel: asLocalized(hero.secondaryCtaLabel),
        secondaryCtaUrl: hero.secondaryCtaUrl,
        heroImage: { url: hero.heroImageUrl, path: hero.heroImagePath },
      },
      logos,
    };
  });
}

export async function saveHero(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = heroSchema.parse(input);
    const previous = await prisma.hero.findUnique({ where: { id: "singleton" }, select: { heroImagePath: true } });
    const data = {
      title: json(v.title),
      subtitle: json(v.subtitle),
      primaryCtaLabel: json(v.primaryCtaLabel),
      primaryCtaUrl: v.primaryCtaUrl,
      secondaryCtaLabel: json(v.secondaryCtaLabel),
      secondaryCtaUrl: v.secondaryCtaUrl,
      heroImageUrl: v.heroImage.url,
      heroImagePath: v.heroImage.path,
    };
    await prisma.hero.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...data }, update: data });
    if (previous?.heroImagePath && previous.heroImagePath !== v.heroImage.path) await deleteImages([previous.heroImagePath]);
    revalidateSite();
    return null;
  });
}

export async function createPartnerLogo(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = partnerLogoSchema.parse(input);
    const last = await prisma.partnerLogo.aggregate({ _max: { order: true } });
    await prisma.partnerLogo.create({ data: { name: v.name, logoUrl: v.logo.url!, logoPath: v.logo.path, url: v.url, isActive: v.isActive, order: (last._max.order ?? -1) + 1 } });
    revalidateSite();
    return null;
  });
}

export async function updatePartnerLogo(id: unknown, input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const v = partnerLogoSchema.parse(input);
    const previous = await prisma.partnerLogo.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { logoPath: true } });
    await prisma.partnerLogo.update({ where: { id: idSchema.parse(id) }, data: { name: v.name, logoUrl: v.logo.url!, logoPath: v.logo.path, url: v.url, isActive: v.isActive } });
    if (previous.logoPath && previous.logoPath !== v.logo.path) await deleteImages([previous.logoPath]);
    revalidateSite();
    return null;
  });
}

export async function deletePartnerLogo(id: unknown) {
  return guarded(async () => {
    assertDatabase();
    const row = await prisma.partnerLogo.delete({ where: { id: idSchema.parse(id) } });
    await deleteImages([row.logoPath]);
    revalidateSite();
    return null;
  });
}

export async function reorderPartnerLogos(input: unknown) {
  return guarded(async () => {
    assertDatabase();
    const { ids } = reorderSchema.parse(input);
    await prisma.$transaction(ids.map((id, order) => prisma.partnerLogo.update({ where: { id }, data: { order } })));
    revalidateSite();
    return null;
  });
}
