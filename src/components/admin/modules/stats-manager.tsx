"use client";

import { CrudManager } from "../crud-manager";
import { statSchema, type StatInput } from "@/lib/admin/schemas";

type Row = { id: string; value: string; label: string; source: string; position: number };

export function StatsManager() {
  return (
    <CrudManager<StatInput, Row>
      endpoint="/api/admin/stats"
      queryKey="stats"
      schema={statSchema}
      itemLabel="Göstərici"
      searchPlaceholder="Göstərici axtar…"
      emptyValues={{ locale: "az", value: "", label: "", source: "", position: 0 }}
      fields={[
        { name: "value", label: "Dəyər", type: "text", placeholder: "12 · < 2 saat", hint: "səhifədə böyük rəqəm" },
        { name: "position", label: "Sıra", type: "number" },
        { name: "label", label: "Təsvir", type: "text", placeholder: "xidmət istiqaməti" },
        { name: "source", label: "Mənbə", type: "text", placeholder: "2026 · xidmət kataloqu" },
      ]}
      columns={[
        { key: "value", header: "Dəyər", value: (r) => r.value, cell: (r) => <span className="font-semibold tabular-nums">{r.value}</span> },
        { key: "label", header: "Təsvir", value: (r) => r.label, cell: (r) => r.label },
        { key: "source", header: "Mənbə", value: (r) => r.source, cell: (r) => <span className="text-ad-muted-fg">{r.source || "—"}</span> },
        { key: "position", header: "Sıra", value: (r) => r.position, cell: (r) => <span className="tabular-nums">{r.position}</span>, className: "w-20" },
      ]}
    />
  );
}
