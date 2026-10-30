import Image from "next/image";
import { Plus } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHead } from "./section-head";

/** Reviews from the panel — nothing is rendered when there are none (never invented). */
export function TestimonialsSection({ index, title, lead, items }: { index: number; title: string; lead: string; items: SiteContent["testimonials"] }) {
  if (!items.length) return null;
  return (
    <section id="reyler" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={title} lead={lead} />
      <Stagger className="no-scrollbar -mx-gutter mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {items.map((r) => (
          <StaggerItem key={r.id} className="flex w-[82vw] flex-none snap-center flex-col justify-between gap-10 rounded-[10px] bg-ink-900 p-6 sm:w-[60vw] md:w-auto sm:p-8">
            <figure className="contents">
            <blockquote className="text-[17px] leading-[1.5] text-paper/85">“{r.quote}”</blockquote>
            <figcaption className="flex items-center gap-3">
              {r.avatarUrl ? <Image src={r.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 text-[14px] font-medium">{r.name.charAt(0)}</span>}
              <span>
                <span className="block text-[15px] font-medium">{r.name}</span>
                <span className="block text-[13px] text-paper/60">{r.role}</span>
              </span>
            </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** FAQ as native disclosure widgets: keyboard and screen-reader friendly with no script. */
export function FaqSection({ index, title, lead, items }: { index: number; title: string; lead: string; items: SiteContent["faq"] }) {
  if (!items.length) return null;
  return (
    <section id="faq" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={title} lead={lead} />
      <Rise className="mt-12 md:ml-[33.333%]">
        {items.map((f) => (
          <details key={f.id} className="group border-b border-ink-line first:border-t">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[clamp(17px,1.5vw,20px)] font-medium leading-[1.3] [&::-webkit-details-marker]:hidden">
              {f.question}
              <Plus size={18} aria-hidden="true" className="flex-none text-paper/60 transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="max-w-[64ch] pb-6 text-[15px] leading-[1.6] text-paper/65">{f.answer}</p>
          </details>
        ))}
      </Rise>
    </section>
  );
}

/** Practices and tooling (SpecGroup / SpecItem) — certification is not claimed. */
export function StandardsSection({ index, t, rows }: { index: number; t: Dictionary; rows: SiteContent["specs"] }) {
  if (!rows.length) return null;
  return (
    <section id="texnologiya" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={t.techTitle} lead={t.techNote} />
      <Rise className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {t.techHead.map((h) => (
                <th key={h} scope="col" className="eyebrow border-b border-paper/30 pb-3 pr-4 font-medium text-paper/60">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.area}-${i}`}>
                <th scope="row" className="border-b border-ink-line py-4 pr-4 text-[16px] font-medium leading-[1.4]">
                  {r.area}
                </th>
                <td className="border-b border-ink-line py-4 pr-4 text-[15px] leading-[1.5] text-paper/60">{r.approach}</td>
                <td className="whitespace-nowrap border-b border-ink-line py-4 pr-4 text-[15px]">{r.tooling}</td>
                <td className="whitespace-nowrap border-b border-ink-line py-4 font-mono text-[12px] tracking-[0.06em] text-paper/60">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Rise>
    </section>
  );
}
