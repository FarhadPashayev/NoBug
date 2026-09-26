import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { CONTACT_EMAIL, SITE_URL, absoluteUrl } from "@/lib/site";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { ServiceWorkerRegister } from "@/components/ui/sw-register";
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

// notch/home-indicator safe areas (padding lives in globals.css via env())
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b1f3a" };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "az";
  const t = getDict(locale);
  // Every absolute URL derives from SITE_URL (NEXT_PUBLIC_SITE_URL) — never a hardcoded host.
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "nobug", template: "%s — nobug" },
    description: t.meta.description,
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}`)])), "x-default": absoluteUrl("/az") },
    },
    openGraph: { title: t.meta.title, description: t.meta.description, url: absoluteUrl(`/${locale}`), siteName: "nobug", locale, type: "website" },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
    other: { "contact:email": CONTACT_EMAIL },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "nobug",
    url: SITE_URL,
    email: CONTACT_EMAIL,
    address: { "@type": "PostalAddress", addressLocality: "Baku", addressCountry: "AZ" },
  };

  return (
    <html lang={lang} className={`${interTight.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>
        {/* framer-motion reveals start at opacity 0 in the HTML; without JavaScript they would never appear */}
        <noscript>
          <style>{`[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
        <OfflineBanner lang={lang} />
        <ServiceWorkerRegister />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {/* GA4 — loaded after hydration (afterInteractive); off entirely when the ID is unset */}
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
