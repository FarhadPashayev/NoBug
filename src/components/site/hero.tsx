import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Reveal } from "@/components/ui/reveal";
import { HeroIntro } from "./hero-intro";

/** Hero: intro choreography (see hero-intro.tsx), then a self-drawing rule and three figures. */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section
      id="top"
      className="container-site scroll-mt-24 pb-[clamp(32px,4vw,64px)] pt-[clamp(48px,7vw,104px)]"
    >
      <HeroIntro
        eyebrow={t.eyebrow}
        h1={t.h1}
        text={t.heroText}
        cta={t.heroLink}
        ctaHref={`/${lang}/anket`}
      >
        <Reveal
          kind="rule"
          className="mt-[clamp(36px,4.5vw,64px)] h-px bg-hairline"
        />

        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:grid-cols-3">
          {t.figures.map(([value, label, source], i) => (
            <Reveal
              key={label}
              delay={i * 40}
              className="border-b border-hairline py-8"
            >
              <div className="type-figure">{value}</div>
              <div className="type-small mt-3.5 max-w-[30ch]">{label}</div>
              <div className="mono-label mt-2.5 text-muted">{source}</div>
            </Reveal>
          ))}
        </div>
      </HeroIntro>
    </section>
  );
}
