import type { Dictionary } from "@/lib/i18n/dict";

/**
 * Layihə icmalı — asymmetric two columns: four mono facts (cols 1–4) and three
 * body blocks (cols 5–11). No card, no fill, no shadow. Client is not named.
 */
export function CaseStudy({ t }: { t: Dictionary }) {
  const cs = t.caseStudy;
  return (
    <section id="layihe-icmali" className="border-y border-hairline bg-surface">
      <div className="container-site section-pad scroll-mt-20">
        <div className="mono-label text-muted">{cs.eyebrow}</div>
        <h2 className="type-h2 mt-4 max-w-[24ch]">{cs.title}</h2>

        <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-10">
          <dl className="col-span-12 m-0 border-t border-navy md:col-span-4">
            {cs.labels.map((label, i) => (
              <div key={label} className="border-b border-hairline py-4">
                <dt className="mono-label text-muted">{label}</dt>
                <dd className="type-small m-0 mt-1.5 font-medium">{cs.facts[i]}</dd>
              </div>
            ))}
          </dl>

          <div className="col-span-12 flex flex-col gap-8 md:col-span-7 md:col-start-6 lg:col-start-5">
            {cs.blocks.map(([heading, text]) => (
              <div key={heading}>
                <h3 className="mono-label text-muted">{heading}</h3>
                <p className="type-body mt-3 max-w-[62ch]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
