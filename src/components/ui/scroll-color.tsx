"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Drives the page background from the section in view.
 *
 * Sections declare `data-bg="light" | "dark"` and keep their own text
 * colours; only the body background moves (700ms ease-in-out, set in
 * globals.css). Tracking uses IntersectionObserver with a band around the
 * top of the viewport (just under the header), so the ground has changed by
 * the time a section's first line of copy scrolls into view; the fade itself
 * is short (globals.css) so white copy never sits on the light ground.
 */
const BG = { light: "#F8F9FA", dark: "#0B1F3A" } as const; // brand navy from the logo
export type PageBg = keyof typeof BG;

export function ScrollColorWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-bg]"));
    if (!sections.length) return;

    const apply = (el: HTMLElement) => {
      const key = (el.dataset.bg as PageBg) ?? "light";
      root.style.setProperty("--page-bg", BG[key]);
      root.style.setProperty("--page-fg", key === "dark" ? "#ffffff" : "#0B1F3A");
      root.dataset.pageBg = key;
    };

    // the section whose top edge is highest within the band wins; the band sits
    // just under the sticky header, so a section owns the ground as soon as it
    // reaches the top of the screen — its copy (which starts below its own
    // padding) is never shown on the previous section's colour
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
      { rootMargin: "-8% 0px -88% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    apply(sections[0]);
    // (the footer is too short to reach the band — it paints its own light ground)
    return () => {
      obs.disconnect();
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
