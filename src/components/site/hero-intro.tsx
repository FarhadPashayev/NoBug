"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Hero choreography:
 *   1. intro  — the animated wordmark sits large and centred over the hero
 *               while its own SVG animation plays (~3.3s); the copy is hidden.
 *   2. move   — the wordmark glides (FLIP transform) into its final slot on
 *               the right, 700ms, brand ease.
 *   3. final  — the copy enters line by line, each from the top-right
 *               (translate(24px,-16px) → 0), staggered 90ms.
 *
 * Skipped entirely (final state at once) when the visitor prefers reduced
 * motion, or has already seen it in this browser session — a 4-second intro
 * on every navigation would be a cost, not a welcome.
 */
type Phase = "intro" | "move" | "final";

const LOGO = "/assets/anim/nobug-logo-animated-light.svg";
const SEEN_KEY = "nobug.hero-intro";
const SVG_DURATION = 3400; // the SVG's own animation ends at ~3.3s
const MOVE_DURATION = 700;

export function HeroIntro({
  eyebrow,
  h1,
  text,
  cta,
  ctaHref,
  secondary,
  secondaryHref,
  children,
}: {
  eyebrow: string;
  h1: string;
  text: string;
  cta: string;
  ctaHref: string;
  secondary?: string;
  secondaryHref?: string;
  children?: ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [transform, setTransform] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}

    if (reduce || seen) {
      // next frame: keeps the effect free of synchronous state updates
      const raf = requestAnimationFrame(() => {
        setSrc(LOGO);
        setPhase("final");
      });
      return () => cancelAnimationFrame(raf);
    }

    // FLIP: measure the final slot, compute the transform that centres and
    // enlarges it over the hero grid, then start the SVG from frame 0.
    const grid = gridRef.current;
    const slot = slotRef.current;
    if (!grid || !slot) return;
    const g = grid.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    const targetW = Math.min(g.width * 0.82, 760);
    // the wordmark occupies 70% of the slot — scale against that, not the slot
    const scale = Math.max(1, targetW / (s.width * 0.7));
    const dx = g.left + g.width / 2 - (s.left + s.width / 2);
    const dy = g.top + g.height / 2 - (s.top + s.height / 2);
    const raf = requestAnimationFrame(() => {
      setTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
      setSrc(`${LOGO}?t=${Date.now()}`);
    });

    const t1 = window.setTimeout(() => setPhase("move"), SVG_DURATION);
    const t2 = window.setTimeout(
      () => {
        setPhase("final");
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      },
      SVG_DURATION + MOVE_DURATION - 150,
    );
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const logoStyle: CSSProperties =
    phase === "intro" && transform
      ? { transform, transformOrigin: "center", transition: "none" }
      : {
          transform: "none",
          transformOrigin: "center",
          transition: `transform ${MOVE_DURATION}ms var(--ease-brand)`,
        };

  // copy lines: hidden until "final", then staggered entrance from the top-right
  const line = (i: number): CSSProperties =>
    phase === "final"
      ? {
          opacity: 1,
          transform: "none",
          transition: `opacity 420ms var(--ease-brand) ${i * 90}ms, transform 420ms var(--ease-brand) ${i * 90}ms`,
        }
      : { opacity: 0, transform: "translate(24px, -16px)" };

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-12 items-start gap-x-6 gap-y-[clamp(32px,5vw,72px)]"
      >
        <div
          className="col-span-12 min-w-0 max-w-[760px] md:col-span-7"
          aria-busy={phase !== "final"}
        >
          <div className="mono-label text-grey" style={line(0)}>
            {eyebrow}
          </div>
          <h1 className="mt-6 text-balance text-[clamp(38px,6vw,84px)] font-medium leading-[1.02] tracking-[-0.035em] text-ink" style={line(1)}>
            {h1}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[clamp(17px,1.5vw,22px)] leading-[1.5] text-grey" style={line(2)}>
            {text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3" style={line(3)}>
            <Link
              href={ctaHref}
              className="pill pill-yellow"
              tabIndex={phase === "final" ? undefined : -1}
            >
              {cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {secondary && secondaryHref && (
              <Link
                href={secondaryHref}
                className="pill pill-outline"
                tabIndex={phase === "final" ? undefined : -1}
              >
                {secondary}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Final slot for the wordmark; during the intro it is transformed over the
          grid centre. Decorative — the brand is already named in the header. */}
        <div
          ref={slotRef}
          className="col-span-12 w-full md:col-span-5 md:self-center md:justify-self-end lg:max-w-[520px]"
          aria-hidden="true"
        >
          <div
            className="relative z-10 will-change-transform"
            style={logoStyle}
          >
            <div
              // no rules around the wordmark; 70% of the column, centred
              className="mx-auto w-[70%] py-[clamp(12px,2vw,24px)]"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- animated SVG must not go through the image optimizer
                <img
                  src={src}
                  alt=""
                  width={960}
                  height={290}
                  className="block h-auto w-full"
                />
              ) : (
                <div style={{ aspectRatio: "960 / 290" }} />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* rule + figures below the hero: held back until the copy has entered */}
      <div
        style={
          phase === "final"
            ? {
                opacity: 1,
                transition: "opacity 500ms var(--ease-brand) 300ms",
              }
            : { opacity: 0 }
        }
      >
        {children}
      </div>
    </>
  );
}
