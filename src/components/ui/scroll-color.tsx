"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Drives the page background from the section in view.
 *
 * Sections declare `data-bg="light" | "dark"`. Two modes (globals.css):
 *  - crossfade (wide mouse/trackpad screens): sections are transparent, the
 *    body background fades (700ms) and the copy that sits on the ground
 *    follows it through `html[data-page-bg]`. The section at the centre of
 *    the screen owns the ground — whatever else is on screen stays readable
 *    because its ink changes with the ground.
 *  - own-ground (touch, narrow, reduced motion): each section paints its own
 *    colour; the probe sits just under the sticky header so the header tint
 *    matches the section beneath it.
 */
const BG = { light: "#F8F9FA", dark: "#0B1F3A" } as const; // brand navy from the logo
export type PageBg = keyof typeof BG;

// keep in sync with the @media rule in globals.css
const CROSSFADE = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const PROBE = { centre: 0.5, header: 0.08 };

export function ScrollColorWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-bg]"));
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

    let raf = 0;
    const measure = () => {
      raf = 0;
      const probe = window.innerHeight * (crossfade.matches ? PROBE.centre : PROBE.header);
      // the section whose box contains the probe line; below the last section
      // (the footer paints its own ground) the last one keeps the ground
      let owner: HTMLElement | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= probe) owner = el;
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
