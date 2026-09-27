"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { logout } from "@/actions/auth";
import { Breadcrumbs } from "./breadcrumbs";
import { breadcrumbsFor } from "./nav";
import { Button } from "./ui/button";
import type { SessionUser } from "@/lib/auth/session";

export function Topbar({ user }: { user: SessionUser }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [leaving, startLeaving] = useTransition();
  const pathname = usePathname();
  // the icon depends on the resolved theme, which only exists after hydration
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-ad-border bg-ad-bg/90 px-5 py-3 backdrop-blur lg:px-8">
      <Breadcrumbs items={breadcrumbsFor(pathname)} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted && theme === "dark" ? <Moon /> : <Sun />}
        </Button>
        <Link href="/admin/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ad-muted-fg transition-colors hover:bg-ad-muted hover:text-ad-fg">
          <User className="size-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </Link>
        <Button variant="outline" size="sm" loading={leaving} onClick={() => startLeaving(() => logout())}>
          <LogOut />
          <span className="hidden sm:inline">Çıxış</span>
        </Button>
      </div>
    </header>
  );
}
