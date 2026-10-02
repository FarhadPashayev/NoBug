"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

type Item = { id: string; question: string; answer: string };

/**
 * One open answer at a time, the first open by default. The whole row is the
 * button (bubble + the round plus), so the hit area is generous; the answer
 * panel animates its height through grid-template-rows.
 */
export function FaqList({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const base = useId();
  return (
    <ol className="m-0 flex list-none flex-col gap-4 p-0" data-faq>
      {items.map((f) => {
        const expanded = open === f.id;
        const panelId = `${base}-${f.id}`;
        return (
          <li key={f.id} className="flex flex-col gap-3">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? null : f.id)}
              className="group flex w-max max-w-full items-center gap-3 border-0 bg-transparent p-0 text-left outline-none"
            >
              {/* the question: navy bubble, square at the bottom-left like a sent message */}
              <span className="bg-ink inline-block max-w-full rounded-[24px] rounded-bl-[6px] px-6 py-4 text-[clamp(17px,1.5vw,21px)] font-medium leading-[1.3] tracking-[-0.015em] text-white shadow-[0_8px_24px_-12px_rgba(11,31,58,0.5)] transition-transform duration-200 ease-[var(--ease-brand)] group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-yellow group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-light">
                {f.question}
              </span>
              <span
                aria-hidden="true"
                className="bg-white grid size-11 flex-none place-items-center rounded-full border border-fog text-ink shadow-[0_4px_14px_rgba(11,31,58,0.08)] transition-transform duration-200 ease-[var(--ease-brand)] group-hover:scale-105"
              >
                {expanded ? <Minus size={18} /> : <Plus size={18} />}
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-brand)]"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              aria-hidden={!expanded}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex items-end gap-3 pb-1">
                  {/* brand mark as the "sender" */}
                  <span className="relative size-9 flex-none overflow-hidden rounded-full border border-fog bg-ink">
                    <Image src="/icon.png" alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <div className="bg-white max-w-[60ch] rounded-[24px] rounded-bl-[6px] border border-fog px-6 py-5 text-[16px] leading-[1.6] text-ink shadow-[0_12px_32px_-18px_rgba(11,31,58,0.25)]">
                    {f.answer}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
