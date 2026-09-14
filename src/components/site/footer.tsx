import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { FOOTER_COMPANY_ANCHORS, type Dictionary } from "@/lib/i18n/dict";
import { FOOTER_SERVICES, serviceHref, serviceIndex } from "@/lib/services";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";
import { Logo } from "@/components/ui/logo";

const LINK = "link-rule text-[15px] leading-[1.5] text-body-navy";

/** Footer — navy: white logo, four-column index, baseline row. */
export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [servicesCol, companyCol, legalCol] = t.footerCols;

  return (
    <footer className="border-t border-navy-line bg-navy text-body-navy">
      <div className="container-site pb-8 pt-[clamp(40px,5vw,80px)]">
        <Logo href={`/${lang}#top`} variant="white" height={26} className="mb-[clamp(32px,4vw,56px)]" />

        <div className="grid grid-cols-2 gap-x-[clamp(24px,4vw,48px)] gap-y-10 md:grid-cols-4">
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

          {/* Legal pages do not exist yet — hrefs stay "#top" until they are created. */}
          <Col title={legalCol[0]}>
            {legalCol[1].map((label) => (
              <li key={label}>
                <Link href={`/${lang}#top`} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </Col>

          <Col title={t.footerContact}>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
                {CONTACT_EMAIL}
              </a>
            </li>
            {/* TODO: phone + WhatsApp when the number is issued */}
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                LinkedIn
              </a>
            </li>
          </Col>
        </div>

        <div className="mb-5 mt-[clamp(36px,4.5vw,64px)] h-px bg-navy-line" />
        <div className="mono-label flex flex-wrap gap-[clamp(16px,3vw,48px)] text-muted">
          {t.legal.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mono-label text-muted-navy">{title}</div>
      <ul className="m-0 mt-4 flex list-none flex-col items-start gap-2.5 p-0">{children}</ul>
    </div>
  );
}
