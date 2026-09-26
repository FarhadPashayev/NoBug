"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { ERROR_COPY } from "@/lib/errors-copy";

/** Small fixed notice while the browser reports no connection; a short "back online" flash afterwards. */
export function OfflineBanner({ lang }: { lang: Locale }) {
  const [state, setState] = useState<"online" | "offline" | "restored">("online");
  useEffect(() => {
    const off = () => setState("offline");
    const on = () => {
      setState((s) => (s === "offline" ? "restored" : s));
      window.setTimeout(() => setState((s) => (s === "restored" ? "online" : s)), 3000);
    };
    if (!navigator.onLine) off();
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, []);
  if (state === "online") return null;
  const c = ERROR_COPY[lang];
  return (
    <div
      role="status"
      aria-live="polite"
      data-offline-banner
      className={`fixed inset-x-0 bottom-0 z-[100] px-4 py-3 text-center text-[14px] font-medium [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] ${state === "offline" ? "bg-error text-white" : "bg-navy text-white"}`}
    >
      {state === "offline" ? c.offline : c.online}
    </div>
  );
}
