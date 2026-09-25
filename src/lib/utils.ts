import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * dd.MM.yyyy HH:mm in Baku time. A fixed pattern rather than toLocaleString:
 * Chrome's az-AZ medium style renders months as "M09", which reads as noise.
 */
export function formatDate(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Baku",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[əğışöüçİ]/g, (c) => ({ "ə": "e", "ğ": "g", "ı": "i", "ş": "s", "ö": "o", "ü": "u", "ç": "c", "İ": "i" })[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
