"use client";

import Link from "next/link";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { track } from "@/lib/analytics";

/** Mono 11px; active = paper text + accent underline. Keeps the current path. */
export function LangSwitcher({
  current,
  path = "",
  paths,
  tone = "dark",
}: {
  current: Locale;
  path?: string;
  paths?: Record<Locale, string>;
  tone?: "dark" | "light" | "page";
}) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Language">
      {LOCALES.map((code) => {
        const active = code === current;
        return (
          <Link
            key={code}
            href={`/${code}${paths ? paths[code] : path}`}
            hrefLang={code}
            title={LOCALE_LABELS[code].name}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              if (!active)
                track({
                  name: "language_switch",
                  params: { from: current, to: code },
                });
            }}
            className={`mono-label border-b py-1 transition-colors duration-140 ${
              tone === "page"
                ? active
                  ? "border-red text-current"
                  : "border-transparent text-current opacity-55 hover:opacity-100"
                : tone === "light"
                  ? active
                    ? "border-red text-ink"
                    : "border-transparent text-grey hover:text-ink"
                  : active
                    ? "border-accent text-paper"
                    : "border-transparent text-muted-navy hover:text-paper"
            }`}
          >
            {LOCALE_LABELS[code].code}
          </Link>
        );
      })}
    </div>
  );
}
