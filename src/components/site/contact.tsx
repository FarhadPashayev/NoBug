import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { CONTACT_EMAIL } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { TrackedAnchor } from "@/components/ui/tracked";

/** Əlaqə — navy band: intro · contact index · 3-field underline form. */
export function Contact({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="elaqe" className="scroll-mt-20 bg-navy text-paper">
      <div className="container-site grid grid-cols-1 items-start gap-[clamp(32px,5vw,80px)] py-[clamp(48px,6vw,96px)] md:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 max-w-[40ch]">
          <div className="mono-label text-muted-navy">{t.contactEyebrow}</div>
          <h2 className="type-h2 mt-5">{t.contactTitle}</h2>
          <p className="type-body mt-5 text-body-navy">{t.contactText}</p>
        </div>

        <dl className="m-0 grid min-w-0 gap-6">
          {/* the single contact channel carries the weight: email + reply commitment */}
          <div className="border-t border-navy-line pt-3">
            <dt className="mono-label text-muted-navy">{t.contactEmailLabel}</dt>
            <dd className="m-0 mt-2 text-[17px] leading-[1.5]">
              <TrackedAnchor href={`mailto:${CONTACT_EMAIL}`} event={{ name: "contact_email_click", params: { locale: lang } }} className="link-rule text-paper">
                {CONTACT_EMAIL}
              </TrackedAnchor>
            </dd>
            <dd className="type-small m-0 mt-2 text-body-navy">{t.contactReplyNote}</dd>
          </div>
          {/* TODO: phone + WhatsApp when the number is issued */}
          {t.contactRows.map(([label, value]) => (
            <div key={label} className="border-t border-navy-line pt-3">
              <dt className="mono-label text-muted-navy">{label}</dt>
              <dd className="m-0 mt-2 text-[17px] leading-[1.5]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="min-w-0 md:col-span-2 md:max-w-[520px] lg:col-span-1 lg:max-w-none">
          <div className="mono-label text-muted-navy">{t.formLabel}</div>
          <ContactForm lang={lang} t={t} />
        </div>
      </div>
    </section>
  );
}
