import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getService } from "@/lib/content";
import { ACTIVE_SERVICES } from "@/lib/services";

// Social card for a service page: the same navy card as the site's, with the
// service name and its one-line description instead of the headline.
export const alt = "nobug";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => ACTIVE_SERVICES.map((slug) => ({ lang, slug })));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "az";
  const t = getDict(locale);
  const s = await getService(locale, slug);
  const title = s?.name ?? t.h1;
  const text = s?.shortDescription ?? t.eyebrow;

  const [font, wordmark] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_og/InterTight-Medium.ttf")),
    readFile(join(process.cwd(), "public/assets/nobug-white.png")),
  ]);
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0B1F3A",
          color: "#EDEBE5",
          fontFamily: "Inter Tight",
        }}
      >
        <img src={wordmarkSrc} alt="" width={254} height={72} style={{ width: 254, height: 72 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 96, height: 2, background: "#EFA83C" }} />
          <div style={{ fontSize: title.length > 28 ? 56 : 68, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1040 }}>{title}</div>
          <div style={{ fontSize: 26, lineHeight: 1.35, color: "#A9B7CB", maxWidth: 1000 }}>{text}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter Tight", data: font, style: "normal", weight: 500 }] },
  );
}
