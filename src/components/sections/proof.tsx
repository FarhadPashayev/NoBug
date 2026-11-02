import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
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
      <Stagger className="no-scrollbar -mx-gutter mt-12 flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
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
export function FaqSection({ index, title, lead, items, ask, cta }: { index: number; title: string; lead: string; items: SiteContent["faq"]; ask: string; cta: { label: string; href: string } }) {
  if (!items.length) return null;
  return (
    <section id="sss" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={title} lead={lead} />
      <Rise className="mt-12 md:ml-[33.333%]">
        {items.map((f, i) => (
          // one shared name: opening a question closes the previous one (exclusive accordion); the first starts open
          <details key={f.id} name="faq" open={i === 0} className="group border-b border-ink-line first:border-t">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[clamp(17px,1.5vw,20px)] font-medium leading-[1.3] [&::-webkit-details-marker]:hidden">
              {f.question}
              <Plus size={18} aria-hidden="true" className="flex-none text-paper/60 transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="max-w-[64ch] pb-6 text-[15px] leading-[1.6] text-paper/65">{f.answer}</p>
          </details>
        ))}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] text-paper/65">{ask}</p>
          <Link href={cta.href} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper/25 px-5 text-[15px] font-medium transition-colors hover:border-paper">
            {cta.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Rise>
    </section>
  );
}

/** Practices and tooling (SpecGroup / SpecItem) — certification is not claimed; a table on wide screens, cards on phones. */
export function StandardsSection({ index, t, rows, lead }: { index: number; t: Dictionary; rows: SiteContent["specs"]; lead: string }) {
  if (!rows.length) return null;
  const [hArea, hApproach, hTool, hStatus] = t.techHead;
  return (
    <section id="texnologiya" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={t.techTitle} lead={lead} />
      <Rise className="mt-12">
        <table className="hidden w-full border-collapse md:table">
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
                <td className="whitespace-nowrap border-b border-ink-line py-4">
                  <Status value={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="grid gap-3 md:hidden">
          {rows.map((r, i) => (
            <li key={`${r.area}-${i}`} className="rounded-[10px] bg-ink-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[16px] font-medium leading-[1.35]">{r.area}</span>
                <Status value={r.status} />
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[14px] leading-[1.45]">
                <dt className="text-paper/45">{hApproach}</dt>
                <dd className="text-paper/75">{r.approach}</dd>
                <dt className="text-paper/45">{hTool}</dt>
                <dd>{r.tooling}</dd>
              </dl>
              <span className="sr-only">
                {hArea}: {r.area}. {hStatus}: {r.status}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[64ch] text-[13px] leading-[1.6] text-paper/60">{t.techNote}</p>
      </Rise>
    </section>
  );
}

/** "Tətbiq olunur" reads as done (amber dot), anything else as planned (hollow). */
function Status({ value }: { value: string }) {
  const done = /tətbiq|in place|внедр|применя|applied/i.test(value);
  return (
    <span className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${done ? "bg-yellow/10 text-yellow" : "bg-white/[0.06] text-paper/60"}`}>
      <span className={`size-1.5 rounded-full ${done ? "bg-yellow" : "border border-paper/50"}`} aria-hidden="true" />
      {value}
    </span>
  );
}
