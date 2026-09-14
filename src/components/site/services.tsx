import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { figureCaption } from "@/lib/figures";
import { PRIMARY_SERVICES, SECONDARY_SERVICES, serviceHref, serviceIndex } from "@/lib/services";
import { Figure } from "@/components/ui/figure";

// Row hover: background → surface, 2px accent bar slides in at the left, number muted → ink, arrow fades in.
const ROW = "group relative flex flex-wrap items-baseline border-b border-hairline transition-colors duration-200 ease-[var(--ease-brand)] hover:bg-surface focus-visible:bg-surface";
const BAR = "absolute inset-y-0 left-0 w-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 ease-[var(--ease-brand)] group-hover:scale-x-100 group-focus-visible:scale-x-100";
const ARROW = "absolute right-3 text-[17px] opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1.5 group-hover:opacity-100";

/**
 * Xidmət indeksi — 4 primary services as numbered rows, then 8 secondary
 * services as a quieter two-column list. Every row links to the enquiry with
 * the stable service id preselected.
 */
export function Services({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="xidmetler" className="container-site section-pad scroll-mt-20">
      <div className="flex flex-wrap items-start gap-[clamp(24px,4vw,64px)]">
        <div className="top-24 min-w-0 max-w-[360px] flex-[1_1_240px] self-start lg:sticky">
          <div className="mono-label text-muted">{t.servicesMeta}</div>
          <h2 className="type-h2 mt-4 max-w-[16ch]">{t.servicesTitle}</h2>
          <Figure src="/assets/photo/services.webp" alt={t.alt03} caption={figureCaption(t, "services")} ratio="4 / 3" className="mt-8" sizes="(min-width: 1024px) 360px, 100vw" />
        </div>

        <div className="min-w-0 flex-[2_1_420px]">
          {/* primary — 01–04 */}
          <ol className="m-0 list-none border-t border-navy p-0">
            {PRIMARY_SERVICES.map((id, n) => {
              const [title, text] = t.services[serviceIndex(id)];
              return (
                <li key={id}>
                  <Link href={serviceHref(lang, id)} className={`${ROW} gap-x-[clamp(14px,2.5vw,40px)] gap-y-2 py-[clamp(20px,2.4vw,28px)] pl-4 pr-10`}>
                    <span aria-hidden="true" className={BAR} />
                    <span className="w-7 flex-none font-mono text-xs tracking-[0.08em] text-muted transition-colors duration-200 group-hover:text-navy">{String(n + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-[1_1_220px] text-[clamp(22px,2.2vw,34px)] font-medium leading-[1.18] tracking-[-0.02em]">{title}</span>
                    <span className="type-small min-w-0 flex-[1_1_260px] text-muted">{text}</span>
                    <span aria-hidden="true" className={`${ARROW} top-[clamp(20px,2.4vw,28px)]`}>→</span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* secondary — quieter, name only, two columns */}
          <h3 className="mono-label mt-12 text-muted">{t.servicesSecondary}</h3>
          <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-x-[clamp(16px,3vw,40px)] border-t border-hairline p-0 sm:grid-cols-2">
            {SECONDARY_SERVICES.map((id) => {
              const [title] = t.services[serviceIndex(id)];
              return (
                <li key={id}>
                  <Link href={serviceHref(lang, id)} className={`${ROW} min-h-11 py-3 pl-4 pr-10`}>
                    <span aria-hidden="true" className={BAR} />
                    <span className="min-w-0 text-[17px] font-medium leading-[1.35]">{title}</span>
                    <span aria-hidden="true" className={`${ARROW} top-3`}>→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
