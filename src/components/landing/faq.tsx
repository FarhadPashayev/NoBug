import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise } from "@/components/ui/motion";
import { FaqList } from "./faq-list";

/**
 * Tez-tez verilən suallar — the chat layout from fortemplate/ (question as a
 * navy bubble, answer as a white bubble with the brand mark): centred title
 * and lead, the thread, then the two calls to action. Items come from the
 * panel (Suallar); the section disappears when there are none.
 */
export function Faq({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  if (!content.faq.length) return null;
  return (
    <section id="sss" data-bg="light" className="scroll-mt-20 text-ink">
      <div className="container-site section-pad">
        {/* phones/tablets: stacked and centred; desktop: the heading column stays put while the thread scrolls */}
        <div className="grid grid-cols-12 gap-x-4 gap-y-10 md:gap-x-8">
          <Rise className="col-span-12 text-center lg:col-span-5 lg:self-start lg:text-left lg:sticky lg:top-28">
            <div className="mono-label text-grey">FAQ</div>
            <h2 className="mt-4 text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.faq.title}</h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[17px] leading-[1.6] text-grey lg:mx-0">{t.faq.lead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href={`/${lang}/anket`} className="pill pill-yellow">
                {t.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href={`/${lang}#elaqe`} className="pill pill-outline">
                {t.faq.ask}
              </Link>
            </div>
          </Rise>

          <Rise delay={0.1} className="col-span-12 lg:col-span-7">
            <FaqList items={content.faq} />
          </Rise>
        </div>
      </div>
    </section>
  );
}
