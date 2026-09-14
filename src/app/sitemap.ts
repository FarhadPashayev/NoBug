import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";
import { LEGAL_KEYS, legalHref } from "@/lib/legal";

// Locale home pages + legal pages; /anket stays noindex and is not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: absoluteUrl(`/${l}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === "az" ? 1 : 0.8,
    alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, absoluteUrl(`/${x}`)])) },
  }));
  const legal: MetadataRoute.Sitemap = LEGAL_KEYS.flatMap((key) =>
    LOCALES.map((l) => ({
      url: absoluteUrl(legalHref(l, key)),
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, absoluteUrl(legalHref(x, key))])) },
    })),
  );
  return [...home, ...legal];
}
