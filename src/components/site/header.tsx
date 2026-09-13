"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Logo } from "@/components/ui/logo";

/** Sticky navy header. 96px → 72px and solid background after 80px of scroll. */
export function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-60 border-b border-navy-line transition-colors duration-200 ease-[var(--ease-brand)] ${scrolled ? "bg-navy" : "bg-[rgba(11,31,58,0.94)]"}`}
    >
      <div
        className={`container-site flex items-center gap-x-[clamp(16px,3vw,48px)] py-3 transition-[min-height] duration-200 ease-[var(--ease-brand)] ${scrolled ? "min-h-[72px]" : "min-h-[72px] lg:min-h-[96px]"}`}
      >
        <Logo href={`/${lang}#top`} variant="mark" height={26} />

        <nav className="mr-auto hidden gap-[clamp(14px,2vw,28px)] lg:flex" aria-label="Main">
          {t.nav.map(([href, label]) => (
            <Link key={href} href={`/${lang}${href}`} className="link-rule text-[15px] text-paper">
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <LangSwitcher current={lang} />
          <Link href={`/${lang}/anket`} className="hidden h-11 items-center rounded-xs border border-[rgba(237,235,229,0.28)] px-[18px] text-[15px] font-medium text-paper transition-colors duration-200 hover:border-paper hover:bg-[rgba(237,235,229,0.08)] sm:inline-flex">
            {t.cta}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={t.menu}
            className="flex h-11 w-11 items-center justify-center rounded-xs border border-[rgba(237,235,229,0.28)] text-paper lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="container-site flex flex-col border-t border-navy-line py-3 lg:hidden" aria-label="Main mobile">
          {t.nav.map(([href, label]) => (
            <Link key={href} href={`/${lang}${href}`} onClick={() => setOpen(false)} className="border-b border-navy-line py-3.5 text-[17px] text-paper last:border-0">
              {label}
            </Link>
          ))}
          <Link href={`/${lang}/anket`} onClick={() => setOpen(false)} className="mt-3 inline-flex h-11 items-center justify-center rounded-xs border border-paper text-[15px] font-medium text-paper sm:hidden">
            {t.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}

/** Mono 11px; active = paper text + accent underline. Keeps the current path. */
export function LangSwitcher({ current, path = "" }: { current: Locale; path?: string }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Language">
      {LOCALES.map((code) => {
        const active = code === current;
        return (
          <Link
            key={code}
            href={`/${code}${path}`}
            hrefLang={code}
            title={LOCALE_LABELS[code].name}
            aria-current={active ? "true" : undefined}
            className={`mono-label border-b py-1 transition-colors duration-140 ${active ? "border-accent text-paper" : "border-transparent text-muted-navy hover:text-paper"}`}
          >
            {LOCALE_LABELS[code].code}
          </Link>
        );
      })}
    </div>
  );
}
