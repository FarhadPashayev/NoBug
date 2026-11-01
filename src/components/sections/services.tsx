import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { SiteContent } from "@/lib/content";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { serviceHref } from "@/lib/showcase-data";
import { SectionHead } from "./section-head";

/** One short card per service, each linking to its case-study style page. */
export function ServicesSection({ lang, title, lead, services, primaryLabel, cta }: { lang: Locale; title: string; lead: string; services: SiteContent["services"]; primaryLabel: string; cta: string }) {
  // the closing tile fills what is left of the last row (2 and 3 columns)
  const sm = services.length % 2 === 0 ? "sm:col-span-2" : "";
  const lg = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"][services.length % 3];
  return (
    <section id="xidmetler" className="scroll-mt-6 px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={1} title={title} lead={lead} />
      <Stagger className="mt-12 grid gap-px overflow-hidden rounded-[10px] bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <StaggerItem key={s.id} className="bg-ink-950">
            <Link href={serviceHref(lang, s.slug)} className="group flex h-full min-h-[220px] flex-col justify-between gap-10 p-6 transition-colors hover:bg-ink-900 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[12px] text-paper/60">{String(i + 1).padStart(2, "0")}</span>
                {s.primary && <span className="eyebrow rounded-full border border-yellow/40 px-2.5 py-1 text-yellow">{primaryLabel}</span>}
              </div>
              <div>
                <h3 className="flex items-start justify-between gap-4 text-[clamp(20px,1.8vw,26px)] font-medium leading-[1.15] tracking-[-0.02em]">
                  {s.name}
                  <ArrowUpRight size={20} aria-hidden="true" className="mt-1 flex-none text-paper/60 transition-[color,translate] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-yellow" />
                </h3>
                <p className="mt-3 text-[15px] leading-[1.5] text-paper/55">{s.shortDescription}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
        <StaggerItem className={`bg-ink-950 ${sm} ${lg}`}>
          <Link href={`/${lang}/anket`} className="group flex h-full min-h-[220px] items-end justify-between gap-6 bg-yellow/[0.06] p-6 transition-colors hover:bg-yellow/[0.12] sm:p-8">
            <span className="max-w-[18ch] text-[clamp(20px,1.8vw,26px)] font-medium leading-[1.15] tracking-[-0.02em] text-yellow">{cta}</span>
            <ArrowUpRight size={22} aria-hidden="true" className="flex-none text-yellow transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
