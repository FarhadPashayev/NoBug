// Renders the portfolio artwork into public/assets/work/<slug>/:
//   card.webp           landscape carousel card / case-study cover (browser + phone mockup)
//   card-portrait.webp  the same composition for the portrait cards on phones
//   d1.webp, d2.webp    desktop screens (framed on the page, not here)
//   m1..m3.webp         phone screens
// Source screenshots live in scripts/portfolio-src (captured from the live
// sites at 2×). Re-run after replacing them:  node scripts/portfolio-covers.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "scripts/portfolio-src");
const OUT = path.join(ROOT, "public/assets/work");
const FONT = path.join(ROOT, "src/app/_og/InterTight-Medium.ttf");

// brand grounds taken from each site
const WORK = [
  { slug: "kandar", name: "Kandar", domain: "kandar.az", from: "#efe9e2", to: "#c7baab", ink: "#2b2620", accent: "#8a7b6b" },
  { slug: "beic", name: "BEIC", domain: "beic.az", from: "#4f9a2c", to: "#22408c", ink: "#ffffff", accent: "#c6f19a" },
  { slug: "bormark", name: "Bormark", domain: "bormarkglobal.com", from: "#1d2b4a", to: "#3a4d76", ink: "#ffffff", accent: "#f2643a" },
];

// a page opened with setContent may not load file:// URLs — inline everything
const data = (p, type) => `data:${type};base64,${readFileSync(p).toString("base64")}`;

function page(w, { portrait }) {
  const img = (n) => data(path.join(SRC, `${w.slug}-${n}.webp`), "image/webp");
  // landscape 1200×713 (≈1.68:1, the desktop card) · portrait 600×678 (≈0.885:1, the phone card)
  const [W, H] = portrait ? [600, 678] : [1200, 713];
  return `<!doctype html><html><head><style>
  @font-face { font-family: IT; src: url(${data(FONT, "font/ttf")}); }
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; font-family: IT, system-ui, sans-serif;
         background: radial-gradient(120% 90% at 85% 15%, ${w.to} 0%, transparent 60%), linear-gradient(140deg, ${w.from}, ${w.to}); color: ${w.ink}; }
  .grain { position: absolute; inset: 0; opacity: .08; background-image: radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px); background-size: 3px 3px; mix-blend-mode: overlay; }
  .text { position: absolute; ${portrait ? "left: 36px; top: 40px;" : "left: 64px; bottom: 64px;"} }
  .name { font-size: ${portrait ? 54 : 76}px; letter-spacing: -0.04em; line-height: .95; }
  .domain { margin-top: 14px; font-size: ${portrait ? 15 : 17}px; letter-spacing: .01em; color: ${w.accent}; display: flex; align-items: center; gap: 8px; }
  .domain::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: ${w.accent}; }
  .browser { position: absolute; border-radius: 12px; overflow: hidden; background: #fff;
             box-shadow: 0 40px 80px -20px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.08);
             ${portrait ? "width: 520px; right: -150px; top: 170px; transform: perspective(1600px) rotateY(-14deg) rotateX(4deg);" : "width: 780px; right: -60px; top: 64px; transform: perspective(2200px) rotateY(-12deg) rotateX(3deg);"} transform-origin: left center; }
  .bar { height: 30px; background: #f3f2ef; display: flex; align-items: center; gap: 7px; padding: 0 12px; border-bottom: 1px solid #e4e2dd; }
  .bar i { width: 10px; height: 10px; border-radius: 50%; background: #d8d5cf; }
  .bar span { margin-left: 14px; flex: 0 1 260px; height: 18px; border-radius: 9px; background: #fff; font: 10px/18px IT, sans-serif; color: #8b877f; padding: 0 10px; }
  .browser img { display: block; width: 100%; }
  .phone { position: absolute; border-radius: 34px; padding: 9px; background: #111;
           box-shadow: 0 50px 90px -25px rgba(0,0,0,.55), inset 0 0 0 1.5px #333;
           ${portrait ? "width: 250px; left: 50%; bottom: -70px; margin-left: -125px;" : "width: 200px; left: 400px; bottom: -48px;"} }
  .phone .screen { border-radius: 26px; overflow: hidden; position: relative; aspect-ratio: 390 / 844; }
  .phone .screen::before { content: ""; position: absolute; top: 8px; left: 50%; width: 62px; height: 18px; margin-left: -31px; border-radius: 10px; background: #111; z-index: 1; }
  .phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
  </style></head><body>
    <div class="browser"><div class="bar"><i></i><i></i><i></i><span>${w.domain}</span></div><img src="${img("cover")}"></div>
    <div class="phone"><div class="screen"><img src="${img("m1")}"></div></div>
    <div class="text"><div class="name">${w.name}</div><div class="domain">${w.domain}</div></div>
    <div class="grain"></div>
  </body></html>`;
}

const browser = await chromium.launch();
for (const w of WORK) {
  const dir = path.join(OUT, w.slug);
  mkdirSync(dir, { recursive: true });
  for (const portrait of [false, true]) {
    const p = await browser.newPage({ viewport: portrait ? { width: 600, height: 678 } : { width: 1200, height: 713 }, deviceScaleFactor: 2 });
    await p.setContent(page(w, { portrait }), { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const png = await p.screenshot({ type: "png" });
    await sharp(png).webp({ quality: 84 }).toFile(path.join(dir, portrait ? "card-portrait.webp" : "card.webp"));
    await p.close();
  }
  // plain screens for the framed gallery on the case-study page
  for (const [from, to, width] of [["s1", "d1", 1920], ["s2", "d2", 1920], ["m1", "m1", 780], ["m2", "m2", 780], ["m3", "m3", 780]]) {
    await sharp(path.join(SRC, `${w.slug}-${from}.webp`)).resize({ width }).webp({ quality: 82 }).toFile(path.join(dir, `${to}.webp`));
  }
  console.log("rendered", w.slug);
}
await browser.close();
