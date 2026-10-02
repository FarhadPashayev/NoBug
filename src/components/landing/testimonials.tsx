import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";

type Review = SiteContent["testimonials"][number];

/**
 * Müştərilər nə deyir — the fortemplate layout: one featured review as a
 * tall photo card (quote over the image), the rest as white cards with a
 * star row, the quote and the person. Navy ground. Reviews come only from
 * the panel (Rəylər); nothing is shown until there is at least one.
 */
export function Testimonials({ t, content }: { t: Dictionary; content: SiteContent }) {
  const all = content.testimonials;
  if (!all.length) return null;
  const featured = all.find((r) => r.isFeatured) ?? all[0];
  const rest = all.filter((r) => r.id !== featured.id).slice(0, 4);

  return (
    <section id="reyler" data-bg="dark" className="scroll-mt-20 text-white">
      <div className="container-site section-pad">
        <Rise className="mx-auto max-w-[62ch] text-center">
          <h2 className="text-[clamp(34px,4.4vw,60px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.testimonials.title}</h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-grey-navy">{t.testimonials.lead}</p>
        </Rise>

        <div className={`mt-[clamp(32px,4vw,56px)] grid grid-cols-12 gap-5 ${rest.length ? "" : "max-w-[520px] mx-auto"}`}>
          <Rise className={rest.length ? "col-span-12 lg:col-span-5" : "col-span-12"}>
            <FeaturedCard r={featured} t={t} />
          </Rise>
          {rest.length > 0 && (
            <Stagger className={`col-span-12 grid gap-5 lg:col-span-7 ${rest.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {rest.map((r) => (
                <StaggerItem key={r.id} className="flex">
                  <ReviewCard r={r} t={t} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}

function Stars({ n, t }: { n: number; t: Dictionary }) {
  return (
    <div className="flex items-center gap-1 text-yellow" role="img" aria-label={t.testimonials.ratingLabel.replace("{n}", String(n))}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={18} className={i < n ? "fill-current" : "opacity-30"} aria-hidden="true" />
      ))}
    </div>
  );
}

function Avatar({ r, size = 44, light = false }: { r: Review; size?: number; light?: boolean }) {
  const initial = r.name.trim().charAt(0).toUpperCase();
  return (
    <span
      className={`relative grid flex-none place-items-center overflow-hidden rounded-full font-medium ${light ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-light text-ink ring-1 ring-fog"}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {r.avatarUrl ? <Image src={r.avatarUrl} alt="" fill sizes={`${size}px`} className="object-cover" /> : initial}
    </span>
  );
}

function FeaturedCard({ r, t }: { r: Review; t: Dictionary }) {
  return (
    <figure className="tile group relative m-0 flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[24px] bg-navy-800 p-7 text-white ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 ease-[var(--ease-brand)] motion-safe:hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.7)] lg:h-full lg:min-h-[560px]">
      {r.photoUrl ? (
        <Image src={r.photoUrl} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      ) : (
        <Quote size={160} className="absolute -right-6 -top-6 text-white/10" aria-hidden="true" />
      )}
      {/* the veil eases a little on hover so the photo comes forward while the copy stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.92)] via-[rgba(11,31,58,0.45)] to-transparent transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
      <div className="relative">
        <Stars n={r.rating} t={t} />
        <blockquote className="m-0 mt-5 text-[clamp(20px,1.9vw,26px)] font-medium leading-[1.3] tracking-[-0.015em]">{r.quote}</blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <Avatar r={r} size={48} light />
          <span>
            <span className="block text-[16px] font-medium">{r.name}</span>
            {r.role && <span className="block text-[14px] text-white/75">{r.role}</span>}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

function ReviewCard({ r, t }: { r: Review; t: Dictionary }) {
  return (
    <figure className="bg-white group m-0 flex w-full flex-col rounded-[20px] border border-transparent p-6 text-ink shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)] transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-brand)] motion-safe:hover:-translate-y-1.5 hover:border-yellow/60 hover:shadow-[0_28px_56px_-24px_rgba(0,0,0,0.75)]">
      <div className="transition-transform duration-300 ease-[var(--ease-brand)] group-hover:scale-[1.06] origin-left">
        <Stars n={r.rating} t={t} />
      </div>
      <blockquote className="m-0 mt-4 flex-1 text-[16px] leading-[1.6] text-ink">{r.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="transition-transform duration-300 ease-[var(--ease-brand)] group-hover:scale-105">
          <Avatar r={r} />
        </span>
        <span>
          <span className="block text-[15px] font-medium">{r.name}</span>
          {r.role && <span className="block text-[13px] text-grey">{r.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
