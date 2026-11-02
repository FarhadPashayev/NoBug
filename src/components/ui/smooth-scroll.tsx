"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// One Lenis instance for the page (off with prefers-reduced-motion and on
// touch, where native momentum scrolling is better). Other components scroll
// through `scrollToY` so they work with and without it.
let lenis: Lenis | null = null;

export function scrollToY(y: number, opts: { immediate?: boolean; duration?: number } = {}) {
  if (lenis) {
    // the pinned hero changes the page height after hydration — Lenis must clamp to the current limit
    lenis.resize();
    lenis.scrollTo(y, { immediate: opts.immediate, duration: opts.duration ?? 1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else window.scrollTo({ top: y, behavior: opts.immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

/** Scrolls to an in-page anchor, honouring the section's scroll-margin-top (like a native anchor jump). */
export function scrollToHash(hash: string, opts: { immediate?: boolean } = {}) {
  const el = document.getElementById(decodeURIComponent(hash.replace(/^#/, "")));
  if (!el) return;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  scrollToY(Math.round(el.getBoundingClientRect().top + window.scrollY - margin), opts);
}

/** Freezes page scrolling under an overlay (drawer, dialog). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SmoothScroll() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
