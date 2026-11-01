"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { Logo } from "@/components/ui/logo";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { scrollToHash, setScrollLocked } from "@/components/ui/smooth-scroll";
import { ChannelIcon, type Channel } from "./channels";

export type AboutData = {
  title: string;
  labels: { who: string; founded: string; mission: string; services: string; numbers: string; team: string; how: string };
  who: string[];
  founded: string;
  mission: string;
  services: { name: string; href: string }[];
  stats: { value: string; label: string }[];
  /** TODO(content): the team is not published yet — the section renders once the panel provides people. */
  team: { name: string; role: string; photoUrl: string | null }[];
  process: [string, string][];
};

export type ChromeCopy = { about: string; contact: string; close: string };

/**
 * Header (logo · language · About · Contact), the About drawer and the
 * sticky mobile contact button — shared by the home page (`tone="ink"`) and
 * the case-study pages (`tone="paper"`).
 */
export function SiteChrome({ lang, tone, t, about, channels, paths, fab = true }: { lang: Locale; tone: "ink" | "paper"; t: ChromeCopy; about: AboutData; channels: Channel[]; paths?: Record<Locale, string>; fab?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const onHome = pathname === `/${lang}`;
  const whatsapp = channels.find((c) => c.id === "whatsapp");

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  const contact = (e: React.MouseEvent) => {
    if (!onHome) return; // a normal link to /{lang}#elaqe
    e.preventDefault();
    setOpen(false);
    scrollToHash("elaqe");
  };

  return (
    <>
      <header className={`intro-fade pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-4 bg-gradient-to-b px-[25px] pb-8 pt-[max(25px,env(safe-area-inset-top))] md:px-[47px] md:pt-[46px] ${tone === "ink" ? "from-ink-950 via-ink-950/70" : "from-paper via-paper/80"} to-transparent`}>
        <div className="pointer-events-auto">
          <Logo href={`/${lang}`} variant={tone === "ink" ? "brand-dark" : "brand"} height={21} />
        </div>
        <nav aria-label="Main" className={`pointer-events-auto -mt-3 flex items-center gap-x-5 text-[13px] md:gap-x-7 md:text-[14px] ${tone === "ink" ? "text-paper" : "text-ink-950"}`}>
          <LangSwitcher current={lang} tone="page" paths={paths} />
          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="about-panel"
            className="min-h-11 transition-opacity hover:opacity-45"
          >
            {t.about}
          </button>
          <Link href={`/${lang}#elaqe`} onClick={contact} className="hidden min-h-11 items-center transition-opacity hover:opacity-45 sm:inline-flex">
            {t.contact}
          </Link>
        </nav>
      </header>

      {/* mobile: one contact button always in reach (case studies have their own bottom bar) */}
      {fab && (
      <a
        href={whatsapp?.href ?? `/${lang}#elaqe`}
        onClick={whatsapp ? undefined : contact}
        {...(whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={whatsapp ? whatsapp.label : t.contact}
        className="intro-fade fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-yellow text-ink-950 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:hidden"
      >
        {whatsapp ? <ChannelIcon id="whatsapp" size={24} /> : <MessageCircle size={22} aria-hidden="true" />}
      </a>
      )}

      {open && <AboutDrawer data={about} channels={channels} closeLabel={t.close} onClose={close} />}
    </>
  );
}

function AboutDrawer({ data, channels, closeLabel, onClose }: { data: AboutData; channels: Channel[]; closeLabel: string; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setScrollLocked(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panel.current) return;
      // focus trap: Tab cycles inside the drawer
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const wrapTo = e.shiftKey ? (document.activeElement === first ? last : null) : document.activeElement === last ? first : null;
      if (wrapTo) {
        e.preventDefault();
        wrapTo.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="drawer-backdrop absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        id="about-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="drawer-panel absolute inset-y-0 right-0 flex w-full flex-col bg-paper text-ink-950 sm:w-[min(560px,92vw)]"
      >
        <div className="flex items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 sm:pt-7">
          <h2 id="about-title" className="text-[15px] font-medium">
            {data.title}
          </h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label={closeLabel} className="round-btn">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10 sm:px-10" data-lenis-prevent>
          <Block label={data.labels.who}>
            {data.who.map((p) => (
              <p key={p} className="mt-3 text-[clamp(19px,2vw,24px)] leading-[1.3] tracking-[-0.015em] first:mt-0">
                {p}
              </p>
            ))}
          </Block>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-black/10 pt-6">
            <div>
              <div className="eyebrow text-black/60">{data.labels.founded}</div>
              <div className="mt-2 text-[28px] font-medium tracking-[-0.02em]">{data.founded}</div>
            </div>
            <div>
              <div className="eyebrow text-black/60">{data.labels.mission}</div>
              <p className="mt-2 text-[15px] leading-[1.45]">{data.mission}</p>
            </div>
          </div>

          <Block label={data.labels.services}>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {data.services.map((s) => (
                <li key={s.href} className="border-b border-black/10">
                  <Link href={s.href} onClick={onClose} className="flex min-h-11 items-center py-2 text-[16px] transition-opacity hover:opacity-50">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Block>

          {data.stats.length > 0 && (
            <Block label={data.labels.numbers}>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                {data.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="text-[28px] font-medium leading-none tracking-[-0.02em]">{s.value}</dd>
                    <dd className="mt-1.5 text-[13px] leading-[1.4] text-black/65">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {data.team.length > 0 && (
            <Block label={data.labels.team}>
              <ul className="grid grid-cols-2 gap-4">
                {data.team.map((m) => (
                  <li key={m.name}>
                    <div className="aspect-square overflow-hidden rounded-[8px] bg-black/5">{m.photoUrl && <Image src={m.photoUrl} alt={m.name} width={400} height={400} className="h-full w-full object-cover" />}</div>
                    <div className="mt-2 text-[15px] font-medium">{m.name}</div>
                    <div className="text-[13px] text-black/65">{m.role}</div>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block label={data.labels.how}>
            <ol className="space-y-3">
              {data.process.map(([step, text], i) => (
                <li key={step} className="grid grid-cols-[2.25rem_1fr] gap-1">
                  <span className="font-mono text-[12px] leading-[1.9] text-black/60">0{i + 1}</span>
                  <span>
                    <span className="block text-[16px] font-medium">{step}</span>
                    <span className="block text-[14px] leading-[1.45] text-black/60">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        </div>

        {/* sticky contact buttons */}
        {channels.length > 0 && (
          <div className="grid auto-cols-fr grid-flow-col gap-2 border-t border-black/10 bg-paper px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-10">
            {channels
              .filter((c) => c.id !== "phone")
              .map((c) => (
                <a
                  key={c.id}
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink-950 px-3 text-[14px] font-medium text-paper transition-opacity hover:opacity-80"
                >
                  <ChannelIcon id={c.id} size={16} />
                  <span className="hidden sm:inline">{c.label}</span>
                  <span className="sr-only sm:hidden">{c.label}</span>
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-6">
      <h3 className="eyebrow mb-4 text-black/60">{label}</h3>
      {children}
    </section>
  );
}
