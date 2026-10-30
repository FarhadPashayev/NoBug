// Card geometry shared by the WebGL carousel and the DOM input layer (drag
// distance → cards). Sizes are in CSS pixels; the camera is placed so one
// world unit equals one pixel at z = 0.

export type CarouselLayout = { w: number; h: number; spacing: number; y: number; portrait: boolean };

export function carouselLayout(vw: number, vh: number): CarouselLayout {
  const portrait = vw < 768;
  if (portrait) {
    // phones: portrait cards, neighbours peek in from both sides
    let w = vw * 0.68;
    let h = w * 1.3;
    const maxH = vh * 0.5;
    if (h > maxH) {
      h = maxH;
      w = h / 1.3;
    }
    return { w, h, spacing: w + vw * 0.05, y: -vh * 0.06, portrait };
  }
  let w = Math.min(vw * 0.34, 640);
  let h = w * 0.72;
  const maxH = vh * 0.5;
  if (h > maxH) {
    h = maxH;
    w = h / 0.72;
  }
  // the row sits a little low: the headline lives above it
  return { w, h, spacing: w + Math.max(24, vw * 0.025), y: -vh * 0.06, portrait };
}

/** Shared, mutable carousel state — written by the input layer, read every frame by the canvas. */
export type CarouselState = {
  target: number; // card index the carousel is heading to (float)
  current: number; // eased position (float)
  velocity: number; // cards per second, eased
  expand: number; // 0..1 — the opened card grows to full screen
  expandIndex: number; // which card is opening (-1 = none)
};

export const createCarouselState = (): CarouselState => ({ target: 0, current: 0, velocity: 0, expand: 0, expandIndex: -1 });
