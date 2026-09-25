"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, ChevronDown, FileText, Image as ImageIcon, Inbox, LayoutDashboard, ListTree, Menu, Settings, Table2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Group = { label: string; items: Item[] };

export const NAV: Group[] = [
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

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const nav = (
    <nav className="flex flex-col gap-6 p-4" aria-label="Admin">
      {NAV.map((group) => {
        const isCollapsed = collapsed[group.label];
        return (
          <div key={group.label}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [group.label]: !c[group.label] }))}
              className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-ad-muted-fg transition-colors hover:text-ad-fg"
              aria-expanded={!isCollapsed}
            >
              {group.label}
              <ChevronDown className={cn("size-3.5 transition-transform", isCollapsed && "-rotate-90")} />
            </button>
            {!isCollapsed && (
              <ul className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-ad-accent/15 font-medium text-ad-accent" : "text-ad-muted-fg hover:bg-ad-muted hover:text-ad-fg",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-ad-accent text-ad-accent-fg shadow-lg lg:hidden"
        aria-label="Menyu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="admin-scroll absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-ad-border bg-ad-card">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold">nobug admin</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Bağla" className="rounded-md p-1 text-ad-muted-fg hover:bg-ad-muted hover:text-ad-fg">
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <aside className="admin-scroll sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-ad-border bg-ad-card lg:block">
        <Link href="/admin" className="flex items-center gap-2 px-6 py-5 text-sm font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-ad-accent text-ad-accent-fg">n</span>
          nobug admin
        </Link>
        {nav}
      </aside>
    </>
  );
}
