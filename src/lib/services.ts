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

// Withdrawn from the offer (2026-09-29). They keep their slot in LEGACY_ORDER
// so the dictionaries stay aligned and old leads still show their service
// name, but they are not offered, listed, linked or indexed anywhere.
export const RETIRED_SERVICES: ServiceId[] = ["infra", "bots", "ai-video", "consulting", "rental"];
export const isRetiredService = (id: string) => (RETIRED_SERVICES as readonly string[]).includes(id);

// Display hierarchy on the home page: 3 primary (numbered) + 4 secondary.
export const PRIMARY_SERVICES: ServiceId[] = ["web", "qa", "crm"];
export const SECONDARY_SERVICES: ServiceId[] = ["analytics", "marketing", "mobile", "ai"];

/** Every service on offer, in display order — the anket list, sitemap and static params use this. */
export const ACTIVE_SERVICES: ServiceId[] = [...PRIMARY_SERVICES, ...SECONDARY_SERVICES];

// Footer "Xidmətlər" column
export const FOOTER_SERVICES: ServiceId[] = ["web", "qa", "crm", "mobile", "ai"];

/** Any id that ever existed — for labels on historic leads. */
export function isServiceId(v: string): v is ServiceId {
  return (LEGACY_ORDER as readonly string[]).includes(v);
}

/** An id the anket may open. */
export function isActiveService(v: string): v is ServiceId {
  return isServiceId(v) && !isRetiredService(v);
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
  if (isServiceId(raw)) return isRetiredService(raw) ? null : serviceIndex(raw);
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n >= SERVICE_COUNT) return null;
  return isRetiredService(LEGACY_ORDER[n]) ? null : n;
}

export const serviceHref = (lang: string, id: string) => `/${lang}/anket?xidmet=${id}`;
