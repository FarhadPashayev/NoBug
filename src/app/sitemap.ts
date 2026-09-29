import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";
import { LEGAL_KEYS, legalHref } from "@/lib/legal";
import { ACTIVE_SERVICES } from "@/lib/services";
import { hasDatabase, prisma } from "@/lib/db";

// Locale home pages, legal pages, one page per service and per published
// project; /anket stays noindex and is not listed.
const entry = (path: (l: string) => string, priority: number, changeFrequency: "monthly" | "yearly" | "weekly"): MetadataRoute.Sitemap =>
  LOCALES.map((l) => ({
    url: absoluteUrl(path(l)),
    lastModified: new Date(),
    changeFrequency,
    priority: l === "az" ? priority : priority * 0.8,
    alternates: { languages: { ...Object.fromEntries(LOCALES.map((x) => [x, absoluteUrl(path(x))])), "x-default": absoluteUrl(path("az")) } },
  }));

async function slugs(): Promise<{ services: string[]; projects: string[] }> {
  if (!hasDatabase) return { services: [...ACTIVE_SERVICES], projects: [] };
  try {
    const [services, projects] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, select: { slug: true }, orderBy: { order: "asc" } }),
      prisma.project.findMany({ where: { isPublished: true }, select: { slug: true, content: true }, orderBy: { order: "asc" } }),
    ]);
    return {
      services: services.length ? services.map((s) => s.slug) : [...ACTIVE_SERVICES],
      // only projects with a write-up have a page worth indexing
      projects: projects.filter((p) => Boolean((p.content as { az?: string } | null)?.az)).map((p) => p.slug),
    };
  } catch {
    return { services: [...ACTIVE_SERVICES], projects: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, projects } = await slugs();
  return [
    ...entry((l) => `/${l}`, 1, "monthly"),
    ...services.flatMap((slug) => entry((l) => `/${l}/xidmetler/${slug}`, 0.8, "monthly")),
    ...projects.flatMap((slug) => entry((l) => `/${l}/layiheler/${slug}`, 0.6, "monthly")),
    ...LEGAL_KEYS.flatMap((key) => entry((l) => legalHref(l as "az", key), 0.3, "yearly")),
  ];
}
