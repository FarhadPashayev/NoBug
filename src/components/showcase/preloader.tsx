"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Branded preloader over the carousel stage (never over the headline): a
 * 000 → 100 counter that runs while the canvas starts.
 * Lifts when `ready` turns true (after a short minimum, so it never flashes)
 * and at the latest after 1.5 s — the page never waits on WebGL.
 */
export function Preloader({ ready, label }: { ready: boolean; label: string }) {
  const [value, setValue] = useState(0);
  const [gone, setGone] = useState(false);
  const [hide, setHide] = useState(false);
  const start = useRef(0);

  useEffect(() => {
    start.current = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start.current;
      // eases towards 90 on its own; `ready` finishes the count
      setValue((v) => Math.max(v, Math.min(90, Math.round(90 * (1 - Math.exp(-t / 450))))));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const cap = window.setTimeout(() => setHide(true), 1500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const wait = Math.max(0, 450 - (performance.now() - start.current));
    const id = window.setTimeout(() => setHide(true), wait);
    return () => window.clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    if (!hide) return;
    const id = window.setTimeout(() => setGone(true), 650);
    return () => window.clearTimeout(id);
  }, [hide]);

  if (gone) return null;
  const shown = hide ? 100 : value;
  const digits = String(shown).padStart(3, "0");
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      className={`absolute inset-0 z-[5] flex items-center justify-center bg-ink-950 transition-opacity duration-500 ${hide ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <span className="font-mono text-[13px] tabular-nums tracking-[0.2em] text-paper/60">{digits}</span>
    </div>
  );
}
