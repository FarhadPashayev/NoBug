import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

const supabaseHost = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // uploads from the admin panel live in Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: supabaseHost ?? "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    // The proxy sends every page on the apex / preview host to www.nobug.az
    // with the security headers attached. Config redirects run *before* the
    // proxy and without those headers, so this only covers the static paths
    // the proxy matcher skips (robots, sitemap, assets…) — otherwise the
    // apex would serve a second copy of them.
    const hosts = ["nobug.az", "no-bug-eta.vercel.app"];
    const sources = ["/:file(robots\\.txt|sitemap\\.xml|sw\\.js|offline\\.html|favicon\\.ico)", "/assets/:path*", "/uploads/:path*"];
    return [
      ...hosts.flatMap((host) =>
        sources.map((source) => ({
          source,
          has: [{ type: "host" as const, value: host }],
          destination: `https://www.nobug.az${source.replace(/\(.*\)/, "")}`,
          permanent: true,
        })),
      ),
      // services withdrawn from the offer (lib/services.ts RETIRED_SERVICES): their
      // pages and anket deep links land on the services section
      { source: "/:lang(az|en|ru)/xidmetler/:slug(infra|bots|ai-video|consulting|rental)", destination: "/:lang#xidmetler", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // hashed by name only in _next/static; our own assets change rarely and are re-fetched on deploy by path
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      // the proxy sets these on the routes it sees; this covers static files, /api and the rest
      { source: "/:path*", headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })) },
    ];
  },

};

export default nextConfig;
