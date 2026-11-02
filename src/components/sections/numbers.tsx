import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHead } from "./section-head";

/** Figures from the panel (Stat) and the partner logo strip (PartnerLogo) — the strip only when logos exist. */
export function NumbersSection({ title, lead, stats, logos, clientsTitle }: { title: string; lead: string; stats: SiteContent["stats"]; logos: SiteContent["partnerLogos"]; clientsTitle: string }) {
  return (
    <section id="haqqinda" className="scroll-mt-6 px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={3} title={title} lead={lead} />
      <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label} className="border-t border-ink-line pt-5">
            <div className="text-[clamp(40px,5.4vw,84px)] font-medium leading-none tracking-[-0.04em] tabular-nums">{s.value}</div>
            <div className="mt-3 max-w-[24ch] text-[15px] leading-[1.4] text-paper/70">{s.label}</div>
            {s.source && <div className="eyebrow mt-2 text-paper/60">{s.source}</div>}
          </StaggerItem>
        ))}
      </Stagger>

      {logos.length > 0 && (
        <Rise className="mt-20">
          <h3 className="eyebrow text-paper/60">{clientsTitle}</h3>
          <ul aria-label={clientsTitle} className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-ink-line sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((l) => {
              const img = <Image src={l.logoUrl} alt={l.name} width={160} height={64} className="h-10 w-auto object-contain opacity-70 brightness-0 invert transition-opacity group-hover:opacity-100" />;
              return (
                <li key={l.id} className="flex h-28 items-center justify-center bg-ink-950">
                  {l.url ? (
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex h-full w-full items-center justify-center">
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </li>
              );
            })}
          </ul>
        </Rise>
      )}
    </section>
  );
}
