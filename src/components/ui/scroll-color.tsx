"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Drives the page background from the section in view.
 *
 * Sections declare `data-bg="light" | "dark"` and keep their own text
 * colours; only the body background moves (700ms ease-in-out, set in
 * globals.css). Tracking uses IntersectionObserver with a band around the
 * middle of the viewport, so the shift happens as a section crosses centre —
 * matching the template, where a dark heading is already white while the
 * light ground is still fading out beneath it.
 */
const BG = { light: "#F8F9FA", dark: "#11132B" } as const;
export type PageBg = keyof typeof BG;

export function ScrollColorWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-bg]"));
    if (!sections.length) return;

    const apply = (el: HTMLElement) => {
      const key = (el.dataset.bg as PageBg) ?? "light";
      root.style.setProperty("--page-bg", BG[key]);
      root.style.setProperty("--page-fg", key === "dark" ? "#ffffff" : "#11132B");
      root.dataset.pageBg = key;
    };

    // the section whose top edge is highest within the middle band wins
    const visible = new Map<HTMLElement, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target as HTMLElement, e.boundingClientRect.top);
          else visible.delete(e.target as HTMLElement);
        }
        if (!visible.size) return;
        const [el] = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
        apply(el);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    apply(sections[0]);
    return () => obs.disconnect();
  }, []);

  return <>{children}</>;
}
