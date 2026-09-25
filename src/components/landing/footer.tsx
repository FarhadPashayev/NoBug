import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { LEGAL_KEYS, legalHref } from "@/lib/legal";
import { Logo } from "@/components/ui/logo";
import { TrackedAnchor } from "@/components/ui/tracked";

const LINK = "text-[15px] leading-[1.5] text-grey transition-colors hover:text-ink";
const SOCIAL: [keyof SiteContent["settings"]["social"], string][] = [
  ["linkedin", "LinkedIn"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["x", "X"],
];

/** Footer — light. Logo + blurb, four link columns, hairline, © row. Links and contact details come from Sayt parametrləri. */
export function Footer({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  const [servicesCol, companyCol, legalCol] = t.footerCols;
  const { settings } = content;
  const socials = SOCIAL.filter(([k]) => settings.social[k]);
  const tools = [...new Set(content.specs.map((r) => r.tooling).filter((v) => v && v !== "—"))];

  return (
    <footer data-bg="light" className="border-t border-fog bg-light text-ink">
      <div className="container-site pb-10 pt-[clamp(48px,6vw,96px)]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-[300px] md:col-span-1">
            <Logo href={`/${lang}#top`} variant="brand" height={28} />
            <p className="mt-5 text-[14px] leading-[1.6] text-grey">{t.meta.description}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-6">
                {socials.map(([k, label]) => (
                  <a key={k} href={settings.social[k]} target="_blank" rel="noopener noreferrer" className="mono-label text-ink transition-colors hover:text-yellow-700">
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <Col title={servicesCol[0]}>
            {settings.footerLinks.services.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Col>
          <Col title={companyCol[0]}>
            {settings.footerLinks.company.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className={LINK}>
                  {l.label}
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
            {settings.footerLinks.legal.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Col>
          <Col title={t.footerContact}>
            <li>
              <TrackedAnchor href={`mailto:${settings.email}`} event={{ name: "contact_email_click", params: { locale: lang } }} className={LINK}>
                {settings.email}
              </TrackedAnchor>
            </li>
            {settings.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p.replace(/\s+/g, "")}`} className={LINK}>
                  {p}
                </a>
              </li>
            ))}
            {settings.address && <li className="text-[15px] leading-[1.5] text-grey">{settings.address}</li>}
          </Col>
        </div>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-wrap items-center justify-between gap-4 border-t border-fog pt-6">
          <div className="text-[13px] text-grey">
            {t.legal[2]} {t.legal[0]}. {t.legal[1]}
          </div>
          <div className="mono-label flex flex-wrap gap-x-6 text-grey/70">
            {tools.map((tool) => (
              <span key={tool}>{tool}</span>
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
