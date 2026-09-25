"use client";

import { useQuery } from "@tanstack/react-query";
import { CrudManager } from "../crud-manager";
import { Badge } from "../ui/badge";
import { serviceSchema, type ServiceInput } from "@/lib/admin/schemas";
import { api } from "@/lib/admin/client";

type Category = { id: string; name: string };
type Row = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  details: string;
  icon: string;
  imageUrl: string | null;
  categoryId: string | null;
  category?: Category | null;
  primary: boolean;
  published: boolean;
  position: number;
};

export function ServicesManager() {
  // categories populate the select; the list is short and cached for the session
  const categories = useQuery({ queryKey: ["service-categories"], queryFn: () => api<{ items: Category[] }>("/api/admin/services/categories") });
  const options = (categories.data?.items ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <CrudManager<ServiceInput, Row>
      endpoint="/api/admin/services"
      queryKey="services"
      schema={serviceSchema}
      itemLabel="Xidmət"
      searchPlaceholder="Xidmət axtar…"
      emptyValues={{ locale: "az", slug: "", name: "", summary: "", details: "", icon: "", imageUrl: null, categoryId: null, primary: false, published: true, position: 0 }}
      toForm={(r) => ({
        locale: "az",
        slug: r.slug,
        name: r.name,
        summary: r.summary,
        details: r.details,
        icon: r.icon,
        imageUrl: r.imageUrl,
        categoryId: r.categoryId,
        primary: r.primary,
        published: r.published,
        position: r.position,
      })}
      fields={[
        { name: "name", label: "Xidmətin adı", type: "text", full: true },
        { name: "slug", label: "Slug", type: "text", hint: "sorğu linki: ?xidmet=<slug>" },
        { name: "position", label: "Sıra", type: "number" },
        { name: "summary", label: "Qısa təsvir", type: "textarea", rows: 3 },
        { name: "categoryId", label: "Kateqoriya", type: "select", options },
        { name: "icon", label: "İkon adı", type: "text", placeholder: "Server", hint: "Lucide ikon adı" },
        { name: "primary", label: "Əsas istiqamət", type: "switch" },
        { name: "published", label: "Dərc olunub", type: "switch" },
        { name: "imageUrl", label: "Kart şəkli", type: "image" },
        { name: "details", label: "Ətraflı", type: "textarea", rows: 8 },
      ]}
      columns={[
        {
          key: "name",
          header: "Xidmət",
          value: (r) => r.name,
          cell: (r) => (
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.name}</span>
              <span className="block truncate text-xs text-ad-muted-fg">{r.summary || r.slug}</span>
            </span>
          ),
        },
        { key: "category", header: "Kateqoriya", value: (r) => r.category?.name ?? "", cell: (r) => r.category?.name ?? <span className="text-ad-muted-fg">—</span>, className: "w-44" },
        {
          key: "state",
          header: "Vəziyyət",
          value: (r) => `${r.primary ? "əsas" : "əlavə"} ${r.published ? "dərc" : "qaralama"}`,
          cell: (r) => (
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={r.primary ? "accent" : "neutral"}>{r.primary ? "Əsas" : "Əlavə"}</Badge>
              {!r.published && <Badge tone="warning">Qaralama</Badge>}
            </div>
          ),
          className: "w-40",
        },
        { key: "position", header: "Sıra", value: (r) => r.position, cell: (r) => <span className="tabular-nums">{r.position}</span>, className: "w-16" },
      ]}
    />
  );
}
