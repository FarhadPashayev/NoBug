"use client";

import { createFaq, deleteFaq, listFaqs, reorderFaqs, updateFaq } from "@/actions/faq";
import { asLocalized, emptyLocalized, t } from "@/lib/i18n/localized";
import { faqSchema, type FaqInput } from "@/schemas/faq";
import { Badge } from "../ui/badge";
import { CrudManager } from "../crud-manager";

type Row = { id: string; question: unknown; answer: unknown; order: number; isActive: boolean };

export function FaqManager({ initial }: { initial?: Row[] }) {
  return (
    <CrudManager<FaqInput, Row>
      queryKey="faq"
      initialRows={initial}
      actions={{ list: listFaqs, create: createFaq, update: updateFaq, remove: deleteFaq, reorder: reorderFaqs }}
      schema={faqSchema}
      itemLabel="Sual"
      searchPlaceholder="Sual axtar…"
      emptyValues={{ question: emptyLocalized(), answer: emptyLocalized(), isActive: true }}
      toForm={(r) => ({ question: asLocalized(r.question), answer: asLocalized(r.answer), isActive: r.isActive })}
      rowLabel={(r) => t(r.question)}
      fields={[
        { name: "question", label: "Sual", type: "localized", placeholder: "Müraciətdən sonra nə baş verir?" },
        { name: "answer", label: "Cavab", type: "localized", placeholder: "Bir iş günü ərzində…", hint: "sadə mətn, 2–4 cümlə" },
        { name: "isActive", label: "Saytda göstər", type: "switch" },
      ]}
      columns={[
        { key: "order", header: "#", value: (r) => r.order, cell: (r) => <span className="font-mono text-xs text-ad-muted-fg">{r.order + 1}</span>, className: "w-12" },
        { key: "question", header: "Sual", value: (r) => t(r.question), cell: (r) => <span className="font-medium">{t(r.question)}</span> },
        { key: "answer", header: "Cavab", value: (r) => t(r.answer), cell: (r) => <span className="line-clamp-2 text-ad-muted-fg">{t(r.answer)}</span> },
        {
          key: "isActive",
          header: "Status",
          value: (r) => (r.isActive ? "aktiv" : "gizli"),
          cell: (r) => <Badge tone={r.isActive ? "success" : "neutral"}>{r.isActive ? "Aktiv" : "Gizli"}</Badge>,
          className: "w-24",
        },
      ]}
    />
  );
}
