import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { serviceHref, serviceIndex } from "@/lib/services";
import { Rise } from "@/components/ui/motion";

/**
 * "What we built" — navy band. Alternating rows: a rounded graphic tile with
 * one big figure · service tag · title · text · link. Facts only: the case
 * study's duration, and the year for the second project.
 */
export function Showcase({ lang, t }: { lang: Locale; t: Dictionary }) {
  const cs = t.caseStudy;
  const p2 = t.projects.items[1];
  const webTitle = t.services[serviceIndex("web")][0];

  const rows = [
    {
      key: "case",
      tile: "/assets/photo/about.webp",
      alt: t.alt04,
      figure: cs.facts[1], // "3 ay"
      figureLabel: t.tpl.showcaseMetricDuration,
      tag: webTitle,
      client: cs.facts[0],
      title: cs.title,
      text: cs.blocks[2][1], // Nəticə
      href: `/${lang}#layihe-icmali`,
      linkLabel: t.caseStudy.eyebrow.split("·").pop()?.trim() ?? t.tpl.readMore,
    },
    {
      key: "bbq",
      tile: "/assets/photo/careers.webp",
      alt: t.alt05,
      figure: p2[2], // "2026"
      figureLabel: t.tpl.showcaseMetricYear,
      tag: webTitle,
      client: p2[0],
      title: p2[0],
      text: p2[1],
      href: serviceHref(lang, "web"),
      linkLabel: t.tpl.readMore,
    },
  ];

  return (
    <section id="layiheler" data-bg="dark" className="scroll-mt-20 text-white">
      <div className="container-site section-pad">
        <Rise>
          <h2 className="max-w-[20ch] text-[clamp(30px,3.6vw,48px)] font-medium leading-[1.1] tracking-[-0.03em]">{t.tpl.showcaseTitle}</h2>
        </Rise>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-col gap-[clamp(56px,7vw,112px)]">
          {rows.map((r, i) => (
            <Rise key={r.key}>
              <article className={`grid grid-cols-12 items-center gap-x-8 gap-y-8 ${i % 2 ? "" : ""}`}>
                {/* tile */}
                <div className={`col-span-12 md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
                  <div className="tile aspect-[4/3] bg-ink-2">
                    <Image src={r.tile} alt={r.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,19,43,0.85)] via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="text-[clamp(56px,7vw,112px)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">{r.figure}</div>
                      <div className="mt-2 text-[15px] text-grey-navy">{r.figureLabel}</div>
                    </div>
                  </div>
                </div>

                {/* copy */}
                <div className={`col-span-12 md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <div className="text-[15px] font-semibold tracking-[-0.01em] text-white/80">{r.client !== r.title ? r.client : "\u00a0"}</div>
                    <div className="mono-label text-grey-navy">{r.tag}</div>
                  </div>
                  <h3 className="mt-5 text-[clamp(26px,2.8vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">{r.title}</h3>
                  <p className="mt-5 max-w-[56ch] text-[17px] leading-[1.6] text-grey-navy">{r.text}</p>
                  <Link href={r.href} className="group mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-white">
                    {r.linkLabel}
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
