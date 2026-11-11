import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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
  const neighbour = (i: number) => {
    const o = list.length > 1 && at >= 0 ? list[(i + list.length) % list.length] : null;
    return o && o.slug !== slug ? o : null;
  };
  const near = (i: number) => {
    const o = neighbour(i);
    return o ? { title: o.title, href: projectHref(lang, o.slug) } : null;
  };
  const following = neighbour(at + 1);
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
      media={[p.coverUrl ? { src: p.coverUrl, alt: p.title } : { src: coverFor(p.slug).photo, alt: p.title, pattern: coverFor(p.slug).pattern }]}
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

      {p.logo && (
        <section aria-label={sc.case.brand} className="mt-[clamp(56px,8vw,112px)]">
          <h2 className="eyebrow border-t border-black/10 pt-6 text-ink-950/60">{sc.case.brand}</h2>
          {/* the client's mark on a light ground and on its own brand ground */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex aspect-[16/10] items-center justify-center rounded-[14px] bg-white p-[12%] ring-1 ring-black/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element -- vector logo, nothing for the optimizer to do */}
              <img src={p.logo.dark} alt={p.title} className="max-h-full w-full max-w-[340px] object-contain" />
            </div>
            <div className="flex aspect-[16/10] items-center justify-center rounded-[14px] p-[12%]" style={{ background: p.theme ? `linear-gradient(140deg, ${p.theme.from}, ${p.theme.to})` : "#111" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- vector logo, nothing for the optimizer to do */}
              <img src={p.theme?.ink === "#ffffff" ? p.logo.light : p.logo.dark} alt="" className="max-h-full w-full max-w-[340px] object-contain" />
            </div>
          </div>
        </section>
      )}

      {/* a similar project? → the enquiry, with this project's service preselected */}
      <section className="mt-[clamp(56px,8vw,112px)] flex flex-col items-start justify-between gap-6 rounded-[14px] bg-ink-950 p-8 text-paper sm:flex-row sm:items-center sm:p-12">
        <div>
          <h2 className="text-[clamp(24px,2.6vw,36px)] font-medium leading-[1.1] tracking-[-0.025em]">{sc.work.ctaTitle}</h2>
          <p className="mt-2 max-w-[48ch] text-[15px] text-paper/60">{sc.work.ctaText}</p>
        </div>
        <Link href={`/${lang}/anket${service ? `?xidmet=${service.slug}` : ""}`} className="inline-flex min-h-12 flex-none items-center gap-2 rounded-full bg-yellow px-6 text-[15px] font-medium text-ink-950 transition-colors hover:bg-yellow-600">
          {sc.work.cta}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {following && (
        <Link href={projectHref(lang, following.slug)} className="group mt-6 grid overflow-hidden rounded-[14px] bg-black/[0.04] ring-1 ring-black/[0.06] transition-colors hover:bg-black/[0.07] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative aspect-[16/10] overflow-hidden bg-ink-900 sm:aspect-auto sm:min-h-[260px]">
            {following.coverUrl ? (
              <Image src={following.coverUrl} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
            ) : (
              // no artwork: the brand grid, the name is already on the right
              <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,#2a2416_0%,transparent_55%),linear-gradient(140deg,#16181c,#0b0b0c)]">
                <span className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:40px_40px]" />
                <span className="absolute left-6 top-6 flex items-center gap-2 text-[12px] text-paper/60">
                  <span className="size-1.5 rounded-full bg-yellow" />
                  nobug
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
            <span className="eyebrow text-ink-950/60">{sc.work.nextLabel}</span>
            <span className="flex items-end justify-between gap-4">
              <span>
                <span className="block text-[clamp(26px,3vw,44px)] font-medium leading-[1] tracking-[-0.03em]">{following.title}</span>
                {following.shortDescription && <span className="mt-3 block max-w-[40ch] text-[15px] leading-[1.5] text-ink-950/65">{following.shortDescription}</span>}
              </span>
              <span className="flex size-12 flex-none items-center justify-center rounded-full bg-ink-950 text-paper transition-transform group-hover:translate-x-1">
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </span>
          </div>
        </Link>
      )}
    </CaseLayout>
  );
}
