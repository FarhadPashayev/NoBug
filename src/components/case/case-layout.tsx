import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { SiteContent } from "@/lib/content";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { aboutData, chromeCopy, contactChannels } from "@/lib/showcase-data";
import { SiteChrome } from "@/components/chrome/site-chrome";
import { CaseBar } from "./case-bar";
import { CaseCover } from "./case-cover";

type Neighbour = { title: string; href: string } | null;
/** An uploaded image, or the procedural cover of the carousel card (pattern) with its photo fallback. */
export type CaseMedia = { src: string; alt: string; pattern?: number };

/**
 * Shared frame of the service and project pages — the reference's case-study
 * pattern on a light ground: info block top-left, action top-right, a vertical
 * list of media, then the write-up; the sticky bar sits at the bottom.
 * Everything renders on the server, so a direct load is a complete page.
 */
export function CaseLayout({
  lang,
  content,
  paths,
  title,
  info,
  action,
  media,
  children,
  prev,
  next,
  closeHref,
  homeIndex,
}: {
  lang: Locale;
  content: SiteContent;
  paths: Record<Locale, string>;
  title: string;
  info: [string, string][];
  action?: React.ReactNode;
  media: CaseMedia[];
  children: React.ReactNode;
  prev: Neighbour;
  next: Neighbour;
  closeHref: string;
  homeIndex?: number;
}) {
  const sc = getShowcaseCopy(lang);
  return (
    <div className="theme-paper min-h-dvh bg-paper pb-32 text-ink-950">
      <SiteChrome lang={lang} tone="paper" t={chromeCopy(lang)} about={aboutData(lang, content)} channels={contactChannels(lang, content)} paths={paths} fab={false} />
      <main className="px-gutter pt-[calc(env(safe-area-inset-top)+96px)] sm:pt-[132px]">
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-end">
          <div className="case-in">
            <h1 className="max-w-[18ch] text-[clamp(34px,5.6vw,88px)] font-medium leading-[0.98] tracking-[-0.04em] text-balance">{title}</h1>
            {info.length > 0 && (
              <dl className="mt-8 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {info.map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow text-ink-950/60">{k}</dt>
                    <dd className="mt-1.5 text-[15px] leading-[1.35]">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {action && (
            <div className="case-in md:justify-self-end" style={{ "--d": "120ms" } as React.CSSProperties}>
              {action}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6">
          {media.map((m, i) => (
            <div key={m.src + i} className="case-in relative aspect-[16/10] overflow-hidden rounded-[10px] bg-black/5 sm:aspect-[16/9]" style={{ "--d": `${200 + i * 80}ms` } as React.CSSProperties}>
              {m.pattern !== undefined ? <CaseCover pattern={m.pattern} photo={m.src} alt={m.alt} /> : <Image src={m.src} alt={m.alt} fill sizes="100vw" className="object-cover" priority={i === 0} />}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[1080px] sm:mt-24">{children}</div>
      </main>
      <CaseBar title={title} prev={prev} next={next} closeHref={closeHref} homeIndex={homeIndex} labels={{ prev: sc.prev, next: sc.next, close: sc.case.backHome, progress: sc.case.progress }} />
    </div>
  );
}
