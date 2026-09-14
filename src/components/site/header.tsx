"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Logo } from "@/components/ui/logo";
import { track } from "@/lib/analytics";

/**
 * Sticky navy header: logo · language switcher · one CTA. No horizontal nav —
 * the page map is the vertical section index in the left margin.
 * 96px → 72px and solid background after 80px of scroll.
 */
export function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-60 border-b border-navy-line transition-colors duration-200 ease-[var(--ease-brand)] ${scrolled ? "bg-navy" : "bg-[rgba(11,31,58,0.94)]"}`}>
      <div className={`container-site flex items-center gap-x-[clamp(16px,3vw,48px)] py-3 transition-[min-height] duration-200 ease-[var(--ease-brand)] ${scrolled ? "min-h-[72px]" : "min-h-[72px] lg:min-h-[96px]"}`}>
        <Logo href={`/${lang}#top`} variant="mark" height={26} />
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <LangSwitcher current={lang} />
          <Link href={`/${lang}/anket`} className="inline-flex h-11 items-center rounded-xs border border-[rgba(237,235,229,0.28)] px-[18px] text-[15px] font-medium text-paper transition-colors duration-200 hover:border-paper hover:bg-[rgba(237,235,229,0.08)]">
            {t.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Mono 11px; active = paper text + accent underline. Keeps the current path. */
export function LangSwitcher({ current, path = "", paths }: { current: Locale; path?: string; paths?: Record<Locale, string> }) {
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
              if (!active) track({ name: "language_switch", params: { from: current, to: code } });
            }}
            className={`mono-label border-b py-1 transition-colors duration-140 ${active ? "border-accent text-paper" : "border-transparent text-muted-navy hover:text-paper"}`}
          >
            {LOCALE_LABELS[code].code}
          </Link>
        );
      })}
    </div>
  );
}
