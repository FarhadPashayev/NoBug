import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getService, getSiteContent } from "@/lib/content";
import { getSurvey } from "@/lib/anket/survey";
import { ACTIVE_SERVICES, isServiceId, serviceIndex } from "@/lib/services";
import { sanitizeRichText } from "@/lib/sanitize";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { notFoundMetadata } from "@/lib/not-found";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { coverFor } from "@/lib/covers";
import { projectService, serviceHref } from "@/lib/showcase-data";
import { CaseLayout } from "@/components/case/case-layout";
import { ProjectsSection } from "@/components/sections/projects";

type Props = { params: Promise<{ lang: string; slug: string }> };

const COPY: Record<Locale, { eyebrow: string; asked: string; askedNote: string; others: string; all: string }> = {
  az: { eyebrow: "Xidmət", asked: "Sorğuda nə soruşuruq", askedNote: "Üç sual — cavablar ilkin qiymətləndirmə üçün kifayətdir.", others: "Digər xidmətlər", all: "Bütün xidmətlər" },
  en: { eyebrow: "Service", asked: "What the enquiry asks", askedNote: "Three questions — enough for an initial assessment.", others: "Other services", all: "All services" },
  ru: { eyebrow: "Услуга", asked: "Что мы спрашиваем в заявке", askedNote: "Три вопроса — достаточно для предварительной оценки.", others: "Другие услуги", all: "Все услуги" },
};

// One indexable page per service (SEO): ISR, the built-in slugs on offer are
// prerendered, services added in the panel render on first request.
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => ACTIVE_SERVICES.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const s = await getService(lang, slug);
  if (!s) return notFoundMetadata(lang);
  const path = `/xidmetler/${slug}`;
  return {
    title: s.name,
    description: s.shortDescription,
    alternates: { canonical: absoluteUrl(`/${lang}${path}`), languages: { ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}${path}`)])), "x-default": absoluteUrl(`/az${path}`) } },
    openGraph: { title: `${s.name} — nobug`, description: s.shortDescription, url: absoluteUrl(`/${lang}${path}`), type: "website", locale: lang },
  };
}

export default async function ServicePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const s = await getService(lang, slug);
  if (!s) notFound();
  const t = getDict(lang);
  const c = COPY[lang];
  const sv = getSurvey(lang);
  const questions = isServiceId(slug) ? sv.q[serviceIndex(slug)] : [];
  const sc = getShowcaseCopy(lang);
  const content = await getSiteContent(lang);
  const list = content.services;
  const at = list.findIndex((o) => o.slug === slug);
  const near = (i: number) => (list.length > 1 && at >= 0 ? list[(i + list.length) % list.length] : null);
  const toLink = (o: (typeof list)[number] | null) => (o && o.slug !== slug ? { title: o.name, href: serviceHref(lang, o.slug) } : null);
  // projects tagged with this service; otherwise the selected work in general
  const tagged = content.projects.filter((p) => projectService(content, p)?.slug === slug);
  const projects = tagged.length ? tagged : content.projects;
  const paths = Object.fromEntries(LOCALES.map((l) => [l, `/xidmetler/${slug}`])) as Record<Locale, string>;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.shortDescription,
    serviceType: s.name,
    provider: { "@type": "Organization", name: "nobug", url: SITE_URL },
    areaServed: "AZ",
    url: absoluteUrl(`/${lang}/xidmetler/${slug}`),
  };

  return (
    <>
      <CaseLayout
        lang={lang}
        content={content}
        paths={paths}
        title={s.name}
        info={[
          [sc.case.category, s.primary ? t.tpl.cardPrimary : t.tpl.cardSecondary],
          ...(at >= 0 ? ([[c.eyebrow, `${String(at + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`]] as [string, string][]) : []),
        ]}
        action={
          <Link href={`/${lang}/anket?xidmet=${slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-[15px] font-medium text-paper transition-opacity hover:opacity-85">
            {t.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
        media={[s.imageUrl ? { src: s.imageUrl, alt: s.name } : { src: coverFor(slug).photo, alt: s.name, pattern: coverFor(slug).pattern }]}
        prev={toLink(near(at - 1))}
        next={toLink(near(at + 1))}
        closeHref={`/${lang}`}
        homeIndex={at >= 0 ? at : undefined}
      >
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <h2 className="eyebrow text-ink-950/60">{c.eyebrow}</h2>
          <div>
            <p className="text-[clamp(20px,2.2vw,30px)] leading-[1.3] tracking-[-0.015em]">{s.shortDescription}</p>
            {s.details && <div className="rich-text mt-8 text-ink-950/80" dangerouslySetInnerHTML={{ __html: sanitizeRichText(s.details) }} />}
          </div>
        </div>

        {questions.length > 0 && (
          <section className="mt-20 grid gap-10 border-t border-black/10 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <h2 className="eyebrow text-ink-950/60">{c.asked}</h2>
              <p className="mt-3 max-w-[28ch] text-[14px] leading-[1.5] text-ink-950/65">{c.askedNote}</p>
            </div>
            <ol className="space-y-6">
              {questions.map(([label, options], i) => (
                <li key={label} className="grid grid-cols-[2.5rem_1fr]">
                  <span className="font-mono text-[12px] leading-[1.9] text-ink-950/60">0{i + 1}</span>
                  <span>
                    <span className="block text-[18px] font-medium leading-[1.35]">{label}</span>
                    <span className="mt-1 block text-[14px] leading-[1.5] text-ink-950/65">{options.join(" · ")}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="-mx-gutter">
          <ProjectsSection lang={lang} title={tagged.length ? sc.case.projects : sc.case.projectsAll} projects={projects} empty={sc.projectsEmpty} tone="paper" />
        </div>

        <section className="flex flex-col items-start justify-between gap-6 rounded-[10px] bg-ink-950 p-8 text-paper sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="text-[clamp(24px,2.6vw,36px)] font-medium leading-[1.1] tracking-[-0.025em]">{sc.case.ctaTitle}</h2>
            <p className="mt-2 text-[15px] text-paper/60">{sc.case.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/anket?xidmet=${slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow px-6 text-[15px] font-medium text-ink-950 transition-colors hover:bg-yellow-600">
              {t.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={`/${lang}#elaqe`} className="inline-flex min-h-12 items-center rounded-full border border-paper/25 px-6 text-[15px] font-medium transition-colors hover:border-paper">
              {sc.contact}
            </Link>
          </div>
        </section>
      </CaseLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
