// Single source of truth for values that change when the domain goes live.
// Both are public (used in server + client markup), hence NEXT_PUBLIC_.

// Corporate mailbox is not ready — Gmail stays until then. One-line change later.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "no.bug.mmc@gmail.com";

// Domain is bought but nameservers are not repointed; canonical host is still Vercel.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://no-bug-eta.vercel.app").replace(/\/+$/, "");

export const LINKEDIN_URL = "https://www.linkedin.com/company/nobug";

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
