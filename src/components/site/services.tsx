import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Figure } from "@/components/ui/figure";

/**
 * Xidmət indeksi — a numbered index, not cards. Sticky left column; 12 rows on
 * the right, each linking to the sorğu with that service preselected.
 */
export function Services({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="xidmetler" className="container-site section-pad scroll-mt-20">
      <div className="flex flex-wrap items-start gap-[clamp(24px,4vw,64px)]">
        <div className="top-24 min-w-0 max-w-[360px] flex-[1_1_240px] self-start lg:sticky">
          <div className="mono-label text-muted">{t.servicesMeta}</div>
          <h2 className="type-h2 mt-4 max-w-[16ch]">{t.servicesTitle}</h2>
          <Figure src="/assets/IMG-03_topology_4x3.png" alt={t.alt03} caption={t.cap03} ratio="4 / 3" className="mt-8" sizes="(min-width: 1024px) 360px, 100vw" />
        </div>

        <ol className="min-w-0 flex-[2_1_420px] list-none border-t border-navy p-0 m-0">
          {t.services.map(([title, text], i) => (
            <li key={title}>
              <Link
                href={`/${lang}/anket?xidmet=${i}`}
                className="group relative flex flex-wrap items-baseline gap-x-[clamp(14px,2.5vw,40px)] gap-y-2 border-b border-hairline py-[clamp(20px,2.4vw,28px)] pl-4 pr-10 transition-colors duration-200 ease-[var(--ease-brand)] hover:bg-surface focus-visible:bg-surface"
              >
                {/* 2px accent bar slides in at the left edge */}
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 ease-[var(--ease-brand)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                <span className="w-7 flex-none font-mono text-xs tracking-[0.08em] text-muted transition-colors duration-200 group-hover:text-navy">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-[1_1_220px] text-[clamp(22px,2.2vw,34px)] font-medium leading-[1.18] tracking-[-0.02em]">{title}</span>
                <span className="type-small min-w-0 flex-[1_1_260px] text-muted">{text}</span>
                <span aria-hidden="true" className="absolute right-3 top-[clamp(20px,2.4vw,28px)] text-[17px] opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1.5 group-hover:opacity-100">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
