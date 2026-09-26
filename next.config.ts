import type { NextConfig } from "next";

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
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    // the Vercel preview host must never be indexed as a duplicate of the site
    return [
      { source: "/:path*", has: [{ type: "host", value: "no-bug-eta.vercel.app" }], destination: "https://www.nobug.az/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "nobug.az" }], destination: "https://www.nobug.az/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
