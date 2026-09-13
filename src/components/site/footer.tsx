import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { FOOTER_COMPANY_ANCHORS, FOOTER_SERVICE_INDEX, type Dictionary } from "@/lib/i18n/dict";
import { Logo } from "@/components/ui/logo";

const LINKEDIN = "https://www.linkedin.com/company/nobug";

/** Footer — navy: white logo, four-column index, baseline row. */
export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const linkCls = "link-rule text-[15px] leading-[1.5] text-body-navy";

  // Resolve each column's targets; legal pages don't exist yet → anchor to top.
  const hrefFor = (col: number, i: number, label: string): string => {
    if (col === 0) return `/${lang}/anket?xidmet=${FOOTER_SERVICE_INDEX[i] ?? 0}`;
    if (col === 1) return `/${lang}${FOOTER_COMPANY_ANCHORS[i] ?? "#top"}`;
    if (col === 3) return label.includes("@") ? `mailto:${label}` : LINKEDIN;
    return `/${lang}#top`;
  };

  return (
    <footer className="border-t border-navy-line bg-navy text-body-navy">
      <div className="container-site pb-8 pt-[clamp(40px,5vw,80px)]">
        <Logo href={`/${lang}#top`} variant="white" height={26} className="mb-[clamp(32px,4vw,56px)]" />

        <div className="grid grid-cols-2 gap-x-[clamp(24px,4vw,48px)] gap-y-10 md:grid-cols-4">
          {t.footerCols.map(([title, items], ci) => (
            <div key={title} className="min-w-0">
              <div className="mono-label text-muted-navy">{title}</div>
              <ul className="m-0 mt-4 flex list-none flex-col items-start gap-2.5 p-0">
                {items.map((label, ii) => {
                  const href = hrefFor(ci, ii, label);
                  const external = href.startsWith("http");
                  return (
                    <li key={label}>
                      {external || href.startsWith("mailto:") ? (
                        <a href={href} className={linkCls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                          {label}
                        </a>
                      ) : (
                        <Link href={href} className={linkCls}>
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
