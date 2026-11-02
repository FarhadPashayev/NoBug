import { ShieldCheck } from "lucide-react";
import { Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHead } from "./section-head";

// the QA step carries the brand — the company is called nobug
const QA_STEP = 3;

/** Analysis → Design → Development → Testing → Delivery, with the testing step lit. */
export function ProcessSection({ title, lead, steps, qaNote }: { title: string; lead: string; steps: [string, string][]; qaNote: string }) {
  return (
    <section id="proses" className="px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={2} title={title} lead={lead} />
      <Stagger className="no-scrollbar -mx-gutter mt-12 flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {steps.map(([step, text], i) => {
          const qa = i === QA_STEP;
          return (
            <StaggerItem key={step} className={`flex w-[72vw] max-w-[300px] flex-none snap-start flex-col rounded-[10px] p-6 md:w-auto md:max-w-none ${qa ? "bg-yellow text-ink-950" : "bg-ink-900"}`}>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[12px] ${qa ? "text-ink-950/60" : "text-paper/60"}`}>{String(i + 1).padStart(2, "0")}</span>
                {qa && <ShieldCheck size={20} aria-hidden="true" />}
              </div>
              <h3 className="mt-8 text-[20px] font-medium leading-[1.15] tracking-[-0.015em] md:mt-28">{step}</h3>
              <p className={`mt-3 text-[14px] leading-[1.5] ${qa ? "text-ink-950/75" : "text-paper/55"}`}>{text}</p>
            </StaggerItem>
          );
        })}
      </Stagger>
      <Rise className="mt-8 flex items-start gap-3 text-[15px] leading-[1.5] text-paper/70">
        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-yellow" aria-hidden="true" />
        <p className="max-w-[60ch]">{qaNote}</p>
      </Rise>
    </section>
  );
}
