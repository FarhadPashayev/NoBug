// Single source of truth for values that change when the domain goes live.
// Both are public (used in server + client markup), hence NEXT_PUBLIC_.

// Corporate mailbox is not ready — Gmail stays until then. One-line change later.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "no.bug.mmc@gmail.com";

// Canonical host: nobug.az redirects (308) to www, so the www form is the default.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nobug.az").replace(/\/+$/, "");

export const LINKEDIN_URL = "https://www.linkedin.com/company/nobugsolutions/";
export const INSTAGRAM_URL = "https://www.instagram.com/nobugsolutions/";

/**
 * "production" on www.nobug.az, "preview" on the dev deployment
 * (dev.nobug.az and every other Vercel preview). Vercel sets VERCEL_ENV on
 * the server and NEXT_PUBLIC_VERCEL_ENV in the client bundle; a local build
 * has neither and behaves like production.
 */
export const SITE_ENV: "production" | "preview" =
  (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) === "preview" ? "preview" : "production";
export const IS_PREVIEW = SITE_ENV === "preview";

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
