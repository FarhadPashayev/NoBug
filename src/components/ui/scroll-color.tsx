"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Drives the page background from the section in view.
 *
 * Sections declare `data-bg="light" | "dark"` and keep their own text
 * colours. On wide mouse/trackpad screens the sections are transparent and
 * the body background crossfades (700ms, globals.css); on touch devices and
 * narrow screens each section paints its own ground and the body fade only
 * tints the header.
 *
 * Which section owns the ground is decided by a probe line:
 *  - crossfade mode: the probe sits at the *leading edge* of the scroll —
 *    near the bottom while scrolling down, near the top while scrolling up —
 *    so a section owns the ground as soon as its first line of copy enters
 *    the screen, and what the reader is about to read is never white on the
 *    light ground (or navy on navy). The copy left behind takes the new
 *    colour instead, which the reader has already passed.
 *  - own-ground mode: the probe sits just under the sticky header, so the
 *    header tint matches the section beneath it.
 */
const BG = { light: "#F8F9FA", dark: "#0B1F3A" } as const; // brand navy from the logo
export type PageBg = keyof typeof BG;

// keep in sync with the @media rule in globals.css
const CROSSFADE = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const PROBE = { down: 0.88, up: 0.12, header: 0.08 };
const FLIP_AFTER = 24; // px of travel before a direction change counts

export function ScrollColorWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-bg]"));
    if (!sections.length) return;
    const crossfade = window.matchMedia(CROSSFADE);

    let current: PageBg | null = null;
    const apply = (key: PageBg) => {
      if (key === current) return;
      current = key;
      root.style.setProperty("--page-bg", BG[key]);
      root.style.setProperty("--page-fg", key === "dark" ? "#ffffff" : "#0B1F3A");
      root.dataset.pageBg = key;
    };

    let lastY = window.scrollY;
    let down = true;
    let travel = 0;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      // a direction change needs a little travel first, so a trackpad bounce
      // or a one-pixel wobble does not flip the ground back and forth
      if ((dy > 0) !== down) {
        travel += Math.abs(dy);
        if (travel >= FLIP_AFTER) {
          down = dy > 0;
          travel = 0;
        }
      } else travel = 0;

      const probe = window.innerHeight * (crossfade.matches ? (down ? PROBE.down : PROBE.up) : PROBE.header);
      // the section whose box contains the probe line; below the last section
      // (the footer paints its own ground) the last one keeps the ground
      let owner: HTMLElement | null = null;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe) owner = s;
        else break;
      }
      apply(((owner ?? sections[0]).dataset.bg as PageBg) ?? "light");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    crossfade.addEventListener("change", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      crossfade.removeEventListener("change", schedule);
      // <html> survives client-side navigation: without this, leaving the home
      // page from a dark section carried the navy ground onto /anket and the
      // other light-only pages (navy copy on navy)
      root.style.removeProperty("--page-bg");
      root.style.removeProperty("--page-fg");
      delete root.dataset.pageBg;
    };
  }, []);

  return <>{children}</>;
}
