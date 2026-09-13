"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Kind = "fade" | "rule" | "clip";

/**
 * Reveal-once at a 20% threshold. State lives in React (not inline styles).
 * The observed node is always the wrapper — never the clipped element itself,
 * whose collapsed paint box would report isIntersecting:false forever. A
 * timed fallback guarantees nothing can stay invisible.
 */
export function Reveal({
  kind = "fade",
  delay = 0,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: {
  kind?: Kind;
  delay?: number;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(t);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: kind === "clip" ? 0.05 : 0.2 },
    );
    obs.observe(el);
    // fail-safe: anything within the viewport after 1.2s shows regardless;
    // clipped bands additionally get an unconditional 4s fallback.
    const t1 = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80 && r.bottom > -80) setShown(true);
    }, 1200);
    const t2 = kind === "clip" ? window.setTimeout(() => setShown(true), 4000) : 0;
    return () => {
      obs.disconnect();
      window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [kind, shown]);

  const cls = kind === "rule" ? "reveal-rule" : kind === "clip" ? "reveal-clip" : "reveal-fade";

  if (kind === "clip") {
    // wrapper is observed; the child carries the clip-path
    return (
      <Tag ref={ref} className={className} {...rest}>
        <div className={cls} data-shown={shown}>
          {children}
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`${cls} ${className}`}
      data-shown={shown}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
