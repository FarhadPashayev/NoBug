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
        <Rise className="mx-auto max-w-[62ch] text-center">
          <h2 className="text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.faq.title}</h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-grey">{t.faq.lead}</p>
        </Rise>

        <Rise delay={0.1} className="mx-auto mt-[clamp(32px,4vw,56px)] max-w-[760px]">
          <FaqList items={content.faq} />
        </Rise>

        <Rise delay={0.15} className="mt-[clamp(32px,4vw,48px)] flex flex-wrap justify-center gap-3">
          <Link href={`/${lang}/anket`} className="pill pill-yellow">
            {t.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href={`/${lang}#elaqe`} className="pill pill-outline">
            {t.faq.ask}
          </Link>
        </Rise>
      </div>
    </section>
  );
}
