"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";

const STORAGE_KEY = "nobug.admin.sidebar";

/**
 * Desktop: sticky column that collapses to an icon rail (remembered per
 * browser). Mobile: floating button that opens a drawer.
 */
export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rail, setRail] = useState(false);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      // read after mount so the server and first client render agree
      const raf = requestAnimationFrame(() => setRail(localStorage.getItem(STORAGE_KEY) === "rail"));
      return () => cancelAnimationFrame(raf);
    } catch {
      /* private mode */
    }
  }, []);

  function toggleRail() {
    const next = !rail;
    setRail(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "rail" : "full");
    } catch {
      /* ignore */
    }
  }

  const nav = (compact: boolean) => (
    <nav className={cn("flex flex-col gap-6", compact ? "px-2 py-3" : "p-4")} aria-label="Admin">
      {NAV.map((group) => {
        const isHidden = hidden[group.label] && !compact;
        return (
          <div key={group.label}>
            {!compact && (
              <button
                type="button"
                onClick={() => setHidden((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-ad-muted-fg transition-colors hover:text-ad-fg"
                aria-expanded={!isHidden}
              >
                {group.label}
                <ChevronDown className={cn("size-3.5 transition-transform", isHidden && "-rotate-90")} />
              </button>
            )}
            {!isHidden && (
              <ul className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        // dynamic routes are not prefetched by default; the panel has
                        // nine of them, so fetch them while the sidebar is in view
                        prefetch={true}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        title={compact ? label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-sm transition-colors",
                          compact ? "justify-center px-0 py-2.5" : "px-3 py-2",
                          active ? "bg-ad-accent/15 font-medium text-ad-accent" : "text-ad-muted-fg hover:bg-ad-muted hover:text-ad-fg",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        {!compact && label}
                        {compact && <span className="sr-only">{label}</span>}
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
        className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-ad-accent text-ad-accent-fg shadow-lg [bottom:calc(1.25rem+env(safe-area-inset-bottom))] [right:calc(1.25rem+env(safe-area-inset-right))] lg:hidden"
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
            {nav(false)}
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "admin-scroll sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-ad-border bg-ad-card transition-[width] duration-200 lg:flex",
          rail ? "w-16" : "w-64",
        )}
      >
        <Link href="/admin" className={cn("flex items-center gap-2 text-sm font-semibold tracking-tight", rail ? "justify-center py-5" : "px-6 py-5")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-ad-accent text-ad-accent-fg">n</span>
          {!rail && "nobug admin"}
        </Link>
        <div className="flex-1">{nav(rail)}</div>
        <button
          type="button"
          onClick={toggleRail}
          aria-label={rail ? "Menyunu genişləndir" : "Menyunu yığ"}
          className={cn("m-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ad-muted-fg transition-colors hover:bg-ad-muted hover:text-ad-fg", rail && "justify-center px-0")}
        >
          {rail ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!rail && "Yığ"}
        </button>
      </aside>
    </>
  );
}
