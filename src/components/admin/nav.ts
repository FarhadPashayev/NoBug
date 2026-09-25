import { BarChart3, FileText, Image as ImageIcon, Inbox, LayoutDashboard, ListTree, Settings, Table2, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

// Shared by the sidebar (client) and the breadcrumbs (server) so labels never drift.
export const NAV: NavGroup[] = [
  { label: "Ümumi", items: [{ href: "/admin", label: "İdarə paneli", icon: LayoutDashboard }] },
  {
    label: "Məzmun",
    items: [
      { href: "/admin/hero", label: "Banner", icon: ImageIcon },
      { href: "/admin/projects", label: "Layihələr", icon: FileText },
      { href: "/admin/stats", label: "Göstəricilər", icon: BarChart3 },
      { href: "/admin/services", label: "Xidmətlər", icon: ListTree },
      { href: "/admin/specs", label: "Standartlar", icon: Table2 },
    ],
  },
  {
    label: "Əlaqə",
    items: [
      { href: "/admin/leads", label: "Müraciətlər", icon: Inbox },
      { href: "/admin/settings", label: "Sayt parametrləri", icon: Settings },
    ],
  },
];

export const EXTRA_LABELS: Record<string, string> = { "/admin/profile": "Profil" };

/** "/admin/services" → [{href:"/admin",label:"İdarə paneli"},{href:"/admin/services",label:"Xidmətlər"}] */
export function breadcrumbsFor(pathname: string): { href: string; label: string }[] {
  const labels = new Map<string, string>(Object.entries(EXTRA_LABELS));
  NAV.forEach((g) => g.items.forEach((i) => labels.set(i.href, i.label)));
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    const label = labels.get(href) ?? (part.length > 12 ? "Redaktə" : part);
    crumbs.push({ href, label });
  }
  return crumbs;
}
