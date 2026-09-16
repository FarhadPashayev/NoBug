import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Reveal } from "@/components/ui/reveal";

/** Hero: text in columns 1–7, animated wordmark in 8–12, then a self-drawing rule and three figures. */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="top" className="container-site scroll-mt-24 pb-[clamp(32px,4vw,64px)] pt-[clamp(48px,7vw,104px)]">
      <div className="grid grid-cols-12 items-start gap-x-6 gap-y-[clamp(32px,5vw,72px)]">
        <div className="col-span-12 min-w-0 max-w-[760px] md:col-span-7">
          <div className="mono-label hero-in text-muted">{t.eyebrow}</div>
          <h1 className="type-h1 hero-in mt-6 text-balance [animation-delay:60ms]">{t.h1}</h1>
          <p className="type-body hero-in mt-6 max-w-[62ch] [animation-delay:120ms]">{t.heroText}</p>
          <Link href={`/${lang}/anket`} className="btn-primary hero-in mt-8 [animation-delay:180ms]">
            {t.heroLink}
          </Link>
        </div>
        {/* Animated wordmark (client asset). Plays once on load, ends on the final
            state, honours prefers-reduced-motion inside the SVG. Decorative: the
            brand is already named in the header, so it is hidden from AT. */}
        <div className="col-span-12 w-full md:col-span-5 md:self-center md:justify-self-end lg:max-w-[520px]" aria-hidden="true">
          <div className="border-y border-hairline py-[clamp(20px,3vw,40px)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG must not go through the image optimizer */}
            <img src="/assets/anim/nobug-logo-animated-light.svg" alt="" width={960} height={290} className="block h-auto w-full" />
          </div>
        </div>
      </div>

      <Reveal kind="rule" className="mt-[clamp(36px,4.5vw,64px)] h-px bg-hairline" />

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:grid-cols-3">
        {t.figures.map(([value, label, source], i) => (
          <Reveal key={label} delay={i * 40} className="border-b border-hairline py-8">
            <div className="type-figure">{value}</div>
            <div className="type-small mt-3.5 max-w-[30ch]">{label}</div>
            <div className="mono-label mt-2.5 text-muted">{source}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
