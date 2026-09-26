import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // the Vercel preview host must never be indexed as a duplicate of the site
    return [
      { source: "/:path*", has: [{ type: "host", value: "no-bug-eta.vercel.app" }], destination: "https://www.nobug.az/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "nobug.az" }], destination: "https://www.nobug.az/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
