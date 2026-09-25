"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { unwrap } from "@/actions/result";
import {
  createService,
  createServiceCategory,
  deleteService,
  deleteServiceCategory,
  listServiceCategories,
  listServices,
  reorderServiceCategories,
  reorderServices,
  updateService,
  updateServiceCategory,
  type ServiceCategoryRow,
  type ServiceRow,
} from "@/actions/services";
import { emptyLocalized, t } from "@/lib/i18n/localized";
import { serviceCategorySchema, serviceSchema, type ServiceCategoryInput, type ServiceInput } from "@/schemas/services";
import { CrudManager } from "../crud-manager";
import { Badge } from "../ui/badge";

const TAB = "rounded-md px-3 py-1.5 text-sm text-ad-muted-fg transition-colors data-[state=active]:bg-ad-card data-[state=active]:text-ad-fg data-[state=active]:shadow-sm";

type Initial = { services?: ServiceRow[]; categories?: ServiceCategoryRow[] };

export function ServicesManager({ initial }: { initial?: Initial }) {
  return (
    <Tabs.Root defaultValue="services" className="space-y-4">
      <Tabs.List className="inline-flex rounded-lg border border-ad-border bg-ad-muted/60 p-1" aria-label="Bölmə">
        <Tabs.Trigger value="services" className={TAB}>
          Xidmətlər
        </Tabs.Trigger>
        <Tabs.Trigger value="categories" className={TAB}>
          Kateqoriyalar
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="services">
        <Services initial={initial} />
      </Tabs.Content>
      <Tabs.Content value="categories">
        <Categories initial={initial?.categories} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function Services({ initial }: { initial?: Initial }) {
  // categories populate the select; the list is short and cached for the session
  const categories = useQuery({ queryKey: ["service-categories"], queryFn: async () => unwrap(await listServiceCategories()), initialData: initial?.categories });
  const options = (categories.data ?? []).map((c) => ({ value: c.id, label: t(c.name) }));

  return (
    <CrudManager<ServiceInput, ServiceRow>
      queryKey="services"
      initialRows={initial?.services}
      actions={{ list: listServices, create: createService, update: updateService, remove: deleteService, reorder: reorderServices }}
      schema={serviceSchema}
      itemLabel="Xidmət"
      searchPlaceholder="Xidmət axtar…"
      emptyValues={{ slug: "", name: emptyLocalized(), shortDescription: emptyLocalized(), details: emptyLocalized(), icon: "", image: { url: null, path: null }, categoryId: null, isActive: true }}
      toForm={(r) => ({ slug: r.slug, name: r.name, shortDescription: r.shortDescription, details: r.details, icon: r.icon, image: r.image, categoryId: r.categoryId, isActive: r.isActive })}
      rowLabel={(r) => t(r.name)}
      fields={[
        { name: "name", label: "Xidmətin adı", type: "localized" },
        { name: "slug", label: "Slug", type: "text", hint: "sorğu linki: /anket?xidmet=<slug>" },
        { name: "categoryId", label: "Kateqoriya", type: "select", options },
        { name: "shortDescription", label: "Qısa təsvir", type: "localized", kind: "textarea", rows: 3 },
        { name: "icon", label: "İkon adı", type: "text", placeholder: "Server", hint: "Lucide ikon adı; şəkil yüklənsə o üstün tutulur" },
        { name: "isActive", label: "Aktiv", type: "switch" },
        { name: "image", label: "Kart şəkli", type: "image", folder: "services" },
        { name: "details", label: "Ətraflı", type: "localized", kind: "rich" },
      ]}
      columns={[
        {
          key: "name",
          header: "Xidmət",
          value: (r) => `${t(r.name)} ${t(r.shortDescription)} ${r.slug}`,
          cell: (r) => (
            <div className="flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-ad-muted">
                {r.image.url && <Image src={r.image.url} alt="" fill sizes="40px" className="object-cover" unoptimized />}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{t(r.name)}</span>
                <span className="block truncate text-xs text-ad-muted-fg">{t(r.shortDescription) || r.slug}</span>
              </span>
            </div>
          ),
        },
        { key: "category", header: "Kateqoriya", value: (r) => (r.category ? t(r.category.name) : ""), cell: (r) => (r.category ? t(r.category.name) : <span className="text-ad-muted-fg">—</span>), className: "w-44" },
        {
          key: "state",
          header: "Vəziyyət",
          value: (r) => (r.isActive ? "aktiv" : "gizli"),
          cell: (r) => <Badge tone={r.isActive ? "success" : "neutral"}>{r.isActive ? "Aktiv" : "Gizli"}</Badge>,
          className: "w-28",
        },
        { key: "order", header: "Sıra", value: (r) => r.order, cell: (r) => <span className="tabular-nums">{r.order + 1}</span>, className: "w-16" },
      ]}
    />
  );
}

function Categories({ initial }: { initial?: ServiceCategoryRow[] }) {
  return (
    <CrudManager<ServiceCategoryInput, ServiceCategoryRow>
      queryKey="service-categories"
      initialRows={initial}
      actions={{ list: listServiceCategories, create: createServiceCategory, update: updateServiceCategory, remove: deleteServiceCategory, reorder: reorderServiceCategories }}
      schema={serviceCategorySchema}
      itemLabel="Kateqoriya"
      searchPlaceholder="Kateqoriya axtar…"
      emptyValues={{ slug: "", name: emptyLocalized() }}
      toForm={(r) => ({ slug: r.slug, name: r.name })}
      rowLabel={(r) => t(r.name)}
      fields={[
        { name: "name", label: "Ad", type: "localized" },
        { name: "slug", label: "Slug", type: "text", hint: "boş buraxsanız addan yaranır", full: true },
      ]}
      columns={[
        { key: "name", header: "Kateqoriya", value: (r) => t(r.name), cell: (r) => <span className="font-medium">{t(r.name)}</span> },
        { key: "slug", header: "Slug", value: (r) => r.slug, cell: (r) => <span className="font-mono text-xs text-ad-muted-fg">{r.slug}</span>, className: "w-40" },
        { key: "count", header: "Xidmət", value: (r) => r.count, cell: (r) => <span className="tabular-nums">{r.count}</span>, className: "w-20" },
        { key: "order", header: "Sıra", value: (r) => r.order, cell: (r) => <span className="tabular-nums">{r.order + 1}</span>, className: "w-16" },
      ]}
    />
  );
}
