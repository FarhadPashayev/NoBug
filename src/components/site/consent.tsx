"use client";

import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const KEY = "nobug.consent"; // "granted" | "denied"
type Choice = "granted" | "denied" | null;

/**
 * Cookie banner for Google Analytics. Nothing is loaded and no cookie is set
 * until the visitor accepts; "decline" is remembered too, so the banner shows
 * once. Rendered only when NEXT_PUBLIC_GA_ID is set (see [lang]/layout.tsx).
 */
export function Consent({ gaId, privacyHref, t }: { gaId: string; privacyHref: string; t: { text: string; accept: string; decline: string; more: string } }) {
  const [choice, setChoice] = useState<Choice | undefined>(undefined); // undefined = not read yet (SSR)

  useEffect(() => {
    let stored: Choice = null;
    try {
      const v = localStorage.getItem(KEY);
      stored = v === "granted" || v === "denied" ? v : null;
    } catch {}
    const raf = requestAnimationFrame(() => setChoice(stored));
    return () => cancelAnimationFrame(raf);
  }, []);

  const decide = (c: Exclude<Choice, null>) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setChoice(c);
  };

  return (
    <>
      {choice === "granted" && <GoogleAnalytics gaId={gaId} />}
      {choice === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={t.more}
          className="fixed inset-x-4 bottom-4 z-70 mx-auto max-w-[460px] rounded-[20px] border border-navy-line bg-navy p-5 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:left-6 sm:mx-0"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          <p className="m-0 text-[15px] leading-[1.55]">
            {t.text}{" "}
            <Link href={privacyHref} className="underline decoration-grey-navy underline-offset-4 hover:decoration-white">
              {t.more}
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide("granted")} className="pill pill-yellow h-11 px-5 text-[14px]">
              {t.accept}
            </button>
            <button type="button" onClick={() => decide("denied")} className="pill pill-outline pill-outline-light h-11 px-5 text-[14px]">
              {t.decline}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
