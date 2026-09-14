import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";

// Three locale home pages; /anket stays noindex and is not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}`)]));
  return LOCALES.map((l) => ({
    url: absoluteUrl(`/${l}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === "az" ? 1 : 0.8,
    alternates: { languages },
  }));
}
