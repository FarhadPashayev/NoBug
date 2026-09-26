import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

export const NOT_FOUND_COPY: Record<Locale, { title: string; home: string }> = {
  az: { title: "Səhifə tapılmadı", home: "Ana səhifə" },
  en: { title: "Page not found", home: "Home" },
  ru: { title: "Страница не найдена", home: "Главная" },
};

/**
 * Metadata for a page that is about to call notFound(). Next discards page
 * metadata once notFound() runs, so the title cannot be set here — the
 * [lang] layout therefore keeps a neutral default ("nobug") and
 * [lang]/not-found.tsx sets the localized title in the browser.
 */
export const notFoundMetadata = (lang: Locale): Metadata => ({ title: NOT_FOUND_COPY[lang].title, robots: { index: false, follow: false } });
