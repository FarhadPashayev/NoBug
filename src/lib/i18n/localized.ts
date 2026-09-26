import { z } from "zod";
import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Shape of every translatable column: Azerbaijani is the source language and
 * always present; English and Russian fall back to it when missing.
 */
export type Localized = { az: string; en: string; ru: string };

const text = (max: number) => z.string().trim().max(max);

/** `localizedString()` → az required; `localizedString(500, false)` → all optional. */
export const localizedString = (max = 500, required = true, message = "Azərbaycanca doldurulmalıdır") => {
  const shape = z.object({
    az: required ? text(max).min(1, message) : text(max).default(""),
    en: text(max).optional().default(""),
    ru: text(max).optional().default(""),
  });
  // an optional field may be left out entirely (API callers, tests) — it then reads as empty
  return required ? shape : shape.default({ az: "", en: "", ru: "" });
};

export type LocalizedInput = z.infer<ReturnType<typeof localizedString>>;

export const emptyLocalized = (): Localized => ({ az: "", en: "", ru: "" });

/** Read a translatable value for `locale`, falling back to Azerbaijani. */
export function t(value: unknown, locale: Locale = DEFAULT_LOCALE): string {
  if (!value || typeof value !== "object") return typeof value === "string" ? value : "";
  const v = value as Partial<Record<Locale, string>>;
  return v[locale]?.trim() || v.az?.trim() || "";
}

/** Coerce an unknown Json column into the Localized shape (for form defaults). */
export function asLocalized(value: unknown): Localized {
  if (!value || typeof value !== "object") return emptyLocalized();
  const v = value as Record<string, unknown>;
  return { az: String(v.az ?? ""), en: String(v.en ?? ""), ru: String(v.ru ?? "") };
}

/** Build a Localized from three plain strings (seed helper). */
export const loc = (az: string, en = "", ru = ""): Localized => ({ az, en, ru });
