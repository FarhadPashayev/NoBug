"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import type { SessionUser } from "@/lib/auth/session";

export function Topbar({ user, title }: { user: SessionUser; title: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  // the icon depends on the resolved theme, which only exists after hydration
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    toast.success("Çıxış edildi");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-ad-border bg-ad-bg/90 px-5 py-3 backdrop-blur lg:px-8">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted && theme === "dark" ? <Moon /> : <Sun />}
        </Button>
        <Link href="/admin/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ad-muted-fg transition-colors hover:bg-ad-muted hover:text-ad-fg">
          <User className="size-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </Link>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut />
          <span className="hidden sm:inline">Çıxış</span>
        </Button>
      </div>
    </header>
  );
}
