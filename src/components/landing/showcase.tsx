import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { serviceHref } from "@/lib/services";
import { Rise } from "@/components/ui/motion";

// Tiles without an uploaded cover rotate through the client's graphics.
const TILES = ["/assets/photo/about.webp", "/assets/photo/careers.webp", "/assets/photo/services.webp", "/assets/photo/tech.webp"];

/**
 * "What we built" — navy band. Alternating rows: a rounded graphic tile with
 * one big figure · service tag · title · text · link. The figure is the
 * project's duration when it has one, otherwise its year.
 */
export function Showcase({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  const cs = t.caseStudy;
  const webTitle = content.services.find((s) => s.slug === "web")?.name ?? "";
  const projects = content.projects;
  if (!projects.length) return null;

  return (
    <section id="layiheler" data-bg="dark" className="scroll-mt-20 text-white">
      <div className="container-site section-pad">
        <Rise>
          <h2 className="max-w-[20ch] text-[clamp(30px,3.6vw,48px)] font-medium leading-[1.1] tracking-[-0.03em]">{t.tpl.showcaseTitle}</h2>
        </Rise>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-col gap-[clamp(56px,7vw,112px)]">
          {projects.map((p, i) => {
            const figure = p.duration || p.year;
            const figureLabel = p.duration ? t.tpl.showcaseMetricDuration : t.tpl.showcaseMetricYear;
            // the featured case study stays anonymous: the dictionary's client label, never a name
            const client = p.isFeatured ? cs.facts[0] : " ";
            // projects with a write-up get a detail page; the rest link to the enquiry for web work
            const href = p.content && content.fromDb ? `/${lang}/layiheler/${p.slug}` : p.isFeatured ? `/${lang}#layihe-icmali` : serviceHref(lang, "web");
            const linkLabel = p.isFeatured && !p.content ? (cs.eyebrow.split("·").pop()?.trim() ?? t.tpl.readMore) : t.tpl.readMore;
            return (
              <Rise key={p.id}>
                <article className="grid grid-cols-12 items-center gap-x-4 md:gap-x-8 gap-y-8">
                  <div className={`col-span-12 md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
                    <div className="tile aspect-[4/3] bg-ink-2">
                      <Image src={p.coverUrl ?? TILES[i % TILES.length]} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.85)] via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-[clamp(56px,7vw,112px)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">{figure}</div>
                        <div className="mt-2 text-[15px] text-grey-navy">{figureLabel}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`col-span-12 md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <div className="text-[15px] font-semibold tracking-[-0.01em] text-white/80">{client}</div>
                      <div className="mono-label text-grey-navy">{p.tags[0] ?? webTitle}</div>
                    </div>
                    <h3 className="mt-5 text-[clamp(26px,2.8vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">{p.title}</h3>
                    <p className="mt-5 max-w-[56ch] text-[17px] leading-[1.6] text-grey-navy">{p.shortDescription}</p>
                    <Link href={href} className="group mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-white">
                      {linkLabel}
                      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Rise>
            );
          })}
        </div>
      </div>
    </section>
  );
}
