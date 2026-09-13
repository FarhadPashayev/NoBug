import type { Dictionary } from "@/lib/i18n/dict";
import { Figure } from "@/components/ui/figure";
import { Reveal } from "@/components/ui/reveal";

/** Haqqında — surface band: Newsreader pull quote (the only serif) + two paragraphs, then IMG-04. */
export function About({ t }: { t: Dictionary }) {
  return (
    <section id="haqqinda" className="scroll-mt-20 border-y border-hairline bg-surface">
      <div className="container-site section-pad">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[clamp(32px,5vw,80px)]">
          <Reveal className="min-w-0">
            <div className="mono-label text-muted">{t.quoteEyebrow}</div>
            <blockquote className="m-0 mt-6 font-serif text-[clamp(24px,2.6vw,34px)] italic leading-[1.32] tracking-[-0.01em]">{t.quote}</blockquote>
            <div className="my-6 mb-3.5 h-px max-w-[120px] bg-hairline" />
            <div className="text-[15px] font-medium">{t.quoteName}</div>
            <div className="mono-label mt-1.5 text-muted">{t.quoteTitle}</div>
          </Reveal>
          <Reveal delay={40} className="min-w-0 max-w-[62ch]">
            <p className="type-body m-0">{t.aboutP1}</p>
            <p className="type-body mt-5">{t.aboutP2}</p>
          </Reveal>
        </div>
        <Figure src="/assets/IMG-04_contour-field_16x9.png" alt={t.alt04} caption={t.cap04} ratio="16 / 9" className="mt-[clamp(40px,5vw,72px)]" sizes="(min-width: 1440px) 1280px, 100vw" />
      </div>
    </section>
  );
}
