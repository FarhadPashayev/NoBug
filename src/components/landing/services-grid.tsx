import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise } from "@/components/ui/motion";
import { ServiceCard } from "./service-card";
import { ServicesScroller } from "./services-scroller";

// Card backgrounds rotate through the client's five graphics when a service has no image of its own.
const GRAPHICS = ["/assets/photo/services.webp", "/assets/photo/tech.webp", "/assets/photo/band.webp", "/assets/photo/careers.webp", "/assets/photo/about.webp"];

/**
 * Xidmət indeksi — every active service as a portrait card in one horizontal,
 * snap-scrolling row (primary category first), and the "explore" bar.
 */
export function ServicesGrid({ lang, t, content }: { lang: Locale; t: Dictionary; content: SiteContent }) {
  const services = [...content.services].sort((a, b) => Number(b.primary) - Number(a.primary));
  const total = services.length;

  return (
    <section id="xidmetler" data-bg="light" className="scroll-mt-20 text-ink">
      <div className="container-site section-pad">
        <Rise>
          <div className="mono-label text-grey">{t.servicesMeta.replace(/\d+(?=\s)/, String(total))}</div>
          <h2 className="mt-4 text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.servicesTitle}</h2>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-[1.6] text-grey">{t.tpl.servicesLead}</p>
        </Rise>

        <div className="mt-[clamp(32px,4vw,56px)]">
          <ServicesScroller prevLabel={t.tpl.scrollPrev} nextLabel={t.tpl.scrollNext}>
            {services.map((s, i) => (
              <div key={s.id} data-card className="flex-none snap-start">
                <ServiceCard
                  id={s.slug}
                  index={i + 1}
                  total={total}
                  title={s.name}
                  text={s.shortDescription}
                  image={s.imageUrl ?? GRAPHICS[i % GRAPHICS.length]}
                  icon={s.icon}
                  position={s.primary ? "primary" : "secondary"}
                  lang={lang}
                  t={t}
                />
              </div>
            ))}
          </ServicesScroller>
        </div>

        {/* explore bar */}
        <div className="mt-[clamp(32px,4vw,56px)] flex flex-wrap items-center justify-between gap-6 rounded-[16px] border border-fog bg-white px-6 py-5 sm:px-8">
          <div className="mono-label text-grey">{t.tpl.exploreLabel}</div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href={`/${lang}/anket`} className="group inline-flex items-center gap-2 text-[clamp(17px,1.5vw,22px)] font-medium tracking-[-0.02em] text-ink">
              {t.tpl.exploreEnquiry}
              <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
