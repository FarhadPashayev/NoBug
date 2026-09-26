import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { HeroIntro } from "@/components/site/hero-intro";
import { HeroPattern } from "./hero-pattern";

/**
 * Hero — light ground. Big headline left, animated wordmark right (intro
 * choreography in hero-intro.tsx), then the "projects in production" strip
 * in place of the template's "Trusted by" logo row. Partner logos appear
 * only once the panel has some: nothing is invented.
 */
export function Hero({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  const { hero, projects, partnerLogos } = content;
  return (
    <section id="top" data-bg="light" className="relative scroll-mt-24 overflow-hidden">
      <HeroPattern />
      <div className="container-site relative z-10 pb-[clamp(48px,6vw,96px)] pt-[clamp(40px,6vw,88px)]">
        <HeroIntro
          eyebrow={t.eyebrow}
          h1={hero.title}
          text={hero.subtitle}
          cta={hero.primaryCta?.label ?? t.heroLink}
          ctaHref={hero.primaryCta?.href ?? `/${lang}/anket`}
          secondary={hero.secondaryCta?.label}
          secondaryHref={hero.secondaryCta?.href}
          image={hero.image}
        >
          <div className="mt-[clamp(48px,7vw,112px)]">
            <div className="mono-label text-grey">{t.tpl.trusted}:</div>
            <ul className="m-0 mt-5 flex list-none flex-wrap items-center gap-x-[clamp(28px,4vw,56px)] gap-y-3 p-0">
              {projects.map((p) => (
                <li key={p.id} className="text-[clamp(17px,1.6vw,22px)] font-semibold tracking-[-0.02em] text-grey">
                  {p.title} <span className="ml-1 font-mono text-[11px] font-normal tracking-[0.12em]">{p.year}</span>
                </li>
              ))}
            </ul>
            {partnerLogos.length > 0 && (
              <ul className="m-0 mt-8 flex list-none flex-wrap items-center gap-x-10 gap-y-5 p-0" aria-label="Partners">
                {partnerLogos.map((l) => {
                  const img = <Image src={l.logoUrl} alt={l.name} width={140} height={48} className="h-8 w-auto max-w-[140px] object-contain opacity-70 grayscale transition-opacity hover:opacity-100" unoptimized />;
                  return (
                    <li key={l.id}>
                      {l.url ? (
                        <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name}>
                          {img}
                        </a>
                      ) : (
                        img
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </HeroIntro>
      </div>
    </section>
  );
}
