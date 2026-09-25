"use client";

import Image from "next/image";
import { CrudManager } from "../crud-manager";
import { Badge } from "../ui/badge";
import { projectSchema, type ProjectInput } from "@/lib/admin/schemas";

type Row = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  duration: string;
  year: string;
  coverUrl: string | null;
  tags: string[];
  content: string;
  featured: boolean;
  published: boolean;
  position: number;
};

export function ProjectsManager() {
  return (
    <CrudManager<ProjectInput, Row>
      endpoint="/api/admin/projects"
      queryKey="projects"
      schema={projectSchema}
      itemLabel="Layihə"
      searchPlaceholder="Layihə axtar…"
      emptyValues={{ locale: "az", slug: "", title: "", summary: "", duration: "", year: "", coverUrl: null, tags: [], content: "", featured: false, published: true, position: 0 }}
      toForm={(r) => ({
        locale: "az",
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        duration: r.duration,
        year: r.year,
        coverUrl: r.coverUrl,
        tags: r.tags,
        content: r.content,
        featured: r.featured,
        published: r.published,
        position: r.position,
      })}
      fields={[
        { name: "title", label: "Başlıq", type: "text", full: true },
        { name: "slug", label: "Slug", type: "text", hint: "boş buraxsanız başlıqdan yaranır" },
        { name: "position", label: "Sıra", type: "number" },
        { name: "summary", label: "Qısa təsvir", type: "textarea", rows: 3 },
        { name: "duration", label: "Müddət", type: "text", placeholder: "3 ay" },
        { name: "year", label: "İl", type: "text", placeholder: "2026" },
        { name: "tags", label: "Teqlər", type: "tags", hint: "vergüllə" },
        { name: "featured", label: "Seçilmiş layihə", type: "switch" },
        { name: "published", label: "Dərc olunub", type: "switch" },
        { name: "coverUrl", label: "Örtük şəkli", type: "image" },
        { name: "content", label: "Ətraflı məzmun", type: "textarea", rows: 8 },
      ]}
      columns={[
        {
          key: "title",
          header: "Layihə",
          value: (r) => r.title,
          cell: (r) => (
            <div className="flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-ad-muted">
                {r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="40px" className="object-cover" unoptimized />}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{r.title}</span>
                <span className="block truncate text-xs text-ad-muted-fg">{r.summary || r.slug}</span>
              </span>
            </div>
          ),
        },
        { key: "year", header: "İl", value: (r) => r.year, cell: (r) => <span className="tabular-nums">{r.year || "—"}</span>, className: "w-24" },
        { key: "duration", header: "Müddət", value: (r) => r.duration, cell: (r) => r.duration || "—", className: "w-28" },
        {
          key: "state",
          header: "Vəziyyət",
          value: (r) => `${r.featured ? "seçilmiş" : ""} ${r.published ? "dərc" : "qaralama"}`,
          cell: (r) => (
            <div className="flex flex-wrap gap-1.5">
              {r.featured && <Badge tone="accent">Seçilmiş</Badge>}
              <Badge tone={r.published ? "success" : "neutral"}>{r.published ? "Dərc" : "Qaralama"}</Badge>
            </div>
          ),
          className: "w-44",
        },
        { key: "position", header: "Sıra", value: (r) => r.position, cell: (r) => <span className="tabular-nums">{r.position}</span>, className: "w-16" },
      ]}
    />
  );
}
