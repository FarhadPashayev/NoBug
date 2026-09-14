import type { Dictionary } from "@/lib/i18n/dict";
import { figureCaption } from "@/lib/figures";
import { Figure } from "@/components/ui/figure";

/**
 * Texnologiya və təhlükəsizlik — a real table, deliberately dry. Certification
 * is not claimed; when certificates exist, switch the columns back to
 * standard / scope / valid until / certificate no.
 */
export function Technology({ t }: { t: Dictionary }) {
  return (
    <section id="texnologiya" className="container-site section-pad scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h2 className="type-h2 m-0 max-w-[20ch]">{t.techTitle}</h2>
        <p className="type-small m-0 max-w-[48ch] text-muted">{t.techNote}</p>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {t.techHead.map((h) => (
                <th key={h} scope="col" className="mono-label border-b border-navy pb-3 pr-4 text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.techRows.map(([area, approach, tooling, status]) => (
              <tr key={area} className="group transition-colors duration-200 ease-[var(--ease-brand)] hover:bg-surface">
                {/* leftmost cell gains a 2px accent bar via inset shadow + padding shift */}
                <th scope="row" className="border-b border-hairline py-[18px] pr-4 text-[17px] font-medium leading-[1.4] transition-[box-shadow,padding] duration-200 ease-[var(--ease-brand)] group-hover:pl-3 group-hover:shadow-[inset_2px_0_0_0_var(--color-accent)]">
                  {area}
                </th>
                <td className="type-small border-b border-hairline py-[18px] pr-4 text-muted">{approach}</td>
                <td className="type-small whitespace-nowrap border-b border-hairline py-[18px] pr-4">{tooling}</td>
                <td className="whitespace-nowrap border-b border-hairline py-[18px] font-mono text-[13px] leading-[1.5] text-muted">{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 font-mono text-[11px] tracking-[0.08em] text-muted">{t.techFootnote}</div>

      <Figure src="/assets/IMG-07_data-field_16x9.png" alt={t.alt07} caption={figureCaption(t, "tech")} ratio="16 / 9" className="mt-[clamp(40px,5vw,72px)]" sizes="(min-width: 1440px) 1280px, 100vw" />
    </section>
  );
}
