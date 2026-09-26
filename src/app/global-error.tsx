"use client";

import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

/** Last-resort boundary (root layout failed): renders its own document, Azerbaijani + English. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error.digest ?? error.message);
  }, [error]);
  return (
    <html lang="az">
      <body className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <div className="max-w-[48ch]">
          <div className="mono-label text-muted">500</div>
          <h1 className="type-h2 mt-4">Nəsə səhv getdi</h1>
          <p className="type-body mt-4 text-muted">Səhifə yüklənərkən xəta baş verdi. Yenidən cəhd edin.</p>
          <p className="type-small mt-2 text-muted">Something went wrong. Please try again.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-primary">
              Yenidən cəhd et
            </button>
            <Link href="/az" className="btn-secondary">
              Ana səhifə
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
