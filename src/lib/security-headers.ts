/**
 * Response headers for every route, including redirects (set by the proxy)
 * and the responses next.config.ts produces on its own.
 *
 * CSP: Next.js hydrates through inline scripts, and static/ISR pages cannot
 * carry a per-request nonce, so 'unsafe-inline' stays for script/style —
 * external script origins are still locked down. GA4 and Cloudflare's
 * analytics/e-mail-obfuscation scripts are the only third parties allowed.
 */
const SUPABASE = "https://*.supabase.co";
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${SUPABASE} https://www.googletagmanager.com https://www.google-analytics.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE} https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

// dev.nobug.az (and every other Vercel preview) must never be indexed
const IS_PREVIEW = (process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV) === "preview";

export const SECURITY_HEADERS: Record<string, string> = {
  ...(IS_PREVIEW ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export function applySecurityHeaders<T extends { headers: Headers }>(res: T): T {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}
