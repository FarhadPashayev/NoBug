"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { NOT_FOUND_COPY } from "@/lib/not-found";

/**
 * 404 inside the locale layout. Pages that detect an unknown slug set the
 * document title through generateMetadata (see lib/not-found.ts); this
 * component covers the rest and keeps the browser title in step.
 */
export default function LangNotFound() {
  const params = useParams<{ lang?: string }>();
  const lang: Locale = params?.lang && isLocale(params.lang) ? params.lang : "az";
  const c = NOT_FOUND_COPY[lang];
  useEffect(() => {
    document.title = `${c.title} — nobug`;
  }, [c.title]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
      <div>
        <div className="mono-label text-muted">404</div>
        <h1 className="type-h2 mt-4">{c.title}</h1>
        <Link href={`/${lang}`} className="btn-primary mt-8">
          {c.home}
        </Link>
      </div>
    </main>
  );
}
