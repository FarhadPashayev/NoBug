import type { MetadataRoute } from "next";
import { absoluteUrl, IS_PREVIEW } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // the dev deployment is a copy of the site: keep every crawler out of it
  if (IS_PREVIEW) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/az/anket", "/en/anket", "/ru/anket"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
