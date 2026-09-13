import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import "../globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
});
// ONE pull quote only — never UI.
// (Newsreader ships no Cyrillic subset — the RU quote falls back to Georgia italic.)
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "az";
  const t = getDict(locale);
  return {
    title: { default: t.meta.title, template: "%s — nobug" },
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
    openGraph: { title: t.meta.title, description: t.meta.description, locale, type: "website" },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${interTight.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
