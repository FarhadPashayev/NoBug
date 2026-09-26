import Image from "next/image";
import { Plus, icons } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { serviceHref } from "@/lib/services";
import { TrackedLink } from "@/components/ui/tracked";

/**
 * Portrait service card (fortemplate/Screenshot …20.23.34): rounded-[28px],
 * full-cover graphic, soft top/bottom veils, name centred at the top with a
 * status badge, avatar + handle + index bottom-left, white pill CTA
 * bottom-right. The whole card is one link to the enquiry.
 */
export function ServiceCard({ id, index, total, title, text, image, icon, position, lang, t }: { id: string; index: number; total: number; title: string; text: string; image: string; icon?: string; position: "primary" | "secondary"; lang: Locale; t: Dictionary }) {
  const Icon = icon && icon in icons ? icons[icon as keyof typeof icons] : null;
  return (
    <TrackedLink
      href={serviceHref(lang, id)}
      event={{ name: "service_click", params: { service_id: id, position, locale: lang } }}
      className="group relative block aspect-[4/5] w-[min(78vw,300px)] flex-none snap-start overflow-hidden rounded-[28px] bg-ink text-white outline-none ring-yellow ring-offset-2 ring-offset-light focus-visible:ring-2"
      aria-label={`${title} — ${t.tpl.cardSelect}`}
    >
      <Image src={image} alt="" fill sizes="300px" className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]" />

      {/* veils for contrast: top (soft) and bottom (strong), plus a light blur band behind the footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[rgba(11,31,58,0.86)] via-[rgba(11,31,58,0.45)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[rgba(11,31,58,0.9)] via-[rgba(11,31,58,0.55)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_55%,transparent)]" />

      {/* header: name + status */}
      <div className="absolute inset-x-5 top-6 text-center">
        {Icon && (
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-white/12 ring-1 ring-white/25 backdrop-blur-sm" data-icon={icon}>
            <Icon size={22} aria-hidden="true" />
          </span>
        )}
        <div className="text-[clamp(20px,1.7vw,24px)] font-medium leading-[1.15] tracking-[-0.02em] text-balance">{title}</div>
        <div className="mt-2.5 inline-flex items-center gap-2 text-[13px] text-white/80">
          <span className={`relative inline-flex h-2 w-2 rounded-full ${position === "primary" ? "bg-yellow" : "bg-white/70"}`}>
            {position === "primary" && <span className="absolute inset-0 animate-ping rounded-full bg-yellow/70" />}
          </span>
          {position === "primary" ? t.tpl.cardPrimary : t.tpl.cardSecondary}
        </div>
        <p className="mx-auto mt-3 line-clamp-2 max-w-[24ch] text-[13px] leading-[1.45] text-white/70">{text}</p>
      </div>

      {/* footer: avatar + handle + index | white pill */}
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative h-9 w-9 flex-none overflow-hidden rounded-full border border-white/30 bg-ink">
            <Image src="/icon.png" alt="" fill sizes="36px" className="object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium leading-tight">@nobug</span>
            <span className="block text-[12px] leading-tight text-white/65">
              {String(index).padStart(2, "0")} · {t.tpl.cardOf.replace(/\d+/, String(total))}
            </span>
          </span>
        </div>
        <span className="inline-flex h-11 flex-none items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-medium text-ink shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:-translate-y-0.5">
          <Plus size={16} aria-hidden="true" />
          {t.tpl.cardSelect}
        </span>
      </div>
    </TrackedLink>
  );
}
