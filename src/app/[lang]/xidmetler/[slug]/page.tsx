import type { Metadata } from "next";
import Image from "next/image";
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
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { Logo } from "@/components/ui/logo";

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
  const others = (await getSiteContent(lang)).services.filter((o) => o.slug !== slug).slice(0, 6);
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
      {/* first node of the segment: Next scrolls it into view on client navigation — never the sticky header */}
      <span aria-hidden="true" className="block h-0" />
      <header className="sticky top-0 z-40 border-b border-navy-line bg-navy">
        <div className="mx-auto flex min-h-[72px] max-w-[1080px] flex-wrap items-center gap-4 px-[clamp(20px,5vw,64px)] py-3">
          <Logo href={`/${lang}`} variant="mark" height={26} />
          <Link href={`/${lang}#xidmetler`} className="link-rule mr-auto text-[15px] text-muted-navy hover:text-paper">
            {t.servicesTitle}
          </Link>
          <LangSwitcher current={lang} paths={paths} />
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[clamp(20px,5vw,64px)] pb-24 pt-[clamp(40px,6vw,80px)]">
        <article className="max-w-[68ch]">
          <div className="mono-label text-muted">
            {c.eyebrow} · {s.primary ? t.tpl.cardPrimary : t.tpl.cardSecondary}
          </div>
          <h1 className="type-h2 mt-4">{s.name}</h1>
          <p className="type-body mt-6 text-muted">{s.shortDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${lang}/anket?xidmet=${slug}`} className="btn-primary">
              {t.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={`/${lang}#xidmetler`} className="btn-secondary">
              {c.all}
            </Link>
          </div>
          {s.imageUrl && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[20px] bg-light">
              <Image src={s.imageUrl} alt="" fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" priority />
            </div>
          )}
          {s.details && <div className="rich-text mt-10" dangerouslySetInnerHTML={{ __html: sanitizeRichText(s.details) }} />}

          {questions.length > 0 && (
            <section className="mt-12 border-t border-hairline pt-8">
              <h2 className="text-[22px] font-medium leading-[1.24] tracking-[-0.015em]">{c.asked}</h2>
              <p className="type-small mt-2 text-muted">{c.askedNote}</p>
              <ol className="mt-6 space-y-5">
                {questions.map(([label, options], i) => (
                  <li key={label}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs tracking-[0.08em] text-muted">0{i + 1}</span>
                      <span className="text-[17px] font-medium leading-[1.4]">{label}</span>
                    </div>
                    <p className="type-small mt-1 pl-8 text-muted">{options.join(" · ")}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {others.length > 0 && (
            <section className="mt-12 border-t border-hairline pt-8">
              <h2 className="mono-label text-muted">{c.others}</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/${lang}/xidmetler/${o.slug}`} className="link-rule text-[16px] leading-[1.5] text-navy">
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
