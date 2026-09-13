export const LOCALES = ["az", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "az";

export const LOCALE_LABELS: Record<Locale, { code: string; name: string }> = {
  az: { code: "AZ", name: "Azərbaycan" },
  en: { code: "EN", name: "English" },
  ru: { code: "RU", name: "Русский" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
