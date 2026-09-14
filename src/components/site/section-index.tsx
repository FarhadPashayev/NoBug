"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";

/**
 * Vertical section index, fixed in the left margin. Active entry tracked with
 * IntersectionObserver (not scroll maths). Hidden below 1280px and while the
 * hero (#top) is in view. A 2px accent bar slides between entries (200ms,
 * brand ease); with prefers-reduced-motion the change is instant.
 */
export function SectionIndex({ lang, entries }: { lang: Locale; entries: [string, string][] }) {
  const [active, setActive] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const listRef = useRef<HTMLOListElement>(null);
  const [barTop, setBarTop] = useState<number | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  // hero in view → hide the index
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const obs = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // active section: the one crossing a band around 35–45% of the viewport
  useEffect(() => {
    const targets = entries.map(([href]) => document.getElementById(href.slice(1))).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        if (visible.size) {
          // the intersecting section closest to the top of the band wins
          const [id] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          setActive(id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [entries]);

  // position the sliding bar on the active entry
  useEffect(() => {
    const list = listRef.current;
    if (!list || !active) return;
    const el = list.querySelector<HTMLElement>(`[data-anchor="#${active}"]`);
    if (!el) return;
    setBarTop(el.offsetTop);
    setBarHeight(el.offsetHeight);
  }, [active]);

  return (
    <nav
      aria-label="Sections"
      className={`fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-200 ease-[var(--ease-brand)] xl:block ${heroVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <ol ref={listRef} className="relative m-0 list-none p-0">
        {barTop !== null && (
          <span
            aria-hidden="true"
            className="absolute left-0 w-0.5 bg-accent transition-[top,height] duration-200 ease-[var(--ease-brand)] motion-reduce:transition-none"
            style={{ top: barTop, height: barHeight }}
          />
        )}
        {entries.map(([href, label], i) => {
          const on = active === href.slice(1);
          return (
            <li key={href} data-anchor={href}>
              <a
                href={`/${lang}${href}`}
                aria-current={on ? "true" : undefined}
                title={label}
                className={`mono-label flex items-baseline gap-2 py-1.5 pl-4 transition-colors duration-200 ease-[var(--ease-brand)] hover:text-navy ${on ? "text-navy" : "text-muted"}`}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {/* label only where the margin is wide enough not to collide with the grid */}
                <span className="hidden min-[1680px]:inline">{label}</span>
                <span className="sr-only min-[1680px]:hidden">{label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
