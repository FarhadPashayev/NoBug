import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getProject, getSiteContent } from "@/lib/content";
import { sanitizeRichText } from "@/lib/sanitize";
import { absoluteUrl } from "@/lib/site";
import { notFoundMetadata } from "@/lib/not-found";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { coverFor } from "@/lib/covers";
import { projectHref, projectService, showcaseCards } from "@/lib/showcase-data";
import { CaseLayout } from "@/components/case/case-layout";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Cached like the home page (ISR, filled on first request — the build does not
// need the database); project actions revalidate the path on every edit. No
// loading.tsx here on purpose: a streamed shell would commit a 200 before
// notFound() could turn an unknown slug into a real 404.
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getProject(lang, slug);
  if (!p) return notFoundMetadata(lang);
  return {
    title: p.title,
    description: p.shortDescription,
    alternates: {
      canonical: absoluteUrl(`/${lang}/layiheler/${slug}`),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}/layiheler/${slug}`)])), "x-default": absoluteUrl(`/az/layiheler/${slug}`) },
    },
    openGraph: {
      title: `${p.title} — nobug`,
      description: p.shortDescription,
      url: absoluteUrl(`/${lang}/layiheler/${slug}`),
      type: "article",
      locale: lang,
      ...(p.coverUrl ? { images: [{ url: p.coverUrl, alt: p.title }] } : {}),
    },
  };
}

/** Project write-up: the Tiptap content from the panel, sanitized again on the way out. */
export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const p = await getProject(lang, slug);
  if (!p) notFound();
  const t = getDict(lang);
  const sc = getShowcaseCopy(lang);
  const content = await getSiteContent(lang);
  const paths = Object.fromEntries(LOCALES.map((l) => [l, `/layiheler/${slug}`])) as Record<Locale, string>;
  const list = content.projects;
  const at = list.findIndex((o) => o.slug === slug);
  const near = (i: number) => {
    const o = list.length > 1 && at >= 0 ? list[(i + list.length) % list.length] : null;
    return o && o.slug !== slug ? { title: o.title, href: projectHref(lang, o.slug) } : null;
  };
  const service = projectService(content, p);
  // opened from the carousel → ✕ returns to the same card
  const card = showcaseCards(lang, content).findIndex((c) => c.href === projectHref(lang, slug));
  const info: [string, string][] = [
    ...(service ? ([[sc.case.category, service.name]] as [string, string][]) : []),
    ...(p.year ? ([[sc.case.year, p.year]] as [string, string][]) : []),
    ...(p.duration ? ([[sc.case.duration, p.duration]] as [string, string][]) : []),
    ...(p.tags.length ? ([[sc.case.stack, p.tags.join(", ")]] as [string, string][]) : []),
  ];

  return (
    <CaseLayout
      lang={lang}
      content={content}
      paths={paths}
      title={p.title}
      info={info}
      action={
        p.url ? (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-[15px] font-medium text-paper transition-opacity hover:opacity-85">
            {sc.case.viewLive}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : undefined
      }
      media={[p.coverUrl ? { src: p.coverUrl, alt: p.title } : { src: coverFor(p.slug).photo, alt: p.title, pattern: coverFor(p.slug).pattern }, ...p.gallery]}
      prev={near(at - 1)}
      next={near(at + 1)}
      closeHref={card >= 0 ? `/${lang}` : `/${lang}#layiheler`}
      homeIndex={card >= 0 ? card : undefined}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <h2 className="eyebrow text-ink-950/60">{t.caseStudy.labels[2]}</h2>
        <div>
          {p.shortDescription && <p className="text-[clamp(20px,2.2vw,30px)] leading-[1.3] tracking-[-0.015em]">{p.shortDescription}</p>}
          {p.content ? <div className="rich-text case-media mt-8 text-ink-950/80" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.content) }} /> : null}
        </div>
      </div>
    </CaseLayout>
  );
}
