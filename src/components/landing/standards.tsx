import type { Dictionary } from "@/lib/i18n/dict";
import type { SiteContent } from "@/lib/content";
import { Rise } from "@/components/ui/motion";

/** Standards table — light band, kept dry: mono headers, hairline rows. Certification is not claimed. */
export function Standards({ t, content }: { t: Dictionary; content: SiteContent }) {
  const rows = content.specs;
  return (
    <section id="texnologiya" data-bg="light" className="scroll-mt-20 text-ink">
      <div className="container-site pb-[clamp(56px,7vw,112px)]">
        <Rise>
          <div className="rounded-[20px] border border-fog bg-white p-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.15] tracking-[-0.025em]">{t.techTitle}</h2>
              <p className="max-w-[48ch] text-[15px] leading-[1.55] text-grey">{t.techNote}</p>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    {t.techHead.map((h) => (
                      <th key={h} scope="col" className="mono-label border-b border-ink pb-3 pr-4 text-grey">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.area}-${i}`} className="transition-colors hover:bg-light">
                      <th scope="row" className="border-b border-fog py-4 pr-4 text-[16px] font-medium leading-[1.4]">
                        {r.area}
                      </th>
                      <td className="border-b border-fog py-4 pr-4 text-[15px] leading-[1.5] text-grey">{r.approach}</td>
                      <td className="whitespace-nowrap border-b border-fog py-4 pr-4 text-[15px]">{r.tooling}</td>
                      <td className="whitespace-nowrap border-b border-fog py-4 font-mono text-[12px] tracking-[0.06em] text-grey">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 font-mono text-[11px] tracking-[0.08em] text-grey">{t.techFootnote}</div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
