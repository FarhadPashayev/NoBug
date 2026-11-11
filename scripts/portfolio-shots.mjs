// Studio renders of delivered work for the case-study pages:
//   public/assets/work/<slug>/render-1.webp … render-5.webp
// three.js scene (scripts/portfolio-render/scene.html): a space-grey laptop
// and a titanium phone with physically based materials, studio lighting and
// soft shadows on stone, ribbed and dusk-concrete grounds — the site's own
// screens on the displays (scripts/portfolio-src/<slug>-{cover,s1,s2,m1,m2}).
//   node scripts/portfolio-shots.mjs [slug] [shot]
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/assets/work");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png" };

// the scene imports three from node_modules: serve the project over http
const server = createServer(async (req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const [onlySlug, onlyShot] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  for (const slug of ["kandar", "beic", "bormark"].filter((s) => !onlySlug || s === onlySlug)) {
    for (const n of [1, 2, 3, 4, 5].filter((s) => !onlyShot || s === Number(onlyShot))) {
      const p = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
      p.on("pageerror", (e) => console.error(slug, n, e.message));
      await p.goto(`http://localhost:${port}/scripts/portfolio-render/scene.html?shot=${n}&slug=${slug}`);
      await p.waitForFunction(() => window.__done === true, null, { timeout: 180_000 });
      const png = await p.screenshot({ type: "png" });
      await sharp(png).webp({ quality: 86 }).toFile(path.join(OUT, slug, `render-${n}.webp`));
      await p.close();
      console.log("rendered", slug, n);
    }
  }
} finally {
  await browser.close();
  server.close();
}
