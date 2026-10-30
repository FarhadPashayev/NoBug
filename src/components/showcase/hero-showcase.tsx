"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { ShowcaseCopy } from "@/lib/i18n/showcase";
import { carouselLayout, createCarouselState } from "@/components/webgl/layout";
import { scrollToHash, scrollToY } from "@/components/ui/smooth-scroll";
import { ArcProgress } from "./arc-progress";
import { Preloader } from "./preloader";
import { SlotTitle } from "./slot-title";
import { hasWebGL, useClientValue, useMediaQuery } from "@/lib/use-client";

// three.js + R3F only load where WebGL will actually run
const ShowcaseCanvas = dynamic(() => import("@/components/webgl/showcase-canvas"), { ssr: false });

export type ShowcaseCardData = {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string | null;
  pattern: number;
  photo: string;
  alt: string;
};

type Copy = Pick<ShowcaseCopy, "headline" | "subline" | "cta" | "scrollHint" | "carouselLabel" | "carouselHelp" | "open" | "prev" | "next" | "loading">;
type Mode = "pending" | "webgl" | "html";

const STORAGE_KEY = "nobug:showcase-index";
// scroll distance per card while the hero is pinned
const STEP_SVH = 42;

let detected: Mode | null = null;
/** Can this device run the WebGL hero well? (cached — read during render) */
function detectMode(): Mode {
  if (detected) return detected;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
  detected = !lowEnd && hasWebGL() ? "webgl" : "html";
  return detected;
}

export function HeroShowcase({ cards, t }: { cards: ShowcaseCardData[]; t: Copy }) {
  const router = useRouter();
  const n = cards.length;
  const detectedMode = useClientValue<Mode>(detectMode, "pending");
  const [failed, setFailed] = useState(false); // the GPU dropped the context: switch to HTML
  const mode: Mode = failed ? "html" : detectedMode;
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mobile = useMediaQuery("(max-width: 767px)");
  const [canvasReady, setCanvasReady] = useState(false);
  // three.js parses and compiles its shaders off the hydration path
  const [mountCanvas, setMountCanvas] = useState(false);
  useEffect(() => {
    if (mode !== "webgl") return;
    const go = () => setMountCanvas(true);
    const id = window.requestIdleCallback?.(go, { timeout: 900 }) ?? window.setTimeout(go, 200);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, [mode]);
  const ready = canvasReady || mode === "html";
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hoverCard, setHoverCard] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const state = useRef(createCarouselState());
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const drag = useRef<{ x: number; y: number; start: number; last: number; t: number; v: number; axis: "x" | "y" | null } | null>(null);
  const opening = useRef(false);
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);

  const pinned = mode === "webgl";

  const setIndex = useCallback(
    (i: number) => {
      if (i === activeRef.current) return;
      setDir(i > activeRef.current ? 1 : -1);
      activeRef.current = i;
      setActive(i);
    },
    [],
  );

  /** Scroll offset (px from the top of the document) that shows card i. */
  const yForIndex = useCallback(
    (i: number) => {
      const el = section.current;
      if (!el || n < 2) return 0;
      const top = el.getBoundingClientRect().top + window.scrollY;
      return top + (i / (n - 1)) * (el.offsetHeight - window.innerHeight);
    },
    [n],
  );

  const goTo = useCallback(
    (i: number, immediate = false) => {
      const idx = Math.max(0, Math.min(n - 1, i));
      if (pinned) scrollToY(yForIndex(idx), { immediate, duration: 0.9 });
      else {
        const track = stage.current?.querySelector<HTMLElement>("[data-track]");
        const card = track?.children[idx] as HTMLElement | undefined;
        if (track && card) track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: immediate || reduced ? "auto" : "smooth" });
        setIndex(idx);
      }
    },
    [n, pinned, reduced, setIndex, yForIndex],
  );

  // pinned hero: page scroll drives the carousel, then releases into the sections
  useEffect(() => {
    if (!pinned) return;
    let idle = 0;
    const onScroll = () => {
      const el = section.current;
      if (!el || opening.current) return;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      if (!drag.current) state.current.target = p * (n - 1);
      setIndex(Math.round(p * (n - 1)));
      setPaused(r.bottom < 0);
      // settle on the nearest card when scrolling stops inside the pin
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        const t = state.current.target;
        const near = Math.round(t);
        if (r.top < 0 && r.bottom > window.innerHeight && Math.abs(t - near) > 0.02) scrollToY(yForIndex(near), { duration: 0.6 });
      }, 160);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(idle);
    };
  }, [pinned, n, setIndex, yForIndex]);

  // coming back from a case study: land on the card that was opened
  useEffect(() => {
    if (mode === "pending") return;
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    sessionStorage.removeItem(STORAGE_KEY);
    if (Number.isInteger(saved) && saved > 0 && saved < n) {
      state.current.target = state.current.current = saved;
      requestAnimationFrame(() => goTo(saved, true));
    }
  }, [mode, n, goTo]);

  // back/forward may restore this screen as it was left: undo the opening transition
  useEffect(() => {
    const reset = () => {
      opening.current = false;
      setLeaving(false);
      gsapRef.current?.killTweensOf(state.current);
      state.current.expand = 0;
      state.current.expandIndex = -1;
    };
    reset();
    const onShow = (e: PageTransitionEvent) => e.persisted && reset();
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      reset();
    };
  }, []);

  // prefetch the case study of the card in front
  useEffect(() => {
    if (cards[active]) router.prefetch(cards[active].href);
  }, [active, cards, router]);

  const open = useCallback(
    (i: number) => {
      const card = cards[i];
      if (!card || opening.current) return;
      opening.current = true;
      sessionStorage.setItem(STORAGE_KEY, String(i));
      setLeaving(true);
      if (pinned && !reduced) {
        const s = state.current;
        s.target = i;
        s.expandIndex = i;
        // GSAP only loads for this tween
        import("gsap").then(({ gsap }) => {
          gsapRef.current = gsap;
          gsap.to(s, { expand: 1, duration: 0.95, ease: "expo.inOut", onComplete: () => router.push(card.href) });
        });
      } else window.setTimeout(() => router.push(card.href), 260);
    },
    [cards, pinned, reduced, router],
  );

  const onCardClick = useCallback((i: number) => (i === activeRef.current ? open(i) : goTo(i)), [goTo, open]);

  // drag / swipe (pointer events cover mouse, pen and touch)
  const onPointerDown = (e: React.PointerEvent) => {
    if (!pinned || e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, start: state.current.target, last: e.clientX, t: performance.now(), v: 0, axis: e.pointerType === "mouse" ? "x" : null };
    if (e.pointerType === "mouse") setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // touch: decide once whether this gesture is a horizontal swipe or a page scroll
    if (!d.axis && Math.hypot(dx, dy) > 8) d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (d.axis !== "x") return;
    const { spacing } = carouselLayout(window.innerWidth, window.innerHeight);
    const now = performance.now();
    d.v = ((e.clientX - d.last) / Math.max(now - d.t, 1)) * 1000; // px/s
    d.last = e.clientX;
    d.t = now;
    state.current.target = Math.max(-0.35, Math.min(n - 0.65, d.start - dx / spacing));
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || d.axis !== "x") return;
    const { spacing } = carouselLayout(window.innerWidth, window.innerHeight);
    // a flick carries on: project the release velocity a little further
    const projected = state.current.target - (d.v / spacing) * 0.18;
    goTo(Math.round(projected));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (step) {
      e.preventDefault();
      goTo(activeRef.current + step);
    } else if (e.key === "Enter") {
      e.preventDefault();
      open(activeRef.current);
    }
  };

  // HTML carousel: follow the native horizontal scroll
  const onTrackScroll = (e: React.UIEvent<HTMLElement>) => {
    const track = e.currentTarget;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setIndex(best);
  };

  const read = useCallback(() => (pinned ? state.current.current : activeRef.current), [pinned]);
  const canvasCards = useMemo(() => cards.map((c) => ({ slug: c.slug, pattern: c.pattern, imageUrl: c.imageUrl })), [cards]);
  const current = cards[active];

  return (
    <section
      ref={section}
      id="top"
      aria-roledescription="carousel"
      aria-label={t.carouselLabel}
      className="relative bg-ink-950 text-paper"
      style={{ height: pinned ? `calc(100svh + ${(n - 1) * STEP_SVH}svh)` : undefined }}
    >
      <div
        ref={stage}
        className={`sticky top-0 h-[100svh] min-h-[520px] overflow-hidden focus-visible:outline-offset-[-6px] ${pinned ? (dragging ? "cursor-grabbing" : hoverCard ? "cursor-pointer" : "cursor-grab") : ""}`}
        style={{ touchAction: "pan-y" }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        aria-describedby="showcase-help"
      >
        {mode !== "html" && <Preloader ready={ready} label={t.loading} />}

        <p id="showcase-help" className="sr-only">
          {t.carouselHelp}
        </p>

        {mode === "webgl" && mountCanvas && (
          <div className="absolute inset-0">
            <ShowcaseCanvas
              cards={canvasCards}
              state={state}
              reduced={reduced}
              paused={paused}
              mobile={mobile}
              onReady={() => setCanvasReady(true)}
              onFail={() => setFailed(true)}
              onCardClick={onCardClick}
              onHover={setHoverCard}
            />
          </div>
        )}

        {mode === "html" && (
          <ol
            data-track
            onScroll={onTrackScroll}
            className="no-scrollbar absolute inset-x-0 top-1/2 flex -translate-y-[44%] snap-x snap-mandatory gap-4 overflow-x-auto px-[16vw] sm:gap-6 sm:px-[33vw]"
          >
            {cards.map((c, i) => (
              <li key={c.slug} className="w-[68vw] max-w-[640px] flex-none snap-center sm:w-[34vw]">
                <Link
                  href={c.href}
                  onClick={(e) => {
                    if (i === active) return sessionStorage.setItem(STORAGE_KEY, String(i));
                    e.preventDefault();
                    goTo(i);
                  }}
                  className={`relative block aspect-[1/1.3] overflow-hidden rounded-[10px] bg-ink-900 transition-[opacity,transform] duration-500 sm:aspect-[1/0.72] ${i === active ? "opacity-100" : "scale-[0.92] opacity-45"}`}
                  tabIndex={-1}
                >
                  <Image src={c.imageUrl ?? c.photo} alt={c.alt} fill sizes="(min-width: 640px) 34vw, 68vw" className="object-cover" priority={i < 2} />
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* headline: the reference has none — a company site needs one */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-gutter pt-[calc(env(safe-area-inset-top)+84px)] sm:pt-[104px]">
          <h1 className="max-w-[22ch] text-[clamp(26px,3.3vw,50px)] font-medium leading-[1.06] tracking-[-0.03em] text-balance">{t.headline}</h1>
          <p className="mt-3 hidden max-w-[44ch] text-[15px] leading-[1.5] text-paper/60 sm:block">{t.subline}</p>
          <a
            href="#elaqe"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("elaqe");
            }}
            className="pointer-events-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-yellow px-5 text-[15px] font-medium text-ink-950 transition-colors hover:bg-yellow-600 sm:mt-6"
          >
            {t.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        {/* bottom centre: progress arc + rolling title of the card in front */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-gutter pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] sm:pb-10">
          <ArcProgress count={n} read={read} />
          {current && (
            <Link
              href={current.href}
              onClick={(e) => {
                e.preventDefault();
                open(active);
              }}
              className="group flex min-h-11 items-center gap-2 text-[clamp(17px,1.6vw,22px)] font-medium tracking-[-0.01em]"
              aria-label={`${t.open}: ${current.title}`}
            >
              <SlotTitle text={current.title} direction={dir} />
              <ArrowRight size={16} aria-hidden="true" className="opacity-50 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <div className="sr-only" aria-live="polite">
            {current ? `${active + 1} / ${n}: ${current.title}` : ""}
          </div>
        </div>

        {/* prev / next for pointer users who don't drag */}
        <div className="absolute bottom-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] right-gutter z-10 hidden gap-2 sm:bottom-10 md:flex">
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t.prev} className="round-btn">
            <ArrowRight size={16} className="rotate-180" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === n - 1} aria-label={t.next} className="round-btn">
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <a
          href="#xidmetler"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash("xidmetler");
          }}
          className="absolute bottom-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] left-gutter z-10 hidden min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/55 transition-colors hover:text-paper sm:bottom-10 md:flex"
        >
          <ArrowDown size={14} aria-hidden="true" className="scroll-hint" />
          {t.scrollHint}
        </a>

        {/* the case study's light ground washes in over the expanding card */}
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-20 bg-paper transition-opacity ${leaving ? "opacity-100 delay-[650ms] duration-300" : "opacity-0 duration-0"} ${reduced || !pinned ? "!delay-0" : ""}`} />
      </div>

      {/* every card as real HTML — indexable, and readable by screen readers */}
      <ol className="sr-only">
        {cards.map((c) => (
          <li key={c.slug}>
            <a href={c.href} tabIndex={-1}>
              {c.title}
            </a>
            <p>{c.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
