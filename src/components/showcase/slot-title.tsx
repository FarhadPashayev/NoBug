"use client";

import { useEffect, useState } from "react";

/**
 * Title that rolls letter by letter like a slot-machine reel when it changes.
 * The outgoing word leaves in the direction of travel while the new one
 * arrives from the other side (CSS keyframes `slot-in` / `slot-out`).
 */
export function SlotTitle({ text, direction, className = "" }: { text: string; direction: 1 | -1; className?: string }) {
  const [shown, setShown] = useState({ current: text, prev: null as string | null, key: 0, dir: direction });
  // a new title: derived during render (React's "adjust state on prop change" pattern)
  if (text !== shown.current) setShown({ current: text, prev: shown.current, key: shown.key + 1, dir: direction });

  // the outgoing word is dropped once its animation is over
  useEffect(() => {
    if (!shown.prev) return;
    const id = window.setTimeout(() => setShown((s) => (s.key === shown.key ? { ...s, prev: null } : s)), 900);
    return () => window.clearTimeout(id);
  }, [shown.key, shown.prev]);

  return (
    <span className={`relative inline-grid overflow-hidden ${className}`} style={{ "--slot-dir": shown.dir } as React.CSSProperties}>
      {shown.prev && <Word key={`p${shown.key}`} text={shown.prev} mode="out" />}
      <Word key={`c${shown.key}`} text={shown.current} mode={shown.key === 0 ? "still" : "in"} />
    </span>
  );
}

function Word({ text, mode }: { text: string; mode: "in" | "out" | "still" }) {
  return (
    <span className="col-start-1 row-start-1 whitespace-nowrap" aria-hidden={mode === "out" || undefined}>
      {Array.from(text).map((ch, i) => (
        <span key={i} className={`inline-block ${mode === "still" ? "" : mode === "in" ? "slot-in" : "slot-out"}`} style={{ animationDelay: `${i * 16}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
