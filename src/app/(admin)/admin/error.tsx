"use client";

import { useEffect } from "react";
import { Button } from "@/components/admin/ui/button";

/** Admin error boundary: the panel keeps its chrome; the message is generic, details go to the server log. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin error]", error.digest ?? error.message);
  }, [error]);
  return (
    <main className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-ad-muted-fg">Xəta</p>
        <h1 className="text-xl font-semibold">Səhifə yüklənmədi</h1>
        <p className="text-sm text-ad-muted-fg">Gözlənilməz xəta baş verdi. Yenidən cəhd edin; davam edərsə, bağlantınızı yoxlayın.</p>
        <Button onClick={reset}>Yenidən cəhd et</Button>
      </div>
    </main>
  );
}
