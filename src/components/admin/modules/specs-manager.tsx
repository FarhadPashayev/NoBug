"use client";

import { CrudManager } from "../crud-manager";
import { specSchema, type SpecInput } from "@/lib/admin/schemas";

type Row = { id: string; group: string; parameter: string; value: string; unit: string; position: number };

export function SpecsManager() {
  return (
    <CrudManager<SpecInput, Row>
      endpoint="/api/admin/specs"
      queryKey="specs"
      schema={specSchema}
      itemLabel="Sətir"
      searchPlaceholder="Parametr axtar…"
      emptyValues={{ locale: "az", group: "", parameter: "", value: "", unit: "", position: 0 }}
      fields={[
        { name: "parameter", label: "Parametr", type: "text", placeholder: "Məlumatın qorunması" },
        { name: "value", label: "Dəyər", type: "text", placeholder: "Azure Backup" },
        { name: "unit", label: "Vahid / status", type: "text", placeholder: "Tətbiq olunur" },
        { name: "group", label: "Qrup", type: "text", placeholder: "Təhlükəsizlik" },
        { name: "position", label: "Sıra", type: "number" },
      ]}
      columns={[
        { key: "parameter", header: "Parametr", value: (r) => r.parameter, cell: (r) => <span className="font-medium">{r.parameter}</span> },
        { key: "value", header: "Dəyər", value: (r) => r.value, cell: (r) => r.value },
        { key: "unit", header: "Vahid / status", value: (r) => r.unit, cell: (r) => <span className="text-ad-muted-fg">{r.unit || "—"}</span> },
        { key: "group", header: "Qrup", value: (r) => r.group, cell: (r) => <span className="text-ad-muted-fg">{r.group || "—"}</span> },
      ]}
    />
  );
}
