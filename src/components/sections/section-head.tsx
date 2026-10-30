import { Rise } from "@/components/ui/motion";

/** Small numbered eyebrow + title + optional lead — the one heading pattern of the home sections. */
export function SectionHead({ index, title, lead, aside }: { index: number; title: string; lead?: string; aside?: React.ReactNode }) {
  return (
    <Rise className="grid gap-6 border-t border-ink-line pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
      <h2 className="eyebrow flex gap-3 font-medium text-paper/60">
        <span aria-hidden="true">{String(index).padStart(2, "0")}</span>
        <span>{title}</span>
      </h2>
      <div className="flex flex-wrap items-end justify-between gap-6">
        {lead && <p className="max-w-[30ch] text-[clamp(24px,2.8vw,40px)] font-medium leading-[1.12] tracking-[-0.025em] text-balance">{lead}</p>}
        {aside}
      </div>
    </Rise>
  );
}
