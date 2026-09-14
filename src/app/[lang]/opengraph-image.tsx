import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

// Social card, generated per locale so it never drifts from the copy:
// navy ground, the white wordmark (unmodified PNG), one line of text.
export const alt = "nobug";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "az";
  const t = getDict(locale);

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmarkSrc} alt="" width={254} height={72} style={{ width: 254, height: 72 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 96, height: 2, background: "#B3121D" }} />
          <div style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1000 }}>{t.h1}</div>
          <div style={{ fontSize: 22, letterSpacing: "0.08em", color: "#9A968E" }}>{t.eyebrow.toLocaleUpperCase(locale === "az" ? "az" : locale)}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter Tight", data: font, style: "normal", weight: 500 }] },
  );
}
