import { ArrowRight } from "lucide-react";
import { Rise } from "@/components/ui/motion";

/**
 * The company statement right after the showcase: the first screen stays a
 * clean carousel like the reference, the headline (h1) and the main call to
 * action follow as soon as the carousel releases the scroll.
 */
export function IntroSection({ headline, subline, cta }: { headline: string; subline: string; cta: string }) {
  return (
    <section className="px-gutter pb-[clamp(24px,4vw,64px)] pt-[clamp(96px,14vw,200px)]">
      <Rise>
        <h1 className="max-w-[20ch] text-[clamp(34px,6.2vw,96px)] font-medium leading-[1.02] tracking-[-0.04em] text-balance">{headline}</h1>
      </Rise>
      <Rise delay={0.08} className="mt-8 flex flex-col items-start gap-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[44ch] text-[clamp(16px,1.4vw,19px)] leading-[1.5] text-paper/65">{subline}</p>
        <a href="#elaqe" className="inline-flex min-h-12 flex-none items-center gap-2 rounded-full bg-yellow px-6 text-[15px] font-medium text-ink-950 transition-colors hover:bg-yellow-600">
          {cta}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </Rise>
    </section>
  );
}
