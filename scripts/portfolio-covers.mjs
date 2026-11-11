// Renders the portfolio artwork into public/assets/work/<slug>/:
//   logo-card.webp           landscape carousel card / case-study cover
//   logo-card-portrait.webp  the same for the portrait cards on phones
// Only the client's logo is shown (we do not publish the sites themselves):
// the logo centred on the brand's own ground with a quiet motif taken from
// the brand. Logos: public/assets/work/<slug>/logo-light|logo-dark.
//   node scripts/portfolio-covers.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/assets/work");
const data = (p) => `data:${p.endsWith(".svg") ? "image/svg+xml" : "image/png"};base64,${readFileSync(p).toString("base64")}`;

const WORK = [
  {
    slug: "kandar",
    logo: "logo-dark.svg",
    width: [520, 300],
    ground: "linear-gradient(150deg, #f1ebe4 0%, #ddd2c5 100%)",
    // interior panels: tall, thin rules like cabinet fronts
    motif: "repeating-linear-gradient(90deg, rgba(43,38,32,.07) 0 1px, transparent 1px 96px)",
  },
  {
    slug: "beic",
    logo: "logo-light.png",
    width: [470, 280],
    ground: "radial-gradient(120% 120% at 15% 10%, #58a531 0%, transparent 55%), linear-gradient(140deg, #3f8a26 0%, #22408c 100%)",
    // the contour lines of beic.az
    motif: "repeating-radial-gradient(circle at 78% 30%, rgba(255,255,255,.09) 0 1px, transparent 1px 34px)",
  },
  {
    slug: "bormark",
    logo: "logo-light.svg",
    width: [500, 300],
    ground: "radial-gradient(90% 90% at 85% 100%, #3a4d76 0%, transparent 60%), linear-gradient(150deg, #1b2846 0%, #2a3b5f 100%)",
    motif: "",
    // the symbol, very large and faint, rising from the lower right
    mark: `<svg viewBox="20 120 220 110" style="position:absolute;right:-8%;bottom:-6%;width:62%;opacity:.07"><path fill="#fff" d="M25.55 207.58 L44.56 174.65 A11.47 11.47 0 0 1 51.53 169.31 L178.84 135.21 A11.47 11.47 0 0 1 191.73 140.54 L230.45 207.58 A11.47 11.47 0 0 1 220.52 224.78 L35.48 224.78 A11.47 11.47 0 0 1 25.55 207.58 Z"/></svg>`,
  },
];

function page(w, portrait) {
  const [W, H] = portrait ? [600, 678] : [1200, 713];
  return `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; background: ${w.ground}; display: grid; place-items: center; }
  .motif { position: absolute; inset: 0; background: ${w.motif || "none"}; }
  .grain { position: absolute; inset: 0; opacity: .06; background-image: radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px); background-size: 3px 3px; mix-blend-mode: overlay; }
  img { position: relative; width: ${w.width[portrait ? 1 : 0]}px; height: auto; }
  </style></head><body><div class="motif"></div>${w.mark ?? ""}<div class="grain"></div><img src="${data(path.join(OUT, w.slug, w.logo))}"></body></html>`;
}

const browser = await chromium.launch();
for (const w of WORK) {
  for (const portrait of [false, true]) {
    const p = await browser.newPage({ viewport: portrait ? { width: 600, height: 678 } : { width: 1200, height: 713 }, deviceScaleFactor: 2 });
    await p.setContent(page(w, portrait), { waitUntil: "load" });
    const png = await p.screenshot({ type: "png" });
    await sharp(png).webp({ quality: 86 }).toFile(path.join(OUT, w.slug, portrait ? "logo-card-portrait.webp" : "logo-card.webp"));
    await p.close();
  }
  console.log("rendered", w.slug);
}
await browser.close();
