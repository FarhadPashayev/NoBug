// Card geometry shared by the WebGL carousel and the DOM input layer (drag
// distance → cards). Sizes are in CSS pixels; the camera is placed so one
// world unit equals one pixel at z = 0. Proportions follow the reference:
// desktop ≈ 55 % of the width at 1.68 : 1, phones ≈ 78 % slightly portrait,
// always centred vertically.

export type CarouselLayout = { w: number; h: number; spacing: number; y: number; portrait: boolean; bend: number; neighbour: number };

export function carouselLayout(vw: number, vh: number): CarouselLayout {
  const portrait = vw < 768;
  if (portrait) {
    let w = vw * 0.777;
    let h = w * 1.13;
    const maxH = vh * 0.46;
    if (h > maxH) {
      h = maxH;
      w = h / 1.13;
    }
    // edge-to-edge gap ≈ 36 px at 390 — measured between the active card and its scaled neighbour
    return { w, h, spacing: w / 2 + vw * 0.092 + (w * 0.86) / 2, y: 0, portrait, bend: 0.9 / vw, neighbour: 0.86 };
  }
  let w = vw * 0.547;
  let h = w / 1.684;
  const maxH = vh * 0.56;
  if (h > maxH) {
    h = maxH;
    w = h * 1.684;
  }
  // edge-to-edge gap ≈ 60 px at 1440
  return { w, h, spacing: w / 2 + vw * 0.042 + (w * 0.85) / 2, y: 0, portrait, bend: 0.65 / vw, neighbour: 0.85 };
}

/** Shared, mutable carousel state — written by the input layer, read every frame by the canvas. */
export type CarouselState = {
  target: number; // card index the carousel is heading to (float)
  current: number; // eased position (float)
  velocity: number; // cards per second, eased
  expand: number; // 0..1 — the opened card grows to full screen
  expandIndex: number; // which card is opening (-1 = none)
  introStart: number; // performance.now() when the cards start sweeping in (-1 = not yet, 0 = skip)
};

export const createCarouselState = (): CarouselState => ({ target: 0, current: 0, velocity: 0, expand: 0, expandIndex: -1, introStart: -1 });

/** 0 → 1 over the intro sweep (expo out); 1 when skipped. */
export function introProgress(introStart: number, now: number, duration = 1600) {
  if (introStart === 0) return 1;
  if (introStart < 0) return 0;
  const t = Math.min(Math.max((now - introStart) / duration, 0), 1);
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
