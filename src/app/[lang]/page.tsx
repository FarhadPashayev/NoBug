import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getSiteContent } from "@/lib/content";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { aboutData, chromeCopy, contactChannels, showcaseCards } from "@/lib/showcase-data";
import { SiteChrome } from "@/components/chrome/site-chrome";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { HeroShowcase } from "@/components/showcase/hero-showcase";
import { IntroSection } from "@/components/sections/intro";
import { ServicesSection } from "@/components/sections/services";
import { ProcessSection } from "@/components/sections/process";
import { NumbersSection } from "@/components/sections/numbers";
import { ProjectsSection } from "@/components/sections/projects";
import { FaqSection, StandardsSection, TestimonialsSection } from "@/components/sections/proof";
import { ContactSection } from "@/components/sections/contact";
import { SiteFooter } from "@/components/sections/footer";

// Content comes from the admin panel's database (src/lib/content), section
// chrome and labels from the dictionary. The page is cached and re-rendered
// when the panel calls revalidatePath; the hourly fallback covers edits made
// directly in the database.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: { absolute: getDict(lang).meta.title } };
}

// Dark showcase home: the WebGL carousel of services on top, then plain,
// indexable HTML sections. Section numbers follow what is actually rendered.
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sc = getShowcaseCopy(lang);
  const content = await getSiteContent(lang);
  const channels = contactChannels(lang, content);
  let n = 4;
  const next = () => ++n;

  return (
    <div className="theme-ink home-intro bg-ink-950 text-paper">
      <SmoothScroll />
      <SiteChrome lang={lang} tone="ink" t={chromeCopy(lang)} about={aboutData(lang, content)} channels={channels} />
      <main>
        <HeroShowcase
          cards={showcaseCards(lang, content)}
          t={{ carouselLabel: sc.carouselLabel, carouselHelp: sc.carouselHelp, open: sc.open, loading: sc.loading }}
        />
        <IntroSection headline={sc.headline} subline={sc.subline} cta={sc.cta} href={`/${lang}/anket`} />
        <ServicesSection lang={lang} title={sc.sections.services} lead={sc.servicesLead} services={content.services} primaryLabel={t.tpl.cardPrimary} cta={sc.cta} />
        <ProcessSection title={sc.sections.process} lead={sc.processLead} steps={sc.process} qaNote={sc.qaNote} />
        <NumbersSection title={sc.sections.numbers} lead={t.tpl.statsText} stats={content.stats} logos={content.partnerLogos} clientsTitle={sc.sections.clients} />
        <ProjectsSection lang={lang} title={sc.sections.projects} lead={t.tpl.showcaseTitle} projects={content.projects} empty={sc.projectsEmpty} />
        {content.testimonials.length > 0 && <TestimonialsSection index={next()} title={sc.sections.testimonials} lead={t.testimonials.title} items={content.testimonials} />}
        {content.specs.length > 0 && <StandardsSection index={next()} t={t} rows={content.specs} />}
        {content.faq.length > 0 && <FaqSection index={next()} title={sc.sections.faq} lead={t.faq.title} items={content.faq} />}
        <ContactSection index={next()} lang={lang} t={t} sc={sc} channels={channels} services={content.services.map((s) => s.name)} address={content.settings.address} hours={content.settings.hours} />
      </main>
      {content.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
            }),
          }}
        />
      )}
      <SiteFooter lang={lang} t={t} content={content} channels={channels} rights={sc.footerRights} />
    </div>
  );
}
