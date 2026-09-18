import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { ScrollColorWrapper } from "@/components/ui/scroll-color";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Showcase } from "@/components/landing/showcase";
import { Stats } from "@/components/landing/stats";
import { Position } from "@/components/landing/position";
import { ServicesGrid } from "@/components/landing/services-grid";
import { Standards } from "@/components/landing/standards";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

// Background rhythm (fortemplate/): light → dark → dark → light → light → dark → light.
// Each section declares data-bg; <ScrollColorWrapper> fades the page ground between them.
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <ScrollColorWrapper>
      <Header lang={lang} t={t} />
      <main>
        <Hero lang={lang} t={t} />
        <Showcase lang={lang} t={t} />
        <Stats t={t} />
        <Position t={t} />
        <ServicesGrid lang={lang} t={t} />
        <Standards t={t} />
        <Cta lang={lang} t={t} />
      </main>
      <Footer lang={lang} t={t} />
    </ScrollColorWrapper>
  );
}
