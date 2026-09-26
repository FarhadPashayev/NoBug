import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise } from "@/components/ui/motion";
import { TrackedAnchor } from "@/components/ui/tracked";
import { ContactForm } from "@/components/site/contact-form";

/**
 * CTA banner — navy band. Headline + contact details left (email, phones
 * when issued, address, hours — all from Sayt parametrləri); the short
 * enquiry form on the right. Careers statement sits beneath as a single line.
 */
export function Cta({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  const { email, phones, address, hours } = content.settings;
  const rows: [string, React.ReactNode][] = [
    ...phones.map((p, i): [string, React.ReactNode] => [
      i === 0 ? "Telefon" : `Telefon ${i + 1}`,
      <a key={p} href={`tel:${p.replace(/\s+/g, "")}`} className="border-b border-fog-navy pb-0.5 transition-colors hover:border-white">
        {p}
      </a>,
    ]),
    ...(address ? ([[t.contactRows[0][0], address]] as [string, React.ReactNode][]) : []),
    ...(hours ? ([[t.contactRows[1][0], hours]] as [string, React.ReactNode][]) : []),
  ];

  return (
    <section id="elaqe" data-bg="dark" className="scroll-mt-20 text-white">
      <div className="container-site section-pad grid grid-cols-12 items-center gap-x-4 md:gap-x-8 gap-y-12">
        <Rise className="col-span-12 lg:col-span-6">
          <h2 className="max-w-[14ch] text-[clamp(40px,5.6vw,84px)] font-medium leading-[1] tracking-[-0.035em] text-yellow">{t.tpl.ctaTitle}</h2>
          <p className="mt-8 max-w-[38ch] text-[clamp(19px,1.8vw,26px)] leading-[1.35] tracking-[-0.01em]">{t.contactText}</p>

          <dl className="mt-10 grid max-w-[520px] grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="mono-label text-grey-navy">{t.contactEmailLabel}</dt>
              <dd className="m-0 mt-2 text-[17px]">
                <TrackedAnchor href={`mailto:${email}`} event={{ name: "contact_email_click", params: { locale: lang } }} className="border-b border-fog-navy pb-0.5 transition-colors hover:border-white">
                  {email}
                </TrackedAnchor>
                <div className="mt-2 text-[14px] text-grey-navy">{t.contactReplyNote}</div>
              </dd>
            </div>
            {rows.map(([label, value]) => (
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
