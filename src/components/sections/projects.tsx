import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { SiteContent } from "@/lib/content";
import { projectHref } from "@/lib/showcase-data";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHead } from "./section-head";

/**
 * Published projects as a grid: featured first, then work with artwork; a project without
 * a cover gets a typographic one in the brand style (never a stock photo);
 * an odd last card spans the row, image and text side by side.
 */
export function ProjectsSection({ lang, title, lead, projects, empty, tone = "ink", index = 4 }: { lang: Locale; title: string; lead?: string; projects: SiteContent["projects"]; empty: string; tone?: "ink" | "paper"; index?: number }) {
  const muted = tone === "ink" ? "text-paper/60" : "text-ink-950/65";
  // the panel's "featured" pick leads, then work with artwork; otherwise the panel order stays
  const rank = (p: (typeof projects)[number]) => (p.isFeatured ? 0 : p.coverUrl ? 1 : 2);
  const list = [...projects].sort((a, b) => rank(a) - rank(b));
  const wideLast = list.length % 2 === 1 && list.length > 1;
  return (
    <section id="layiheler" className="scroll-mt-6 px-gutter py-[clamp(72px,10vw,160px)]">
      {/* the previous site's case-study anchor still lands here */}
      <span id="layihe-icmali" aria-hidden="true" className="block h-0" />
      {tone === "ink" ? <SectionHead index={index} title={title} lead={lead} /> : <h2 className="eyebrow border-t border-black/10 pt-6 text-ink-950/60">{title}</h2>}
      {list.length === 0 ? (
        <p className={`mt-10 text-[15px] ${muted}`}>{empty}</p>
      ) : (
        <Stagger className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {list.map((p, i) => {
            const wide = wideLast && i === list.length - 1;
            return (
              <StaggerItem key={p.id} className={wide ? "md:col-span-2" : ""}>
                <Link href={projectHref(lang, p.slug)} className={`group block ${wide ? "md:grid md:grid-cols-2 md:items-center md:gap-10" : ""}`}>
                  <div className={`relative aspect-[16/10] overflow-hidden rounded-[12px] ${tone === "ink" ? "bg-ink-900" : "bg-black/5"}`}>
                    {p.coverUrl ? (
                      <Image
                        src={p.coverUrl}
                        alt={p.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    ) : (
                      <TypeCover title={p.title} />
                    )}
                  </div>
                  <div className={`mt-4 flex items-start justify-between gap-4 ${wide ? "md:mt-0" : ""}`}>
                    <div className="min-w-0">
                      <h3 className="text-[clamp(19px,1.6vw,24px)] font-medium leading-[1.2] tracking-[-0.015em]">{p.title}</h3>
                      {p.shortDescription && <p className={`mt-1.5 max-w-[52ch] text-[15px] leading-[1.5] ${muted}`}>{p.shortDescription}</p>}
                      {p.tags.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 4).map((tag) => (
                            <li key={tag} className={`rounded-full px-2.5 py-1 text-[12px] ${tone === "ink" ? "bg-ink-900 text-paper/70" : "bg-black/[0.06] text-ink-950/70"}`}>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className={`flex size-10 flex-none items-center justify-center rounded-full border transition-colors ${tone === "ink" ? "border-ink-line group-hover:border-yellow group-hover:text-yellow" : "border-black/10 group-hover:border-ink-950"}`}>
                      <ArrowUpRight size={18} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </section>
  );
}

/** Cover for a project without artwork: the name set large on the brand's dark ground. */
function TypeCover({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(120%_90%_at_85%_10%,#2a2416_0%,transparent_55%),linear-gradient(140deg,#16181c,#0b0b0c)] p-[clamp(20px,3vw,36px)] text-paper">
      <span aria-hidden="true" className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:44px_44px]" />
      <span className="relative flex items-center gap-2 text-[12px] text-paper/60">
        <span className="size-1.5 rounded-full bg-yellow" aria-hidden="true" />
        nobug
      </span>
      <span className="relative max-w-[14ch] text-[clamp(28px,3.6vw,54px)] font-medium leading-[1] tracking-[-0.035em] transition-transform duration-700 group-hover:-translate-y-1">{title}</span>
    </div>
  );
}
