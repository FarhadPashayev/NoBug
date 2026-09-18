import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { HeroIntro } from "@/components/site/hero-intro";
import { HeroPattern } from "./hero-pattern";

/**
 * Hero — light ground. Big headline left, animated wordmark right (intro
 * choreography in hero-intro.tsx), then the "projects in production" strip
 * in place of the template's "Trusted by" logo row. No client logos are
 * invented: the strip names what actually exists.
 */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section
      id="top"
      data-bg="light"
      className="relative scroll-mt-24 overflow-hidden"
    >
      <HeroPattern />
      <div className="container-site relative z-10 pb-[clamp(48px,6vw,96px)] pt-[clamp(40px,6vw,88px)]">
        <HeroIntro
          eyebrow={t.eyebrow}
          h1={t.h1}
          text={t.heroText}
          cta={t.heroLink}
          ctaHref={`/${lang}/anket`}
          secondary={t.tpl.ctaSecondary}
          secondaryHref={`/${lang}#xidmetler`}
        >
          <div className="mt-[clamp(48px,7vw,112px)]">
            <div className="mono-label text-grey">{t.tpl.trusted}:</div>
            <ul className="m-0 mt-5 flex list-none flex-wrap items-center gap-x-[clamp(28px,4vw,56px)] gap-y-3 p-0">
              {t.projects.items.map(([label, , year]) => (
                <li
                  key={label}
                  className="text-[clamp(17px,1.6vw,22px)] font-semibold tracking-[-0.02em] text-grey opacity-70"
                >
                  {label}{" "}
                  <span className="ml-1 font-mono text-[11px] font-normal tracking-[0.12em] opacity-70">
                    {year}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </HeroIntro>
      </div>
    </section>
  );
}
