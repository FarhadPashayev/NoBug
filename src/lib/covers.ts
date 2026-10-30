// Card covers for the showcase carousel.
//
// Every service gets a procedural cover drawn by the card shader
// (components/webgl/shaders/card.ts, `pattern()`), so the carousel works
// before any imagery exists. When the admin panel uploads an image for a
// service (Service.imageUrl) the shader shows that texture instead.
// `photo` is the static fallback used by the HTML carousel and the
// case-study page header when no upload exists.

export type Cover = { pattern: number; photo: string };

const COVERS: Record<string, Cover> = {
  web: { pattern: 0, photo: "/assets/photo/about.webp" },
  qa: { pattern: 1, photo: "/assets/photo/services.webp" },
  crm: { pattern: 2, photo: "/assets/photo/careers.webp" },
  analytics: { pattern: 3, photo: "/assets/photo/tech.webp" },
  marketing: { pattern: 4, photo: "/assets/photo/band.webp" },
  mobile: { pattern: 5, photo: "/assets/photo/team-shelves.webp" },
  ai: { pattern: 6, photo: "/assets/photo/tech.webp" },
};

export const PATTERN_COUNT = 7;
const PHOTOS = Object.values(COVERS).map((c) => c.photo);

/** Services added in the panel get a stable pattern from their slug. */
export function coverFor(slug: string): Cover {
  if (COVERS[slug]) return COVERS[slug];
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { pattern: h % PATTERN_COUNT, photo: PHOTOS[h % PHOTOS.length] };
}

/** Grid fallback by position, so neighbouring cards never share a photo. */
export const photoAt = (i: number) => PHOTOS[[5, 0, 2, 1, 4, 3, 6][i % PHOTOS.length] ?? 0];
