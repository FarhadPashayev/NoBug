"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { createTestimonial, deleteTestimonial, listTestimonials, reorderTestimonials, updateTestimonial } from "@/actions/testimonials";
import { asLocalized, emptyLocalized, t } from "@/lib/i18n/localized";
import { testimonialSchema, type TestimonialInput } from "@/schemas/testimonials";
import type { ImageRef } from "@/schemas/common";
import { Badge } from "../ui/badge";
import { CrudManager } from "../crud-manager";

type Row = { id: string; name: string; role: unknown; quote: unknown; rating: number; avatar: ImageRef; photo: ImageRef; isFeatured: boolean; isActive: boolean; order: number };

export function TestimonialsManager({ initial }: { initial?: Row[] }) {
  return (
    <CrudManager<TestimonialInput, Row>
      queryKey="testimonials"
      initialRows={initial}
      actions={{ list: listTestimonials, create: createTestimonial, update: updateTestimonial, remove: deleteTestimonial, reorder: reorderTestimonials }}
      schema={testimonialSchema}
      itemLabel="Rəy"
      searchPlaceholder="Ad və ya mətn axtar…"
      emptyValues={{ name: "", role: emptyLocalized(), quote: emptyLocalized(), rating: 5, avatar: { url: null, path: null }, photo: { url: null, path: null }, isFeatured: false, isActive: true }}
      toForm={(r) => ({ name: r.name, role: asLocalized(r.role), quote: asLocalized(r.quote), rating: r.rating, avatar: r.avatar, photo: r.photo, isFeatured: r.isFeatured, isActive: r.isActive })}
      rowLabel={(r) => r.name}
      fields={[
        { name: "name", label: "Ad", type: "text", placeholder: "Ad Soyad" },
        { name: "rating", label: "Qiymət (1–5)", type: "number", placeholder: "5" },
        { name: "role", label: "Vəzifə / şirkət", type: "localized", placeholder: "Direktor, Şirkət MMC", hint: "istəyə bağlı" },
        { name: "quote", label: "Rəy mətni", type: "localized", placeholder: "…" },
        { name: "avatar", label: "Profil şəkli", type: "image", folder: "testimonials", hint: "kvadrat, istəyə bağlı — yoxdursa baş hərf göstərilir" },
        { name: "photo", label: "Böyük kart üçün foto", type: "image", folder: "testimonials", hint: "yalnız seçilmiş rəydə; şaquli (3:4) daha yaxşı görünür" },
        { name: "isFeatured", label: "Seçilmiş (böyük kart)", type: "switch" },
        { name: "isActive", label: "Saytda göstər", type: "switch" },
      ]}
      columns={[
        { key: "order", header: "#", value: (r) => r.order, cell: (r) => <span className="font-mono text-xs text-ad-muted-fg">{r.order + 1}</span>, className: "w-12" },
        {
          key: "name",
          header: "Müştəri",
          value: (r) => r.name,
          cell: (r) => (
            <span className="flex items-center gap-3">
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-ad-muted">
                {r.avatar.url && <Image src={r.avatar.url} alt="" fill sizes="36px" className="object-cover" unoptimized />}
              </span>
              <span>
                <span className="block font-medium">{r.name}</span>
                <span className="block text-xs text-ad-muted-fg">{t(r.role)}</span>
              </span>
            </span>
          ),
        },
        { key: "quote", header: "Rəy", value: (r) => t(r.quote), cell: (r) => <span className="line-clamp-2 text-ad-muted-fg">{t(r.quote)}</span> },
        {
          key: "rating",
          header: "Qiymət",
          value: (r) => r.rating,
          cell: (r) => (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-current" /> {r.rating}
            </span>
          ),
          className: "w-24",
        },
        {
          key: "flags",
          header: "Status",
          value: (r) => `${r.isFeatured ? "seçilmiş " : ""}${r.isActive ? "aktiv" : "gizli"}`,
          cell: (r) => (
            <span className="flex flex-wrap gap-1">
              {r.isFeatured && <Badge tone="warning">Seçilmiş</Badge>}
              <Badge tone={r.isActive ? "success" : "neutral"}>{r.isActive ? "Aktiv" : "Gizli"}</Badge>
            </span>
          ),
          className: "w-40",
        },
      ]}
    />
  );
}
