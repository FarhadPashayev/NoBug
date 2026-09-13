import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Figure } from "@/components/ui/figure";

/** Müştərilər — one quiet row of monochrome wordmarks, 40% → 100% on hover. No carousel. */
export function Clients({ t }: { t: Dictionary }) {
  return (
    <section className="border-y border-hairline bg-surface">
      <div className="container-site flex flex-wrap items-baseline gap-[clamp(24px,4vw,64px)] py-[clamp(32px,4vw,56px)]">
        <div className="mono-label flex-none text-muted">{t.clientsLabel}</div>
        <ul className="m-0 flex list-none flex-wrap gap-[clamp(24px,4vw,56px)] p-0">
          {t.clients.map((name) => (
            <li key={name} className="text-[17px] font-medium tracking-[-0.01em] opacity-40 transition-opacity duration-[160ms] ease-[var(--ease-brand)] hover:opacity-100">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Halftone divider strip (PATTERN asset) */
export function Divider() {
  return (
    <div
      aria-hidden="true"
      className="h-[clamp(40px,5vw,80px)] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/PATTERN_halftone-divider_2400x320.png')" }}
    />
  );
}

/** Karyera — IMG-05 left; statement, open-position count and one text link right. */
export function Careers({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="karyera" className="container-site section-pad scroll-mt-20">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-end gap-[clamp(32px,4vw,64px)]">
        <Figure src="/assets/IMG-05_facade-grid_3x2.png" alt={t.alt05} caption={t.cap05} ratio="3 / 2" className="min-w-0" />
        <div className="min-w-0">
          <h2 className="type-h2 m-0 max-w-[24ch]">{t.careersTitle}</h2>
          <p className="type-body mt-5 max-w-[52ch]">{t.careersText}</p>
          <div className="mb-5 mt-8 h-px bg-hairline" />
          <div className="flex flex-wrap items-baseline gap-6">
            <div className="type-figure">{t.careersCount}</div>
            <div className="mono-label text-muted">{t.careersCountLabel}</div>
          </div>
          <Link href={`/${lang}#elaqe`} className="text-link mt-8">
            {t.careersLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
