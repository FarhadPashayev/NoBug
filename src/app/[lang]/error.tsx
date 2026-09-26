"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ERROR_COPY } from "@/lib/errors-copy";

/** Route-level error boundary for the public site: localized, no stack traces, one retry button. */
export default function LangError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ lang?: string }>();
  const lang: Locale = params?.lang && isLocale(params.lang) ? params.lang : "az";
  const c = ERROR_COPY[lang];
  useEffect(() => {
    console.error("[page error]", error.digest ?? error.message);
  }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
      <div className="max-w-[48ch]">
        <div className="mono-label text-muted">500</div>
        <h1 className="type-h2 mt-4">{c.title}</h1>
        <p className="type-body mt-4 text-muted">{c.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            {c.retry}
          </button>
          <Link href={`/${lang}`} className="btn-secondary">
            {c.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
