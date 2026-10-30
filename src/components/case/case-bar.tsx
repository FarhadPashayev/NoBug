"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type Neighbour = { title: string; href: string } | null;

const R = 15;
const C = 2 * Math.PI * R;

/**
 * Sticky bottom bar of a case study: scroll-progress ring (left), previous ·
 * title · next (centre), close (right). Esc closes too. `homeIndex` tells the
 * home carousel which card to show on the way back.
 */
export function CaseBar({ title, prev, next, closeHref, homeIndex, labels }: { title: string; prev: Neighbour; next: Neighbour; closeHref: string; homeIndex?: number; labels: { prev: string; next: string; close: string; progress: string } }) {
  const router = useRouter();
  const ring = useRef<SVGCircleElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 1;
      ring.current?.setAttribute("stroke-dashoffset", String(C * (1 - p)));
      bar.current?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const remember = () => {
    if (homeIndex !== undefined) sessionStorage.setItem("nobug:showcase-index", String(homeIndex));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // the About drawer handles its own Esc
      if (e.key !== "Escape" || document.getElementById("about-panel")) return;
      remember();
      router.push(closeHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <nav aria-label={title} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
      <div className="mx-auto flex h-16 max-w-[760px] items-center gap-2 rounded-full border border-black/10 bg-paper/85 px-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div ref={bar} role="progressbar" aria-label={labels.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} className="flex h-12 w-12 flex-none items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="-rotate-90">
            <circle cx="18" cy="18" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
            <circle ref={ring} cx="18" cy="18" r={R} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {prev ? (
            <Link href={prev.href} aria-label={`${labels.prev}: ${prev.title}`} className="round-btn border-transparent">
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          ) : (
            <span className="w-11 flex-none" />
          )}
          <span className="min-w-0 truncate px-1 text-center text-[15px] font-medium">{title}</span>
          {next ? (
            <Link href={next.href} aria-label={`${labels.next}: ${next.title}`} className="round-btn border-transparent">
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <span className="w-11 flex-none" />
          )}
        </div>

        <Link href={closeHref} onClick={remember} aria-label={labels.close} className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-ink-950 text-paper transition-opacity hover:opacity-80">
          <X size={18} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
