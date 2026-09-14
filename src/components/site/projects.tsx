import type { Dictionary } from "@/lib/i18n/dict";

/**
 * Layihələr — three numbered hairline rows: label · description · year.
 * No links, no screenshots. Entry 01 is deliberately unnamed (see case study).
 */
export function Projects({ t }: { t: Dictionary }) {
  return (
    <section id="layiheler" className="container-site section-pad scroll-mt-20">
      <div className="mono-label text-muted">{t.projects.eyebrow}</div>
      <h2 className="type-h2 mt-4 max-w-[20ch]">{t.projects.title}</h2>

      <ol className="m-0 mt-10 list-none border-t border-navy p-0">
        {t.projects.items.map(([label, text, year], n) => (
          <li key={label} className="flex flex-wrap items-baseline gap-x-[clamp(14px,2.5vw,40px)] gap-y-2 border-b border-hairline py-[clamp(20px,2.4vw,28px)] pl-4 pr-4">
            <span className="w-7 flex-none font-mono text-xs tracking-[0.08em] text-muted">{String(n + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-[1_1_220px] text-[clamp(22px,2.2vw,34px)] font-medium leading-[1.18] tracking-[-0.02em]">{label}</span>
            <span className="type-small min-w-0 flex-[1_1_260px] text-muted">{text}</span>
            <span className="mono-label flex-none text-muted">{year}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
