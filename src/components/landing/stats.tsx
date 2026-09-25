import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";

/**
 * Stats bar — navy band continues. Big statement left, the figures in a
 * divided row, then the "tooling" strip (the template's "Recognized by"),
 * which lists the platforms named in the standards table.
 */
export function Stats({ t, content }: { t: Dictionary; content: SiteContent }) {
  const figures = content.stats;
  const tools = [...new Set(content.specs.map((r) => r.tooling).filter((v) => v && v !== "—"))];

  return (
    <section data-bg="dark" className="text-white">
      <div className="container-site pb-[clamp(56px,7vw,112px)]">
        <div className="grid grid-cols-12 items-center gap-x-8 gap-y-10">
          <Rise className="col-span-12 max-w-[26ch] lg:col-span-6">
            <h2 className="text-[clamp(36px,5vw,72px)] font-medium leading-[1.02] tracking-[-0.035em]">{t.tpl.statsTitle}</h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-grey-navy">{t.tpl.statsText}</p>
          </Rise>
          {/* shelving scene (forWebImg/Organized Shelving Scene) — yellow boxes echo the brand accent */}
          <Rise delay={0.1} className="col-span-12 lg:col-span-6">
            <div className="tile aspect-[16/9] rounded-[24px] bg-navy-800 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <Image src="/assets/photo/team-shelves.webp" alt={t.tpl.altShelves} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Rise>
        </div>

        {figures.length > 0 && (
          <Stagger className="mt-[clamp(40px,5vw,80px)] grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {figures.map(({ value, label, source }, i) => (
              <StaggerItem key={`${value}-${i}`} className={`px-6 ${i ? "lg:border-l lg:border-fog-navy" : "lg:pl-0"} ${i % 2 ? "border-l border-fog-navy lg:border-l" : ""}`}>
                <div className="text-[clamp(40px,5vw,72px)] font-semibold leading-[1] tracking-[-0.04em]">{value}</div>
                <div className="mono-label mt-3 text-grey-navy">{label}</div>
                {source && <div className="mt-1 font-mono text-[11px] tracking-[0.08em] text-grey-navy/60">{source}</div>}
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {tools.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
