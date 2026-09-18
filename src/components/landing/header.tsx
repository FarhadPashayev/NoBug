"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { Logo } from "@/components/ui/logo";
import { LangSwitcher } from "@/components/ui/lang-switcher";

/** Light sticky header: logo · nav · language · red pill CTA. Hamburger below lg. */
export function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-60 backdrop-blur-md transition-[box-shadow] duration-300 ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container-site flex min-h-[72px] items-center gap-x-[clamp(16px,3vw,40px)] py-3">
        <Logo href={`/${lang}#top`} variant="dark" height={24} className="on-light" />
        <Logo href={`/${lang}#top`} variant="white" height={24} className="on-dark" />

        <nav className="mx-auto hidden gap-[clamp(16px,2.2vw,32px)] lg:flex" aria-label="Main">
          {t.nav.map(([href, label]) => (
            <Link key={href} href={`/${lang}${href}`} className="text-[15px] font-medium text-current transition-colors hover:text-red">
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0 lg:gap-6">
          <LangSwitcher current={lang} tone="page" />
          <Link href={`/${lang}/anket`} className="pill pill-red hidden sm:inline-flex">
            {t.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={t.menu} className="flex h-11 w-11 items-center justify-center rounded-full border border-current/20 text-current lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="container-site flex flex-col border-t border-current/15 pb-5 pt-2 lg:hidden" aria-label="Main mobile">
          {t.nav.map(([href, label]) => (
            <Link key={href} href={`/${lang}${href}`} onClick={() => setOpen(false)} className="border-b border-current/15 py-3.5 text-[17px] font-medium text-current last:border-0">
              {label}
            </Link>
          ))}
          <Link href={`/${lang}/anket`} onClick={() => setOpen(false)} className="pill pill-red mt-4 justify-center sm:hidden">
            {t.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      )}
    </header>
  );
}
