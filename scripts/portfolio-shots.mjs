// Studio shots of delivered work for the case-study pages:
//   public/assets/work/<slug>/shot-1.webp … shot-5.webp
// A laptop (CSS 3D: aluminium deck, keyboard, lid with the screen) and phones
// on dark studio grounds — the site's own screens on the displays. Sources:
// scripts/portfolio-src/<slug>-{cover,s1,s2,m1,m2}.webp (captured at 2×).
//   node scripts/portfolio-shots.mjs [slug]
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "scripts/portfolio-src");
const OUT = path.join(ROOT, "public/assets/work");
const img = (slug, n) => `data:image/webp;base64,${readFileSync(path.join(SRC, `${slug}-${n}.webp`)).toString("base64")}`;
const W = 1200;
const H = 900;

// concrete: fractal noise, lit from the upper left
const concrete = (tone) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${tone} 0 0 0 0 ${tone} 0 0 0 0 ${tone} 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}")`;

const GROUNDS = {
  stone: `radial-gradient(70% 60% at 30% 25%, rgba(255,255,255,.16), transparent 70%), ${concrete(0.6)}, linear-gradient(160deg, #3b3c3f, #121214 70%)`,
  stripes: `radial-gradient(60% 55% at 55% 45%, rgba(255,255,255,.10), transparent 70%), repeating-linear-gradient(128deg, #1b1c1f 0 22px, #08090a 22px 44px)`,
  dusk: `radial-gradient(70% 60% at 75% 20%, rgba(150,170,210,.28), transparent 65%), ${concrete(0.5)}, linear-gradient(170deg, #2a3242, #0d1017 75%)`,
};

const CSS = `
.g-stone { background: ${GROUNDS.stone}; }
.g-stripes { background: ${GROUNDS.stripes}; }
.g-dusk { background: ${GROUNDS.dusk}; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; }
.ground { position: absolute; inset: 0; }
.vignette { position: absolute; inset: 0; background: radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.55)); }
.stage { position: absolute; inset: 0; perspective: 2600px; perspective-origin: 50% 30%; }

/* laptop: deck (lying) + lid (standing), both children of a 3D group */
.laptop { position: absolute; left: 50%; top: 50%; width: 640px; height: 440px; margin: -220px 0 0 -320px; transform-style: preserve-3d; }
.deck { position: absolute; inset: 0; border-radius: 22px; transform-style: preserve-3d;
  background: linear-gradient(180deg, #5b5d62 0%, #45474c 55%, #36383c 100%);
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.22), inset 0 -3px 0 rgba(0,0,0,.35); }
.deck::after { content: ""; position: absolute; inset: -6px; border-radius: 26px; z-index: -1; transform: translateZ(-14px);
  background: #26272a; filter: blur(.5px); }
.keys { position: absolute; left: 8%; right: 8%; top: 8%; height: 44%; border-radius: 8px; background-color: #0e0e10;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.7); padding: 5px;
  background-image: repeating-linear-gradient(90deg, transparent 0 24px, #0e0e10 24px 27px), repeating-linear-gradient(0deg, transparent 0 22px, #0e0e10 22px 25px), linear-gradient(#1f2023, #1f2023);
  background-origin: content-box; background-clip: content-box; }
.pad { position: absolute; left: 32%; right: 32%; top: 58%; height: 34%; border-radius: 10px; background: linear-gradient(180deg, #4d4f54, #424448); box-shadow: inset 0 0 0 1px rgba(0,0,0,.25); }
.lid { position: absolute; left: 0; right: 0; bottom: 100%; height: 420px; transform-origin: 50% 100%; transform-style: preserve-3d; border-radius: 22px 22px 6px 6px;
  background: #0b0b0c; box-shadow: inset 0 0 0 2px #3b3c40, 0 0 0 1px #1a1b1d; padding: 14px 14px 22px; }
.lid .screen { position: relative; width: 100%; height: 100%; border-radius: 8px; overflow: hidden; background: #000; }
.lid .screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.lid .screen::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 38%); }
.lid .notch { position: absolute; top: 16px; left: 50%; width: 90px; height: 14px; margin-left: -45px; border-radius: 0 0 8px 8px; background: #0b0b0c; z-index: 2; }
.shadow { position: absolute; left: 50%; top: 50%; width: 900px; height: 600px; margin: -300px 0 0 -450px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,.75), transparent); filter: blur(30px); }

/* phone */
.phone { position: absolute; width: 270px; height: 584px; border-radius: 48px; padding: 11px;
  background: linear-gradient(135deg, #5d5f64, #26272a 40%, #4a4c50 70%, #1d1e20);
  box-shadow: 0 60px 90px -20px rgba(0,0,0,.8), inset 0 0 0 1.5px rgba(255,255,255,.18); }
.phone .screen { position: relative; width: 100%; height: 100%; border-radius: 38px; overflow: hidden; background: #000; box-shadow: 0 0 0 3px #0a0a0a; }
.phone .screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.phone .screen::before { content: ""; position: absolute; top: 12px; left: 50%; width: 92px; height: 26px; margin-left: -46px; border-radius: 14px; background: #000; z-index: 2; }
.phone .screen::after { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,.16), rgba(255,255,255,0) 40%); }
.phone .btn { position: absolute; right: -3px; top: 150px; width: 4px; height: 70px; border-radius: 2px; background: #3a3b3f; }
.plinth { position: absolute; border-radius: 6px; background: linear-gradient(180deg, #d8d3cb, #a9a39a); box-shadow: 0 40px 80px -20px rgba(0,0,0,.7); }
`;

/** each shot: ground + what stands on it */
function shot(slug, kind) {
  const scene = {
    // 1 — front, slightly from above, on stone
    1: { ground: "stone", body: laptop(img(slug, "cover"), "rotateX(54deg) translateY(190px) scale(1.12)", "rotateX(-100deg)") },
    // 2 — three-quarter from the right, on stripes
    2: { ground: "stripes", body: laptop(img(slug, "s1"), "rotateX(56deg) rotateZ(-26deg) translate(10px, 150px) scale(1.1)", "rotateX(-106deg)") },
    // 3 — three-quarter from the left, on dusk concrete
    3: { ground: "dusk", body: laptop(img(slug, "s2"), "rotateX(58deg) rotateZ(24deg) translate(-10px, 160px) scale(1.1)", "rotateX(-104deg)") },
    // 4 — a phone tilted on stripes
    4: { ground: "stripes", body: `<div class="phone" style="left:465px;top:150px;transform:rotate(-8deg)"><div class="screen"><img src="${img(slug, "m1")}"></div><span class="btn"></span></div>` },
    // 5 — a phone on a stone plinth, dusk light
    5: { ground: "dusk", body: `<div class="plinth" style="left:420px;top:660px;width:360px;height:260px"></div><div class="phone" style="left:465px;top:95px"><div class="screen"><img src="${img(slug, "m2")}"></div><span class="btn"></span></div>` },
  }[kind];
  return `<!doctype html><html><head><style>${CSS}</style></head><body><div class="ground g-${scene.ground}"></div><div class="stage">${scene.body}</div><div class="vignette"></div></body></html>`;
}

function laptop(screen, groupTransform, lidTransform) {
  return `<div class="shadow"></div><div class="laptop" style="transform:${groupTransform}">
    <div class="deck"><div class="keys"></div><div class="pad"></div></div>
    <div class="lid" style="transform:${lidTransform}"><span class="notch"></span><div class="screen"><img src="${screen}"></div></div>
  </div>`;
}

const only = process.argv[2];
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const slug of ["kandar", "beic", "bormark"].filter((s) => !only || s === only)) {
  for (const kind of [1, 2, 3, 4, 5]) {
    const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await p.setContent(shot(slug, kind), { waitUntil: "load" });
    const png = await p.screenshot({ type: "png" });
    await sharp(png).webp({ quality: 84 }).toFile(path.join(OUT, slug, `shot-${kind}.webp`));
    await p.close();
  }
  console.log("shots", slug);
}
await browser.close();
