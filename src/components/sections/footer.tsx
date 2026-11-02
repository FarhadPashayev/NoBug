import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { LEGAL_KEYS, legalHref } from "@/lib/legal";
import { Logo } from "@/components/ui/logo";
import { ChannelIcon, type Channel } from "@/components/chrome/channels";
import { TrackedAnchor } from "@/components/ui/tracked";

const LINK = "text-[15px] leading-[1.5] text-paper/60 transition-colors hover:text-paper [overflow-wrap:anywhere]";

/** Dark footer: wordmark, link columns from Sayt parametrləri, careers note, legal row. */
export function SiteFooter({ lang, t, content, channels, rights }: { lang: Locale; t: Dictionary; content: SiteContent; channels: Channel[]; rights: string }) {
  const [servicesCol, companyCol, legalCol] = t.footerCols;
  const { settings } = content;
  const social = channels.filter((c) => c.external);

  return (
    <footer className="px-gutter pb-[max(2rem,env(safe-area-inset-bottom))] pt-[clamp(72px,8vw,128px)]">
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-ink-line pt-10 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Logo href={`/${lang}#top`} variant="brand-dark" height={30} />
          <p className="mt-5 max-w-[36ch] text-[14px] leading-[1.6] text-paper/60">{t.meta.description}</p>
          {social.length > 0 && (
            <div className="mt-6 flex gap-2">
              {social.map((c) => (
                <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.label} className="round-btn text-paper/80">
                  <ChannelIcon id={c.id} size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
        <Col title={servicesCol[0]}>
          {content.services.map((s) => (
            <li key={s.id}>
              <Link href={`/${lang}/xidmetler/${s.slug}`} className={LINK}>
                {s.name}
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
          <li id="karyera" className="mt-3 max-w-[30ch] scroll-mt-6">
            <span className="block text-[13px] font-medium text-paper/80">{t.careersTitle}</span>
            <span className="mt-1 block text-[13px] leading-[1.5] text-paper/60">{t.careersText}</span>
            <a href={`mailto:${settings.email}?subject=${encodeURIComponent(t.careersTitle)}`} className="mt-2 inline-block text-[13px] text-yellow underline underline-offset-4">
              {t.careersLink}
            </a>
          </li>
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
        {/* contact details from Sayt parametrləri */}
        <Col title={t.footerContact}>
          {settings.email && (
            <li>
              <TrackedAnchor href={`mailto:${settings.email}`} event={{ name: "contact_email_click", params: { locale: lang } }} className={LINK}>
                {settings.email}
              </TrackedAnchor>
            </li>
          )}
          {settings.phones.map((p) => (
            <li key={p}>
              <TrackedAnchor href={`tel:${p.replace(/\s+/g, "")}`} event={{ name: "contact_phone_click", params: { locale: lang } }} className={LINK}>
                {p}
              </TrackedAnchor>
            </li>
          ))}
          {settings.address && <li className="text-[15px] leading-[1.5] text-paper/60">{settings.address}</li>}
          {settings.hours && <li className="text-[13px] leading-[1.5] text-paper/60">{settings.hours}</li>}
        </Col>
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[13px] text-paper/60">
        <span>
          © {new Date().getFullYear()} nobug. {rights}
        </span>
        {settings.legal.name && (
          <span>
            {settings.legal.name}
            {settings.legal.taxId && ` · VÖEN ${settings.legal.taxId}`}
          </span>
        )}
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow text-paper/60">{title}</div>
      <ul className="mt-4 flex flex-col items-start gap-3">{children}</ul>
    </div>
  );
}
