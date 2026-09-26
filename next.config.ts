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
