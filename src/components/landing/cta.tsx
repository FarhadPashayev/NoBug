import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { CONTACT_EMAIL } from "@/lib/site";
import { Rise } from "@/components/ui/motion";
import { TrackedAnchor } from "@/components/ui/tracked";
import { ContactForm } from "@/components/site/contact-form";

/**
 * CTA banner — navy band. Red headline + contact text + email left; the
 * short enquiry form on the right where the template shows a portrait
 * (there is no portrait to show, and the form is real content).
 * Careers statement sits beneath as a single line.
 */
export function Cta({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="elaqe" data-bg="dark" className="scroll-mt-20 text-white">
      <div className="container-site section-pad grid grid-cols-12 items-center gap-x-8 gap-y-12">
        <Rise className="col-span-12 lg:col-span-6">
          <h2 className="max-w-[14ch] text-[clamp(40px,5.6vw,84px)] font-medium leading-[1] tracking-[-0.035em] text-red">{t.tpl.ctaTitle}</h2>
          <p className="mt-8 max-w-[38ch] text-[clamp(19px,1.8vw,26px)] leading-[1.35] tracking-[-0.01em]">{t.contactText}</p>

          <dl className="mt-10 grid max-w-[520px] grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="mono-label text-grey-navy">{t.contactEmailLabel}</dt>
              <dd className="m-0 mt-2 text-[17px]">
                <TrackedAnchor href={`mailto:${CONTACT_EMAIL}`} event={{ name: "contact_email_click", params: { locale: lang } }} className="border-b border-fog-navy pb-0.5 transition-colors hover:border-white">
                  {CONTACT_EMAIL}
                </TrackedAnchor>
                <div className="mt-2 text-[14px] text-grey-navy">{t.contactReplyNote}</div>
              </dd>
            </div>
            {/* TODO: phone + WhatsApp when the number is issued */}
            {t.contactRows.map(([label, value]) => (
              <div key={label}>
                <dt className="mono-label text-grey-navy">{label}</dt>
                <dd className="m-0 mt-2 text-[17px]">{value}</dd>
              </div>
            ))}
          </dl>
        </Rise>

        <Rise delay={0.1} className="col-span-12 lg:col-span-5 lg:col-start-8">
          <div className="rounded-[20px] border border-fog-navy bg-ink-2 p-[clamp(24px,3vw,40px)]">
            <div className="mono-label text-grey-navy">{t.formLabel}</div>
            <ContactForm lang={lang} t={t} tone="template" />
          </div>
        </Rise>

        <div id="karyera" className="col-span-12 scroll-mt-24 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-fog-navy pt-8">
          <div className="text-[17px] font-medium">{t.careersTitle}</div>
          <p className="m-0 max-w-[64ch] text-[15px] leading-[1.6] text-grey-navy">{t.careersText}</p>
        </div>
      </div>
    </section>
  );
}
