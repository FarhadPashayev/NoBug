import type { Dictionary } from "@/lib/i18n/dict";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";

/**
 * Stats bar — navy band continues. Big statement left, four figures in a
 * divided row, then the "tooling" strip (the template's "Recognized by").
 * All figures already exist in the dictionary; nothing is invented.
 */
export function Stats({ t }: { t: Dictionary }) {
  const figures: [string, string, string][] = [...t.figures, t.tpl.founded];
  const tools = t.techRows.filter((r) => r[2] !== "—").map((r) => r[2]);

  return (
    <section data-bg="dark" className="text-white">
      <div className="container-site pb-[clamp(56px,7vw,112px)]">
        <Rise className="max-w-[26ch]">
          <h2 className="text-[clamp(36px,5vw,72px)] font-medium leading-[1.02] tracking-[-0.035em]">{t.tpl.statsTitle}</h2>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-grey-navy">{t.tpl.statsText}</p>
        </Rise>

        <Stagger className="mt-[clamp(40px,5vw,80px)] grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {figures.map(([value, label, source], i) => (
            <StaggerItem key={label} className={`px-6 ${i ? "lg:border-l lg:border-fog-navy" : "lg:pl-0"} ${i % 2 ? "border-l border-fog-navy lg:border-l" : ""}`}>
              <div className="text-[clamp(40px,5vw,72px)] font-semibold leading-[1] tracking-[-0.04em]">{value}</div>
              <div className="mono-label mt-3 text-grey-navy">{label}</div>
              <div className="mt-1 font-mono text-[11px] tracking-[0.08em] text-grey-navy/60">{source}</div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-fog-navy pt-8">
          <div className="text-[15px] text-grey-navy">{t.tpl.toolsLabel}</div>
          <ul className="m-0 flex list-none flex-wrap gap-x-10 gap-y-3 p-0">
            {tools.map((tool) => (
              <li key={tool} className="border-b border-fog-navy pb-1 text-[15px] font-medium text-white/80">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
