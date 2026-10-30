"use client";

import { useEffect, useRef } from "react";

const W = 132;
const H = 26;
// shallow arc: quadratic Bézier from bottom-left over the top to bottom-right
const P0 = { x: 6, y: H - 4 };
const P1 = { x: W / 2, y: -6 };
const P2 = { x: W - 6, y: H - 4 };
const at = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});

/**
 * Arc-shaped carousel progress: one tick per card, a marker that glides
 * along the arc with the live (eased) position read every frame.
 */
export function ArcProgress({ count, read }: { count: number; read: () => number }) {
  const marker = useRef<SVGCircleElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const path = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const t = count > 1 ? Math.min(Math.max(read() / (count - 1), 0), 1) : 0;
      if (Math.abs(t - last) > 0.0005) {
        last = t;
        const p = at(t);
        marker.current?.setAttribute("cx", p.x.toFixed(2));
        marker.current?.setAttribute("cy", p.y.toFixed(2));
        // pathLength=1 → the dash covers the travelled share of the arc
        trail.current?.setAttribute("stroke-dasharray", `${t} 1`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [count, read]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true" className="overflow-visible">
      <path d={path} stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <path ref={trail} d={path} pathLength={1} stroke="var(--color-yellow)" strokeWidth="1" strokeDasharray="0 1" />
      {Array.from({ length: count }, (_, i) => {
        const p = at(count > 1 ? i / (count - 1) : 0.5);
        return <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="currentColor" fillOpacity="0.5" />;
      })}
      <circle ref={marker} cx={P0.x} cy={P0.y} r="3.5" fill="var(--color-yellow)" />
    </svg>
  );
}
