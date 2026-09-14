import type { Dictionary } from "./i18n/dict";

// Figures in document order. Numbers are derived from this array's index, so
// adding or moving an image can never break the sequence. Image FILENAMES keep
// their original IMG-0x names — only captions are numbered.
export const FIGURE_ORDER = ["hero", "band", "services", "about", "tech", "careers"] as const;
export type FigureKey = (typeof FIGURE_ORDER)[number];

export function figureNumber(key: FigureKey): string {
  return String(FIGURE_ORDER.indexOf(key) + 1).padStart(2, "0");
}

/** "Şək. 04 — Bakı. nobug burada fəaliyyət göstərir" */
export function figureCaption(t: Dictionary, key: FigureKey): string {
  return `${t.figLabel} ${figureNumber(key)} — ${t.captions[key]}`;
}
