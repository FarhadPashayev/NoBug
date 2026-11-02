import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { SiteContent } from "@/lib/content";
import { photoAt } from "@/lib/covers";
import { projectHref } from "@/lib/showcase-data";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHead } from "./section-head";

/** Published projects as a grid; the cover falls back to a brand image until the panel has one. */
export function ProjectsSection({ lang, title, lead, projects, empty, tone = "ink", index = 4 }: { lang: Locale; title: string; lead?: string; projects: SiteContent["projects"]; empty: string; tone?: "ink" | "paper"; index?: number }) {
  const muted = tone === "ink" ? "text-paper/55" : "text-ink-950/65";
  return (
    <section id="layiheler" className="scroll-mt-6 px-gutter py-[clamp(72px,10vw,160px)]">
      {/* the previous site's case-study anchor still lands here */}
      <span id="layihe-icmali" aria-hidden="true" className="block h-0" />
      {tone === "ink" ? (
        <SectionHead index={index} title={title} lead={lead} />
      ) : (
        <h2 className="eyebrow border-t border-black/10 pt-6 text-ink-950/60">{title}</h2>
      )}
      {projects.length === 0 ? (
        <p className={`mt-10 text-[15px] ${muted}`}>{empty}</p>
      ) : (
        <Stagger className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {projects.map((p, i) => (
            <StaggerItem key={p.id}>
              <Link href={projectHref(lang, p.slug)} className="group block">
                <div className={`relative aspect-[16/10] overflow-hidden rounded-[10px] ${tone === "ink" ? "bg-ink-900" : "bg-black/5"}`}>
                  <Image
                    src={p.coverUrl ?? photoAt(i)}
                    alt={p.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[clamp(19px,1.6vw,24px)] font-medium leading-[1.2] tracking-[-0.015em]">{p.title}</h3>
                    {p.shortDescription && <p className={`mt-1.5 max-w-[52ch] text-[15px] leading-[1.5] ${muted}`}>{p.shortDescription}</p>}
                  </div>
                  <div className={`flex flex-none items-center gap-2 font-mono text-[12px] ${muted}`}>
                    {p.year}
                    <ArrowUpRight size={18} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
