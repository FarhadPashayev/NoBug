import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { PRIMARY_SERVICES, SECONDARY_SERVICES, serviceHref, serviceIndex, type ServiceId } from "@/lib/services";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { TrackedLink } from "@/components/ui/tracked";

// one graphic per primary card (client assets, already in the palette)
const TILE: Record<string, string> = {
  web: "/assets/photo/services.webp",
  qa: "/assets/photo/tech.webp",
  infra: "/assets/photo/band.webp",
  crm: "/assets/photo/careers.webp",
};

/**
 * Services in the template's media-card grid: four primary cards with a
 * rounded graphic tile, tag chip and arrow button; eight secondary services
 * as compact cards; an "explore everything" bar at the bottom. Every card
 * links to the enquiry with that service preselected.
 */
export function ServicesGrid({ lang, t }: { lang: Locale; t: Dictionary }) {
  const card = (id: ServiceId, position: "primary" | "secondary", n: number) => {
    const [title, text] = t.services[serviceIndex(id)];
    return (
      <StaggerItem key={id} className="h-full">
        <TrackedLink href={serviceHref(lang, id)} event={{ name: "service_click", params: { service_id: id, position, locale: lang } }} className="group block h-full">
          {position === "primary" ? (
            <>
              <div className="tile aspect-[16/10] border border-fog bg-ink">
                <Image src={TILE[id]} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                {/* legibility over light graphics: dark gradient from the bottom, soft veil on top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,19,43,0.88)] via-[rgba(17,19,43,0.25)] to-[rgba(17,19,43,0.35)]" />
                <div className="absolute inset-x-6 top-6">
                  <div className="tag-line text-white/80">
                    <span>{String(n).padStart(2, "0")}</span>
                  </div>
                </div>
                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
                  <div className="text-[clamp(20px,2vw,26px)] font-medium leading-[1.2] tracking-[-0.02em] text-white">{title}</div>
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-[1.6] text-grey">{text}</p>
            </>
          ) : (
            <div className="flex h-full items-start justify-between gap-4 rounded-[16px] border border-fog bg-white p-5 transition-colors duration-200 group-hover:border-ink">
              <div>
                <div className="text-[17px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">{title}</div>
                <p className="mt-2 text-[14px] leading-[1.55] text-grey">{text}</p>
              </div>
              <ArrowUpRight size={18} className="mt-0.5 flex-none text-grey transition-colors group-hover:text-ink" aria-hidden="true" />
            </div>
          )}
        </TrackedLink>
      </StaggerItem>
    );
  };

  return (
    <section id="xidmetler" data-bg="light" className="scroll-mt-20 text-ink">
      <div className="container-site section-pad">
        <Rise>
          <div className="mono-label text-grey">{t.servicesMeta}</div>
          <h2 className="mt-4 text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.servicesTitle}</h2>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-[1.6] text-grey">{t.tpl.servicesLead}</p>
        </Rise>

        <Stagger className="mt-[clamp(40px,5vw,72px)] grid grid-cols-1 gap-8 md:grid-cols-2">{PRIMARY_SERVICES.map((id, i) => card(id, "primary", i + 1))}</Stagger>

        <h3 className="mono-label mt-[clamp(48px,6vw,80px)] text-grey">{t.servicesSecondary}</h3>
        <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
          {SECONDARY_SERVICES.map((id, i) => card(id, "secondary", i + 5))}
        </Stagger>

        {/* explore bar */}
        <div className="mt-[clamp(40px,5vw,64px)] flex flex-wrap items-center justify-between gap-6 rounded-[16px] border border-fog bg-white px-6 py-5 sm:px-8">
          <div className="mono-label text-grey">{t.tpl.exploreLabel}</div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href={`/${lang}#xidmetler`} className="group inline-flex items-center gap-2 text-[clamp(17px,1.5vw,22px)] font-medium tracking-[-0.02em] text-ink">
              {t.tpl.exploreAll}
              <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
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
