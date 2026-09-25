import bcrypt from "bcryptjs";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { DICT } from "@/lib/i18n/dict";
import { loc, type Localized } from "@/lib/i18n/localized";
import { FOOTER_SERVICES, LEGACY_ORDER, PRIMARY_SERVICES, SECONDARY_SERVICES } from "@/lib/services";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";
import { slugify } from "@/lib/utils";

// Moves the copy that ships in src/lib/i18n/dict.ts into the database in all
// three languages, so the site renders identically once it reads from the DB.
// Idempotent: re-running updates the same rows (slug / singleton ids).
// Used by `prisma/seed.ts` (CLI) and by the first-run bootstrap action.

const { az } = DICT;
const L = (pick: (d: typeof az) => string): Localized => loc(pick(DICT.az), pick(DICT.en), pick(DICT.ru));
const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function seedAdmin(prisma: PrismaClient, { email, password, name }: { email: string; password: string; name?: string }) {
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  return prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), name: name ?? "nobug admin", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    update: {},
  });
}

export async function seedContent(prisma: PrismaClient) {
  // ── hero ─────────────────────────────────────────────────────────────
  const hero = {
    title: json(L((d) => d.h1)),
    subtitle: json(L((d) => d.heroText)),
    primaryCtaLabel: json(L((d) => d.heroLink)),
    primaryCtaUrl: "/anket",
    secondaryCtaLabel: json(L((d) => d.tpl.ctaSecondary)),
    secondaryCtaUrl: "#xidmetler",
  };
  await prisma.hero.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...hero }, update: hero });
  // partner logos: none on the site today — nothing is invented

  // ── projects (the case study is the first, featured one) ─────────────
  const html = (d: typeof az) => d.caseStudy.blocks.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join("");
  const projects = az.projects.items.map((_, i) => ({
    slug: slugify(az.projects.items[i][0]) || `layihe-${i + 1}`,
    title: json(L((d) => d.projects.items[i][0])),
    // the showcase quotes the case study's "Result" paragraph for the first project
    shortDescription: json(L((d) => (i === 0 ? d.caseStudy.blocks[2][1] : d.projects.items[i][1]))),
    content: json(i === 0 ? L(html) : loc("", "", "")),
    duration: i === 0 ? az.caseStudy.facts[1] : "",
    year: az.projects.items[i][2],
    isFeatured: i === 0,
    isPublished: true,
    order: i,
  }));
  for (const { slug, ...data } of projects) await prisma.project.upsert({ where: { slug }, create: { slug, ...data }, update: data });

  // ── stats ────────────────────────────────────────────────────────────
  await prisma.stat.deleteMany();
  const figures = [...az.figures.map((_, i) => i), -1]; // -1 = tpl.founded
  await prisma.stat.createMany({
    data: figures.map((i, order) => ({
      value: i < 0 ? az.tpl.founded[0] : az.figures[i][0],
      label: json(L((d) => (i < 0 ? d.tpl.founded[1] : d.figures[i][1]))),
      source: json(L((d) => (i < 0 ? d.tpl.founded[2] : d.figures[i][2]))),
      order,
    })),
  });

  // ── service categories + services ────────────────────────────────────
  const categories = [
    { slug: "esas", name: L((d) => d.tpl.cardPrimary), order: 0 },
    { slug: "elave", name: L((d) => d.servicesSecondary), order: 1 },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.serviceCategory.upsert({ where: { slug: c.slug }, create: { slug: c.slug, name: json(c.name), order: c.order }, update: { name: json(c.name), order: c.order } });
    categoryIds[c.slug] = row.id;
  }
  const serviceOrder = [...PRIMARY_SERVICES, ...SECONDARY_SERVICES];
  for (const [order, id] of serviceOrder.entries()) {
    const idx = LEGACY_ORDER.indexOf(id);
    const isPrimary = (PRIMARY_SERVICES as readonly string[]).includes(id);
    const data = {
      name: json(L((d) => d.services[idx][0])),
      shortDescription: json(L((d) => d.services[idx][1])),
      details: json(loc("", "", "")),
      icon: "",
      categoryId: categoryIds[isPrimary ? "esas" : "elave"],
      isActive: true,
      order,
    };
    await prisma.service.upsert({ where: { slug: id }, create: { slug: id, ...data }, update: data });
  }

  // ── standards table → one group per area, one row each ───────────────
  await prisma.specGroup.deleteMany();
  for (const [order, row] of az.techRows.entries()) {
    await prisma.specGroup.create({
      data: {
        name: json(L((d) => d.techRows[order][0])),
        order,
        items: { create: [{ name: json(L((d) => d.techRows[order][1])), value: row[2], unit: row[3], order: 0 }] },
      },
    });
  }

  // ── site settings + footer ───────────────────────────────────────────
  const settings = {
    phones: [] as string[],
    email: CONTACT_EMAIL,
    address: json(L((d) => d.contactRows[0][1])),
    hours: json(L((d) => d.contactRows[1][1])),
    linkedin: LINKEDIN_URL,
    instagram: "",
    facebook: "",
    youtube: "",
    x: "",
  };
  await prisma.siteSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...settings }, update: settings });
  await prisma.footerLink.deleteMany({ where: { settingsId: "singleton" } });
  // legal pages keep per-locale slugs (src/lib/legal) and are rendered from there
  const companyUrls = ["#haqqinda", "#karyera", "#elaqe"];
  await prisma.footerLink.createMany({
    data: [
      ...FOOTER_SERVICES.map((id, i) => ({ group: "services", label: json(L((d) => d.footerCols[0][1][i])), url: `/anket?xidmet=${id}`, order: i })),
      ...companyUrls.map((url, i) => ({ group: "company", label: json(L((d) => d.footerCols[1][1][i])), url, order: i })),
    ].map((l) => ({ settingsId: "singleton", ...l })),
  });

  return { projects: projects.length, services: serviceOrder.length, specGroups: az.techRows.length };
}
