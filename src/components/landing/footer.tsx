import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { FOOTER_COMPANY_ANCHORS, type Dictionary } from "@/lib/i18n/dict";
import { FOOTER_SERVICES, serviceHref, serviceIndex } from "@/lib/services";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";
import { LEGAL_KEYS, legalHref } from "@/lib/legal";
import { Logo } from "@/components/ui/logo";
import { TrackedAnchor } from "@/components/ui/tracked";

const LINK = "text-[15px] leading-[1.5] text-grey transition-colors hover:text-ink";

/** Footer — light. Logo + blurb, four link columns, hairline, © row. */
export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [servicesCol, companyCol, legalCol] = t.footerCols;

  return (
    <footer data-bg="light" className="border-t border-fog text-ink">
      <div className="container-site pb-10 pt-[clamp(48px,6vw,96px)]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-[300px] md:col-span-1">
            <Logo href={`/${lang}#top`} variant="dark" height={22} />
            <p className="mt-5 text-[14px] leading-[1.6] text-grey">{t.meta.description}</p>
            <div className="mt-6 flex gap-6">
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="mono-label text-ink transition-colors hover:text-red">
                LinkedIn
              </a>
            </div>
          </div>

          <Col title={servicesCol[0]}>
            {FOOTER_SERVICES.map((id, i) => (
              <li key={id}>
                <Link href={serviceHref(lang, id)} className={LINK}>
                  {servicesCol[1][i] ?? t.services[serviceIndex(id)][0]}
                </Link>
              </li>
            ))}
          </Col>
          <Col title={companyCol[0]}>
            {companyCol[1].map((label, i) => (
              <li key={label}>
                <Link href={`/${lang}${FOOTER_COMPANY_ANCHORS[i] ?? "#top"}`} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </Col>
          <Col title={legalCol[0]}>
            {LEGAL_KEYS.map((key, i) => (
              <li key={key}>
                <Link href={legalHref(lang, key)} className={LINK}>
                  {legalCol[1][i]}
                </Link>
              </li>
            ))}
          </Col>
          <Col title={t.footerContact}>
            <li>
              <TrackedAnchor href={`mailto:${CONTACT_EMAIL}`} event={{ name: "contact_email_click", params: { locale: lang } }} className={LINK}>
                {CONTACT_EMAIL}
              </TrackedAnchor>
            </li>
            {/* TODO: phone + WhatsApp when the number is issued */}
            <li className="text-[15px] leading-[1.5] text-grey">{t.contactRows[0][1]}</li>
          </Col>
        </div>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-wrap items-center justify-between gap-4 border-t border-fog pt-6">
          <div className="text-[13px] text-grey">
            {t.legal[2]} {t.legal[0]}. {t.legal[1]}
          </div>
          <div className="mono-label flex flex-wrap gap-x-6 text-grey/70">
            {t.techRows
              .filter((r) => r[2] !== "—")
              .map((r) => (
                <span key={r[2]}>{r[2]}</span>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mono-label text-grey">{title}</div>
      <ul className="m-0 mt-4 flex list-none flex-col items-start gap-3 p-0">{children}</ul>
    </div>
  );
}
