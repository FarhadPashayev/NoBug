"use client";

import { useEffect, useRef } from "react";

const W = 108;
const H = 22;
const LIFT = 26; // how far the control point rises when fully bent
const BASE = H - 3;

// quadratic Bézier from bottom-left over the top to bottom-right; `b` 0 = flat line, 1 = arc
const pathFor = (b: number) => `M3 ${BASE} Q${W / 2} ${(BASE - LIFT * b).toFixed(2)} ${W - 3} ${BASE}`;

/**
 * Carousel progress. While loading it is a flat line that fills with the
 * load progress (0..100); once the cards are in it bends into an arc whose
 * lit part follows the live carousel position.
 */
export function ArcProgress({ count, read, loading, bent }: { count: number; read: () => number; loading: number; bent: boolean }) {
  const base = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const live = useRef({ loading, bent });
  useEffect(() => {
    live.current = { loading, bent };
  }, [loading, bent]);

  useEffect(() => {
    let raf = 0;
    let b = live.current.bent ? 1 : 0;
    let fill = 0;
    const loop = () => {
      const { loading: l, bent: target } = live.current;
      b += ((target ? 1 : 0) - b) * 0.08;
      if (Math.abs((target ? 1 : 0) - b) < 0.001) b = target ? 1 : 0;
      const d = pathFor(b);
      base.current?.setAttribute("d", d);
      trail.current?.setAttribute("d", d);
      // before the bend the trail shows the load, after it the carousel position
      const pos = count > 1 ? Math.min(Math.max(read() / (count - 1), 0), 1) : 0;
      fill += ((target ? pos : l / 100) - fill) * 0.2;
      trail.current?.setAttribute("stroke-dasharray", `${fill.toFixed(4)} 1`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [count, read]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true" className="overflow-visible">
      <path ref={base} d={pathFor(0)} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
      <path ref={trail} d={pathFor(0)} pathLength={1} stroke="currentColor" strokeWidth="1" strokeDasharray="0 1" />

    </svg>
  );
}
