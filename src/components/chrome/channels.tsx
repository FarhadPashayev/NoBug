import { Mail, Phone } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import type { ShowcaseCopy } from "@/lib/i18n/showcase";

export type ChannelId = "whatsapp" | "phone" | "email" | "instagram" | "linkedin";
export type Channel = { id: ChannelId; label: string; href: string; value: string; external: boolean };

/** Contact channels from Sayt parametrləri; a channel without a value is simply not offered. */
export function buildChannels(settings: SiteContent["settings"], labels: ShowcaseCopy["channels"]): Channel[] {
  const phone = settings.phones[0]?.trim() ?? "";
  const digits = phone.replace(/[^\d]/g, "");
  const out: Channel[] = [];
  if (digits) out.push({ id: "whatsapp", label: labels.whatsapp, href: `https://wa.me/${digits}`, value: phone, external: true });
  if (digits) out.push({ id: "phone", label: labels.phone, href: `tel:+${digits}`, value: phone, external: false });
  if (settings.email) out.push({ id: "email", label: labels.email, href: `mailto:${settings.email}`, value: settings.email, external: false });
  if (settings.social.instagram) out.push({ id: "instagram", label: labels.instagram, href: settings.social.instagram, value: "@" + settings.social.instagram.replace(/\/+$/, "").split("/").pop(), external: true });
  if (settings.social.linkedin) out.push({ id: "linkedin", label: labels.linkedin, href: settings.social.linkedin, value: "LinkedIn", external: true });
  return out;
}

// Brand glyphs are drawn here (lucide ships no brand icons).
export function ChannelIcon({ id, size = 18 }: { id: ChannelId; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true as const };
  if (id === "email") return <Mail size={size} aria-hidden="true" />;
  if (id === "phone") return <Phone size={size} aria-hidden="true" />;
  if (id === "whatsapp")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
        <path d="M9 8.6c0 3.4 2.9 6.3 6.3 6.4l1-1.6-2-1-1 .9a5 5 0 0 1-2.7-2.7l.9-1-1-2z" />
      </svg>
    );
  if (id === "instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  return (
    <svg {...common} fill="currentColor">
      <path d="M5 9h3v10H5zM6.5 4.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10 9h2.9v1.4c.5-.9 1.6-1.6 3.1-1.6 3 0 3.5 1.9 3.5 4.4V19h-3v-5.1c0-1.2 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V19h-3z" />
    </svg>
  );
}
