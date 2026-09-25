import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DICT } from "../src/lib/i18n/dict";
import { PRIMARY_SERVICES, SECONDARY_SERVICES, LEGACY_ORDER } from "../src/lib/services";
import { CONTACT_EMAIL, LINKEDIN_URL } from "../src/lib/site";

// Seeds the panel from the copy that ships with the site today, so the first
// login shows real content rather than empty tables. Idempotent: re-running
// updates the same rows (slug / id are the keys).

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const t = DICT.az;
const LOCALE = "az";

async function main() {
  // ── admin user ───────────────────────────────────────────────────────
  const email = (process.env.ADMIN_EMAIL ?? "admin@nobug.az").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 10) throw new Error("ADMIN_PASSWORD (min 10 chars) is required to seed the first account");

  await prisma.user.upsert({
    where: { email },
    create: { email, name: process.env.ADMIN_NAME ?? "nobug admin", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    update: {},
  });

  // ── hero ─────────────────────────────────────────────────────────────
  const heroData = {
    eyebrow: t.eyebrow,
    title: t.h1,
    subtitle: t.heroText,
    primaryLabel: t.heroLink,
    primaryHref: `/${LOCALE}/anket`,
    secondaryLabel: t.tpl.ctaSecondary,
    secondaryHref: `/${LOCALE}#xidmetler`,
    imageUrl: null,
  };
  await prisma.hero.upsert({ where: { locale: LOCALE }, create: { locale: LOCALE, ...heroData }, update: heroData });

  // ── projects ─────────────────────────────────────────────────────────
  for (const [i, [title, summary, year]] of t.projects.items.entries()) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `layihe-${i + 1}`;
    const data = { title, summary, year, duration: i === 0 ? t.caseStudy.facts[1] : "", position: i, featured: i === 0, published: true, content: "", tags: [] as string[] };
    await prisma.project.upsert({ where: { locale_slug: { locale: LOCALE, slug } }, create: { locale: LOCALE, slug, ...data }, update: data });
  }

  // ── stats ────────────────────────────────────────────────────────────
  await prisma.stat.deleteMany({ where: { locale: LOCALE } });
  await prisma.stat.createMany({
    data: [...t.figures, t.tpl.founded].map(([value, label, source], position) => ({ locale: LOCALE, value, label, source, position })),
  });

  // ── service categories + services ────────────────────────────────────
  const categories = [
    { slug: "esas", name: "Əsas istiqamətlər", position: 0 },
    { slug: "elave", name: "Əlavə xidmətlər", position: 1 },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.serviceCategory.upsert({ where: { locale_slug: { locale: LOCALE, slug: c.slug } }, create: { locale: LOCALE, ...c }, update: c });
    categoryIds[c.slug] = row.id;
  }

  const order = [...PRIMARY_SERVICES, ...SECONDARY_SERVICES];
  for (const [position, id] of order.entries()) {
    const [name, summary] = t.services[LEGACY_ORDER.indexOf(id)];
    const isPrimary = PRIMARY_SERVICES.includes(id as (typeof PRIMARY_SERVICES)[number]);
    const data = {
      name,
      summary,
      details: "",
      icon: "",
      imageUrl: null,
      primary: isPrimary,
      published: true,
      position,
      categoryId: categoryIds[isPrimary ? "esas" : "elave"],
    };
    await prisma.service.upsert({ where: { locale_slug: { locale: LOCALE, slug: id } }, create: { locale: LOCALE, slug: id, ...data }, update: data });
  }

  // ── standards table ──────────────────────────────────────────────────
  await prisma.spec.deleteMany({ where: { locale: LOCALE } });
  await prisma.spec.createMany({
    data: t.techRows.map(([parameter, approach, tooling, status], position) => ({
      locale: LOCALE,
      group: approach,
      parameter,
      value: tooling,
      unit: status,
      position,
    })),
  });

  // ── site settings + footer ───────────────────────────────────────────
  const settings = {
    email: CONTACT_EMAIL,
    phone: "",
    whatsapp: "",
    address: t.contactRows[0][1],
    hours: t.contactRows[1][1],
    linkedin: LINKEDIN_URL,
    instagram: "",
    facebook: "",
    footerNote: `${t.legal[2]} ${t.legal[0]}. ${t.legal[1]}`,
  };
  await prisma.siteSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...settings }, update: settings });

  await prisma.footerLink.deleteMany({ where: { settingsId: "singleton" } });
  const [servicesCol, companyCol, legalCol] = t.footerCols;
  await prisma.footerLink.createMany({
    data: [
      ...servicesCol[1].map((label, i) => ({ column: "services", label, href: `/${LOCALE}#xidmetler`, position: i })),
      ...companyCol[1].map((label, i) => ({ column: "company", label, href: ["#haqqinda", "#karyera", "#elaqe"][i] ?? "#top", position: i })),
      ...legalCol[1].map((label, i) => ({ column: "legal", label, href: ["/az/mexfilik-siyaseti", "/az/istifade-shertleri", "/az/melumatlarin-emali"][i] ?? "#", position: i })),
    ],
  });

  console.log("Seed complete:", { email, projects: t.projects.items.length, services: order.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
