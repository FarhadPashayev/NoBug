"use client";

import { createStat, deleteStat, listStats, reorderStats, updateStat } from "@/actions/stats";
import { asLocalized, emptyLocalized, t } from "@/lib/i18n/localized";
import { statSchema, type StatInput } from "@/schemas/stats";
import { CrudManager } from "../crud-manager";

type Row = { id: string; value: string; label: unknown; source: unknown; order: number };

export function StatsManager() {
  return (
    <CrudManager<StatInput, Row>
      queryKey="stats"
      actions={{ list: listStats, create: createStat, update: updateStat, remove: deleteStat, reorder: reorderStats }}
      schema={statSchema}
      itemLabel="Göstərici"
      searchPlaceholder="Göstərici axtar…"
      emptyValues={{ value: "", label: emptyLocalized(), source: emptyLocalized() }}
      toForm={(r) => ({ value: r.value, label: asLocalized(r.label), source: asLocalized(r.source) })}
      rowLabel={(r) => `${r.value} — ${t(r.label)}`}
      fields={[
        { name: "value", label: "Dəyər", type: "text", placeholder: "12", hint: "rəqəm və ya qısa ifadə", full: true },
        { name: "label", label: "İzah", type: "localized", placeholder: "xidmət istiqaməti" },
        { name: "source", label: "Mənbə (kiçik yazı)", type: "localized", placeholder: "2026 · xidmət kataloqu", hint: "istəyə bağlı" },
      ]}
      columns={[
        { key: "order", header: "#", value: (r) => r.order, cell: (r) => <span className="font-mono text-xs text-ad-muted-fg">{r.order + 1}</span>, className: "w-12" },
        { key: "value", header: "Dəyər", value: (r) => r.value, cell: (r) => <span className="text-lg font-semibold tabular-nums">{r.value}</span>, className: "w-32" },
        { key: "label", header: "İzah", value: (r) => t(r.label), cell: (r) => t(r.label) },
        { key: "source", header: "Mənbə", value: (r) => t(r.source), cell: (r) => <span className="text-ad-muted-fg">{t(r.source) || "—"}</span> },
      ]}
    />
  );
}
