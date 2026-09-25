import { hasDatabase, prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { t } from "@/lib/i18n/localized";
import { FOOTER_SERVICES, LEGACY_ORDER, PRIMARY_SERVICES, SECONDARY_SERVICES, serviceIndex } from "@/lib/services";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

/**
 * What the public pages render, already resolved to one locale. Read from the
 * database when it is configured and populated; otherwise the dictionary
 * copy in src/lib/i18n/dict.ts — the same content the seed loads — so the
 * site keeps working on a machine with no DATABASE_URL.
 */

export type SiteContent = {
  fromDb: boolean;
  hero: { title: string; subtitle: string; primaryCta: { label: string; href: string } | null; secondaryCta: { label: string; href: string } | null; image: string | null };
  partnerLogos: { id: string; name: string; logoUrl: string; url: string }[];
  projects: { id: string; slug: string; title: string; shortDescription: string; content: string; duration: string; year: string; coverUrl: string | null; tags: string[]; isFeatured: boolean }[];
  stats: { value: string; label: string; source: string }[];
  services: { id: string; slug: string; name: string; shortDescription: string; details: string; icon: string; imageUrl: string | null; primary: boolean; categorySlug: string | null }[];
  specs: { area: string; approach: string; tooling: string; status: string }[];
  settings: {
    email: string;
    phones: string[];
    address: string;
    hours: string;
    social: { linkedin: string; instagram: string; facebook: string; youtube: string; x: string };
    footerLinks: Record<"services" | "company" | "legal", { label: string; href: string }[]>;
  };
};

/** "/anket" → "/az/anket"; "#xidmetler" → "/az#xidmetler"; absolute URLs untouched. */
export function localizeHref(href: string, locale: Locale) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  if (href.startsWith("#")) return `/${locale}${href}`;
  if (/^\/(az|en|ru)(\/|#|\?|$)/.test(href)) return href;
  return `/${locale}${href.startsWith("/") ? "" : "/"}${href}`;
}

function fromDictionary(locale: Locale): SiteContent {
  const d = getDict(locale);
  const cta = (label: string, href: string) => (label ? { label, href: localizeHref(href, locale) } : null);
  return {
    fromDb: false,
    hero: { title: d.h1, subtitle: d.heroText, primaryCta: cta(d.heroLink, "/anket"), secondaryCta: cta(d.tpl.ctaSecondary, "#xidmetler"), image: null },
    partnerLogos: [],
    projects: d.projects.items.map(([title, text, year], i) => ({
      id: `dict-${i}`,
      slug: `layihe-${i + 1}`,
      title,
      shortDescription: i === 0 ? d.caseStudy.blocks[2][1] : text,
      content: "",
      duration: i === 0 ? d.caseStudy.facts[1] : "",
      year,
      coverUrl: null,
      tags: [],
      isFeatured: i === 0,
    })),
    stats: [...d.figures, d.tpl.founded].map(([value, label, source]) => ({ value, label, source })),
    services: [...PRIMARY_SERVICES, ...SECONDARY_SERVICES].map((id) => {
      const [name, shortDescription] = d.services[serviceIndex(id)];
      const primary = PRIMARY_SERVICES.includes(id);
      return { id, slug: id, name, shortDescription, details: "", icon: "", imageUrl: null, primary, categorySlug: primary ? "esas" : "elave" };
    }),
    specs: d.techRows.map(([area, approach, tooling, status]) => ({ area, approach, tooling, status })),
    settings: {
      email: CONTACT_EMAIL,
      phones: [],
      address: d.contactRows[0][1],
      hours: d.contactRows[1][1],
      social: { linkedin: LINKEDIN_URL, instagram: "", facebook: "", youtube: "", x: "" },
      footerLinks: {
        services: FOOTER_SERVICES.map((id, i) => ({ label: d.footerCols[0][1][i] ?? d.services[LEGACY_ORDER.indexOf(id)][0], href: `/${locale}/anket?xidmet=${id}` })),
        company: d.footerCols[1][1].map((label, i) => ({ label, href: `/${locale}${["#haqqinda", "#karyera", "#elaqe"][i] ?? "#top"}` })),
        legal: [],
      },
    },
  };
}

async function fromDatabase(locale: Locale): Promise<SiteContent | null> {
  const [hero, logos, projects, stats, services, groups, settings] = await Promise.all([
    prisma.hero.findUnique({ where: { id: "singleton" } }),
    prisma.partnerLogo.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ where: { isPublished: true }, orderBy: { order: "asc" }, include: { tags: true } }),
    prisma.stat.findMany({ orderBy: { order: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { order: "asc" }, include: { category: true } }),
    prisma.specGroup.findMany({ orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { footerLinks: { orderBy: { order: "asc" } } } }),
  ]);
  // an empty database (tables pushed, nothing seeded) keeps the dictionary copy
  if (!hero || !services.length) return null;

  const fallback = fromDictionary(locale);
  const cta = (label: unknown, href: string) => (t(label, locale) ? { label: t(label, locale), href: localizeHref(href, locale) } : null);
  const links = (group: "services" | "company" | "legal") => (settings?.footerLinks ?? []).filter((l) => l.group === group).map((l) => ({ label: t(l.label, locale), href: localizeHref(l.url, locale) }));

  return {
    fromDb: true,
    hero: {
      title: t(hero.title, locale),
      subtitle: t(hero.subtitle, locale),
      primaryCta: cta(hero.primaryCtaLabel, hero.primaryCtaUrl),
      secondaryCta: cta(hero.secondaryCtaLabel, hero.secondaryCtaUrl),
      image: hero.heroImageUrl,
    },
    partnerLogos: logos.map((l) => ({ id: l.id, name: l.name, logoUrl: l.logoUrl, url: l.url })),
    projects: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: t(p.title, locale),
      shortDescription: t(p.shortDescription, locale),
      content: t(p.content, locale),
      duration: p.duration,
      year: p.year,
      coverUrl: p.coverUrl,
      tags: p.tags.map((tg) => t(tg.name, locale)),
      isFeatured: p.isFeatured,
    })),
    stats: stats.map((s) => ({ value: s.value, label: t(s.label, locale), source: t(s.source, locale) })),
    services: services.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: t(s.name, locale),
      shortDescription: t(s.shortDescription, locale),
      details: t(s.details, locale),
      icon: s.icon,
      imageUrl: s.imageUrl,
      primary: s.category?.slug === "esas",
      categorySlug: s.category?.slug ?? null,
    })),
    specs: groups.flatMap((g) => g.items.map((i) => ({ area: t(g.name, locale), approach: t(i.name, locale), tooling: i.value, status: i.unit }))),
    settings: settings
      ? {
          email: settings.email || CONTACT_EMAIL,
          phones: settings.phones,
          address: t(settings.address, locale),
          hours: t(settings.hours, locale),
          social: { linkedin: settings.linkedin, instagram: settings.instagram, facebook: settings.facebook, youtube: settings.youtube, x: settings.x },
          footerLinks: { services: links("services"), company: links("company"), legal: links("legal") },
        }
      : fallback.settings,
  };
}

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  if (!hasDatabase) return fromDictionary(locale);
  try {
    return (await fromDatabase(locale)) ?? fromDictionary(locale);
  } catch (e) {
    console.error("[content] database read failed, using dictionary:", e);
    return fromDictionary(locale);
  }
}
