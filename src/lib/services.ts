// Stable service identity, decoupled from display order.
//
// LEGACY_ORDER is the original 12-item array order. The dictionaries
// (`services[]`, survey `q[]`) are still indexed in this order, and old links
// of the form `?xidmet=<0…11>` keep resolving through it. New links use the id.
export const LEGACY_ORDER = [
  "infra", // 0  IT infrastrukturu
  "crm", // 1  CRM və ERP tətbiqi
  "analytics", // 2  Data analitikası
  "web", // 3  Veb və e-ticarət
  "marketing", // 4  Rəqəmsal marketinq
  "qa", // 5  Keyfiyyət təminatı
  "mobile", // 6  Mobil tətbiqlərin hazırlanması
  "bots", // 7  Bot həlləri
  "ai", // 8  Süni intellekt həlləri
  "ai-video", // 9  AI ilə video hazırlanması
  "consulting", // 10 Konsultasiya
  "rental", // 11 Günlük kirayə idarəetməsi
] as const;

export type ServiceId = (typeof LEGACY_ORDER)[number];
export const SERVICE_COUNT = LEGACY_ORDER.length;

// Display hierarchy on the home page: 4 primary (numbered) + 8 secondary.
export const PRIMARY_SERVICES: ServiceId[] = ["web", "qa", "infra", "crm"];
export const SECONDARY_SERVICES: ServiceId[] = ["analytics", "marketing", "mobile", "bots", "ai", "ai-video", "consulting", "rental"];

// Footer "Xidmətlər" column
export const FOOTER_SERVICES: ServiceId[] = ["infra", "crm", "mobile", "ai", "ai-video", "consulting"];

export function isServiceId(v: string): v is ServiceId {
  return (LEGACY_ORDER as readonly string[]).includes(v);
}

/** Index into the dictionary arrays for a given id. */
export function serviceIndex(id: ServiceId): number {
  return LEGACY_ORDER.indexOf(id);
}

/**
 * Resolve a `?xidmet=` value. Accepts the stable id ("web") and, for backwards
 * compatibility, the legacy numeric index ("3"). Returns the dictionary index.
 */
export function resolveService(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  if (isServiceId(raw)) return serviceIndex(raw);
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n < SERVICE_COUNT ? n : null;
}

export const serviceHref = (lang: string, id: ServiceId) => `/${lang}/anket?xidmet=${id}`;
