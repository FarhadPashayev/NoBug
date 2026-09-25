import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getSiteContent } from "@/lib/content";
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

// Content comes from the admin panel's database (src/lib/content), section
// chrome and labels from the dictionary. The page is cached and re-rendered
// when the panel calls revalidatePath; the hourly fallback covers edits made
// directly in the database.
export const revalidate = 3600;

// Background rhythm (fortemplate/): light → dark → dark → light → light → dark → light.
// Each section declares data-bg; <ScrollColorWrapper> fades the page ground between them.
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const content = await getSiteContent(lang);

  return (
    <ScrollColorWrapper>
      <Header lang={lang} t={t} />
      <main>
        <Hero lang={lang} t={t} content={content} />
        <Showcase lang={lang} t={t} content={content} />
        <Stats t={t} content={content} />
        <Position t={t} />
        <ServicesGrid lang={lang} t={t} content={content} />
        <Standards t={t} content={content} />
        <Cta lang={lang} t={t} content={content} />
      </main>
      <Footer lang={lang} t={t} content={content} />
    </ScrollColorWrapper>
  );
}
