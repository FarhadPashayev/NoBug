"use client";

import Image from "next/image";
import { createProject, deleteProject, listProjects, reorderProjects, updateProject, type ProjectRow } from "@/actions/projects";
import { emptyLocalized, t } from "@/lib/i18n/localized";
import { projectSchema, type ProjectInput } from "@/schemas/projects";
import { CrudManager } from "../crud-manager";
import { Badge } from "../ui/badge";

export function ProjectsManager() {
  return (
    <CrudManager<ProjectInput, ProjectRow>
      queryKey="projects"
      actions={{ list: listProjects, create: createProject, update: updateProject, remove: deleteProject, reorder: reorderProjects }}
      schema={projectSchema}
      itemLabel="Layihə"
      searchPlaceholder="Layihə axtar…"
      emptyValues={{ slug: "", title: emptyLocalized(), shortDescription: emptyLocalized(), content: emptyLocalized(), duration: "", year: "", cover: { url: null, path: null }, tags: [], isFeatured: false, isPublished: true }}
      toForm={(r) => ({ slug: r.slug, title: r.title, shortDescription: r.shortDescription, content: r.content, duration: r.duration, year: r.year, cover: r.cover, tags: r.tags, isFeatured: r.isFeatured, isPublished: r.isPublished })}
      rowLabel={(r) => t(r.title)}
      fields={[
        { name: "title", label: "Başlıq", type: "localized" },
        { name: "slug", label: "Slug", type: "text", hint: "boş buraxsanız AZ başlıqdan yaranır" },
        { name: "year", label: "İl", type: "text", placeholder: "2026" },
        { name: "shortDescription", label: "Qısa təsvir", type: "localized", kind: "textarea", rows: 3 },
        { name: "duration", label: "Müddət", type: "text", placeholder: "3 ay" },
        { name: "tags", label: "Teqlər", type: "tags", hint: "vergüllə" },
        { name: "isFeatured", label: "Seçilmiş layihə", type: "switch" },
        { name: "isPublished", label: "Dərc olunub", type: "switch" },
        { name: "cover", label: "Örtük şəkli", type: "image", folder: "projects" },
        { name: "content", label: "Ətraflı məzmun", type: "localized", kind: "rich" },
      ]}
      columns={[
        {
          key: "title",
          header: "Layihə",
          value: (r) => `${t(r.title)} ${t(r.shortDescription)}`,
          cell: (r) => (
            <div className="flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-ad-muted">
                {r.cover.url && <Image src={r.cover.url} alt="" fill sizes="40px" className="object-cover" unoptimized />}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{t(r.title)}</span>
                <span className="block truncate text-xs text-ad-muted-fg">{t(r.shortDescription) || r.slug}</span>
              </span>
            </div>
          ),
        },
        { key: "year", header: "İl", value: (r) => r.year, cell: (r) => <span className="tabular-nums">{r.year || "—"}</span>, className: "w-20" },
        { key: "duration", header: "Müddət", value: (r) => r.duration, cell: (r) => r.duration || "—", className: "w-24" },
        {
          key: "state",
          header: "Vəziyyət",
          value: (r) => `${r.isFeatured ? "seçilmiş" : ""} ${r.isPublished ? "dərc" : "qaralama"}`,
          cell: (r) => (
            <div className="flex flex-wrap gap-1.5">
              {r.isFeatured && <Badge tone="accent">Seçilmiş</Badge>}
              <Badge tone={r.isPublished ? "success" : "neutral"}>{r.isPublished ? "Dərc" : "Qaralama"}</Badge>
            </div>
          ),
          className: "w-44",
        },
        { key: "order", header: "Sıra", value: (r) => r.order, cell: (r) => <span className="tabular-nums">{r.order + 1}</span>, className: "w-16" },
      ]}
    />
  );
}
