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
 * motion, is on a small screen, or has already seen it in this browser
 * session — a 4-second intro on every navigation would be a cost, not a
 * welcome. The "hidden" state of the copy is expressed in CSS
 * ([data-phase] + .hero-line, globals.css) and only applies from md up, so on
 * phones the headline is painted with the first HTML — that is the LCP.
 */
type Phase = "intro" | "move" | "final";

const LOGO = "/assets/anim/nobug-logo-animated-light.svg";
// same wordmark, no SMIL: the animated file keeps drawing for ~3.4 s, which is what the LCP would wait for on phones
const LOGO_STATIC = "/assets/logo-navy-amber.svg";
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
  image,
  children,
}: {
  eyebrow: string;
  h1: string;
  text: string;
  cta: string;
  ctaHref: string;
  secondary?: string;
  secondaryHref?: string;
  /** uploaded banner image (admin panel) — replaces the animated wordmark and its intro */
  image?: string | null;
  children?: ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [transform, setTransform] = useState<string | null>(null);
  // the static wordmark is in the HTML; the intro swaps in a cache-busted copy so its animation restarts
  const [src, setSrc] = useState<string>(image ?? LOGO_STATIC);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}

    if (reduce || small || seen || image) {
      // next frame: keeps the effect free of synchronous state updates
      const raf = requestAnimationFrame(() => {
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
  }, [image]);

  const logoStyle: CSSProperties =
    phase === "intro" && transform
      ? { transform, transformOrigin: "center", transition: "none" }
      : {
          transform: "none",
          transformOrigin: "center",
          transition: `transform ${MOVE_DURATION}ms var(--ease-brand)`,
        };

  // copy lines: the stagger delay per line; visibility lives in CSS (.hero-line)
  const line = (i: number) => ({ "--d": `${i * 90}ms` }) as CSSProperties;

  return (
    <>
      <div
        ref={gridRef}
        data-phase={phase}
        data-logo={transform || phase !== "intro" ? "ready" : undefined}
        className="grid grid-cols-12 items-start gap-x-4 gap-y-[clamp(32px,5vw,72px)] md:gap-x-6"
      >
        <div
          className="col-span-12 min-w-0 max-w-[760px] md:col-span-7"
          aria-busy={phase !== "final"}
        >
          <div className="hero-line mono-label text-grey" style={line(0)}>
            {eyebrow}
          </div>
          <h1 className="hero-line mt-6 text-balance text-[clamp(34px,5.4vw,76px)] font-medium leading-[1.02] tracking-[-0.035em] text-ink" style={line(1)}>
            {h1}
          </h1>
          <p className="hero-line mt-6 max-w-[56ch] text-[clamp(16px,1.43vw,21px)] leading-[1.5] text-grey" style={line(2)}>
            {text}
          </p>
          <div className="hero-line mt-8 flex flex-wrap gap-3" style={line(3)}>
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
          data-logo-slot
          className="order-first col-span-12 w-full md:order-none md:col-span-5 md:self-center md:justify-self-end lg:max-w-[520px]"
          aria-hidden="true"
        >
          <div
            className="hero-logo relative z-10 will-change-transform"
            style={logoStyle}
          >
            <div
              // no rules around the wordmark; 70% of the column, centred —
              // an uploaded banner image takes the whole column as a tile
              className={image ? "w-full overflow-hidden rounded-[24px]" : "mx-auto w-[70%] py-[clamp(12px,2vw,24px)]"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG must not go through the image optimizer */}
              <img
                src={src}
                alt=""
                width={960}
                height={image ? 720 : 290}
                fetchPriority="high"
                decoding="async"
                className={image ? "block h-auto w-full object-cover" : "block h-auto w-full"}
              />
            </div>
          </div>
        </div>
      </div>
      {/* rule + figures below the hero: held back until the copy has entered (CSS, desktop only) */}
      <div className="hero-after" data-phase={phase}>
        {children}
      </div>
    </>
  );
}
