import { Quote } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dict";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";

/**
 * Light band in the template's "client feedback" layout. There are no client
 * testimonials yet, so it carries what is true: the company's position
 * statement as the quote card, the About paragraphs, and the case study's
 * three blocks as a row of cards.
 */
export function Position({ t }: { t: Dictionary }) {
  const cs = t.caseStudy;
  return (
    <section id="haqqinda" data-bg="light" className="scroll-mt-20 text-ink">
      <div className="container-site section-pad">
        <Rise>
          <h2 className="text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.tpl.positionTitle}</h2>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-[1.6] text-grey">{t.aboutP1}</p>
        </Rise>

        <div className="mt-[clamp(40px,5vw,72px)] grid grid-cols-12 gap-x-8 gap-y-10">
          {/* quote card */}
          <Rise className="col-span-12 lg:col-span-7">
            <div className="rounded-[20px] border border-fog bg-white p-[clamp(24px,3vw,40px)]">
              <Quote size={28} className="text-fog" aria-hidden="true" />
              <blockquote className="m-0 mt-4 font-serif text-[clamp(22px,2.4vw,32px)] italic leading-[1.35] tracking-[-0.01em]">{t.quote}</blockquote>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-fog pt-4">
                <span className="mono-label text-ink">{t.quoteName}</span>
                <span className="text-[15px] text-grey">— {t.quoteTitle}</span>
              </div>
            </div>
          </Rise>
          <Rise delay={0.1} className="col-span-12 lg:col-span-5">
            <p className="text-[17px] leading-[1.6] text-ink">{t.aboutP2}</p>
          </Rise>
        </div>

        {/* case study — three cards */}
        <div id="layihe-icmali" className="mt-[clamp(56px,7vw,104px)] scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.15] tracking-[-0.025em]">{cs.title}</h3>
            <div className="mono-label text-grey">
              {cs.labels[0]}: {cs.facts[0]} · {cs.labels[1]}: {cs.facts[1]} · {cs.labels[3]}: {cs.facts[3]}
            </div>
          </div>
          <Stagger className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {cs.blocks.map(([heading, text], i) => (
              <StaggerItem key={heading} className="rounded-[20px] border border-fog bg-white p-7">
                <div className="tag-line text-red">
                  <span>0{i + 1}</span>
                  <span className="text-ink">{heading}</span>
                </div>
                <p className="mt-5 text-[15px] leading-[1.6] text-grey">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
