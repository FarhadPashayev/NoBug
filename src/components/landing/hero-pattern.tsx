"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Geometric side overlay for the hero (fortemplate/Screenshot …20.47.05):
 * a repeating pinwheel tile — four chamfered blades around a square void —
 * in brand navy at low opacity with an amber cluster fading in from the
 * top-right corner. Two masks are intersected: a corner falloff, and an
 * elliptical EXCLUSION ZONE measured around the wordmark slot so the pattern
 * never renders behind the logo. Fades in after the intro choreography.
 */
const BLADES = [
  "20,8 60,8 60,34 8,34 8,20", // top — chamfer top-left
  "66,8 80,8 92,20 92,60 66,60", // right — chamfer top-right
  "40,66 92,66 92,80 80,92 40,92", // bottom — chamfer bottom-right
  "8,40 34,40 34,92 20,92 8,80", // left — chamfer bottom-left
];
const NAVY = "#0B1F3A";
const AMBER = "#EFA83C";

export function HeroPattern() {
  const ref = useRef<HTMLDivElement>(null);
  const [hole, setHole] = useState<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const slot = document.querySelector<HTMLElement>("[data-logo-slot]");
    if (!el || !slot) return;

    // exclusion zone = logo slot box + generous padding, in the overlay's coordinates
    const measure = () => {
      const a = el.getBoundingClientRect();
      const b = slot.getBoundingClientRect();
      setHole({ x: b.left + b.width / 2 - a.left, y: b.top + b.height / 2 - a.top, rx: b.width * 0.62, ry: b.height * 0.9 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(slot);
    window.addEventListener("resize", measure);

    // appear after the intro (same session flag as hero-intro.tsx)
    let seen = false;
    try {
      seen = sessionStorage.getItem("nobug.hero-intro") === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setShown(true), seen || reduce ? 0 : 4300);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const masks = [
    "radial-gradient(ellipse at 100% 0%, black 28%, transparent 72%)",
    hole ? `radial-gradient(ellipse ${hole.rx}px ${hole.ry}px at ${hole.x}px ${hole.y}px, transparent 0 62%, black 100%)` : "linear-gradient(black, black)",
    // phones: the logo sits above the copy — keep the pattern to that top band only
    narrow && hole ? `linear-gradient(to bottom, black ${hole.y + hole.ry * 0.7}px, transparent ${hole.y + hole.ry * 0.7 + 90}px)` : "linear-gradient(black, black)",
  ].join(", ");

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[70%] transition-opacity duration-700 ease-in-out md:w-[52%]"
      style={{
        opacity: shown ? 1 : 0,
        maskImage: masks,
        WebkitMaskImage: masks,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <svg className="h-full w-full" preserveAspectRatio="xMaxYMin slice">
        <defs>
          <pattern id="nb-pinwheel" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
            {BLADES.map((pts) => (
              <polygon key={pts} points={pts} fill={NAVY} />
            ))}
          </pattern>
          <pattern id="nb-pinwheel-amber" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
            {BLADES.map((pts) => (
              <polygon key={pts} points={pts} fill={AMBER} />
            ))}
          </pattern>
          {/* amber cluster: strongest at the corner, gone toward the centre */}
          <radialGradient id="nb-amber-cluster" cx="96%" cy="4%" r="52%">
            <stop offset="0%" stopColor={AMBER} stopOpacity="0.42" />
            <stop offset="55%" stopColor={AMBER} stopOpacity="0.08" />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </radialGradient>
          <mask id="nb-cluster-mask">
            <rect width="100%" height="100%" fill="url(#nb-amber-cluster)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#nb-pinwheel)" style={{ opacity: 0.09 }} />
        <rect width="100%" height="100%" fill="url(#nb-pinwheel-amber)" mask="url(#nb-cluster-mask)" />
      </svg>
    </div>
  );
}
