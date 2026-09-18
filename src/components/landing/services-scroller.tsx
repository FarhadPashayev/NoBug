"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Single-row horizontal scroller: snap-x, hidden scrollbar, arrow buttons
 * on hover/keyboard, drag-to-scroll with the mouse (touch scrolls natively).
 * The row bleeds to the viewport edges; scroll-padding matches the gutter.
 */
export function ServicesScroller({ children, prevLabel, nextLabel }: { children: ReactNode; prevLabel: string; nextLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const by = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  // mouse drag → scroll (pointer events; touch keeps native scrolling)
  const drag = useRef<{ x: number; left: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft };
    ref.current.classList.add("cursor-grabbing");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const onPointerUp = () => {
    drag.current = null;
    ref.current?.classList.remove("cursor-grabbing");
  };

  return (
    <div className="group/scroller relative">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="no-scrollbar -mx-[clamp(20px,5.5vw,80px)] flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[clamp(20px,5.5vw,80px)] py-2 [scroll-padding-inline:clamp(20px,5.5vw,80px)] cursor-grab select-none"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => by(-1)}
        aria-label={prevLabel}
        disabled={edge.start}
        className="absolute left-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-fog bg-white text-ink shadow-[0_6px_20px_rgba(11,31,58,0.12)] transition-opacity disabled:opacity-0 md:flex"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => by(1)}
        aria-label={nextLabel}
        disabled={edge.end}
        className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-fog bg-white text-ink shadow-[0_6px_20px_rgba(11,31,58,0.12)] transition-opacity disabled:opacity-0 md:flex"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
