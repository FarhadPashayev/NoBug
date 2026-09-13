import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { ContactForm } from "./contact-form";

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
          {t.contactRows.map(([label, value], i) => (
            <div key={label} className="border-t border-navy-line pt-3">
              <dt className="mono-label text-muted-navy">{label}</dt>
              <dd className="m-0 mt-2 text-[17px] leading-[1.5]">
                {i === 0 ? (
                  <a href={`mailto:${value}`} className="link-rule text-paper">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
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
