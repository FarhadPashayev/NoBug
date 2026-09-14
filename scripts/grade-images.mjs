// One-off: crop the source photographs to their slot ratios at 2x, apply ONE
// identical grade to all of them, and write .webp into public/assets/photo/.
// Grade: saturation −25%, contrast +8, shadows cooled slightly toward blue.
// Run: node scripts/grade-images.mjs <source-dir>
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/grade-images.mjs <source-dir>");
const out = path.resolve("public/assets/photo");
await mkdir(out, { recursive: true });

// slot → [source file, width, height, optional pre-crop {left, top, width, height}]
// (2x of the largest slot width)
const SLOTS = {
  hero: ["hero.jpg", 1200, 1195, { left: 200, top: 0, width: 1560, height: 1560 }], // box 1200/1195; crop excludes the vendor sticker top-right
  band: ["band.jpg", 2400, 1029], // 21:9
  services: ["services.jpg", 1600, 1200], // 4:3
  about: ["about.jpg", 1920, 1080], // 16:9
  tech: ["culture.jpg", 1920, 1080], // 16:9
  careers: ["careers.jpg", 1800, 1200], // 3:2
};

const CONTRAST = 1.08;
const mid = 128 * (1 - CONTRAST); // keeps mid-grey in place
const OFFSET = [mid - 2, mid, mid + 4]; // R slightly down, B slightly up → cooler shadows

for (const [key, [file, w, h, crop]] of Object.entries(SLOTS)) {
  const input = path.join(src, file);
  try {
    let img = sharp(input).rotate();
    if (crop) img = img.extract(crop);
    await img
      .resize(w, h, { fit: "cover", position: "attention" })
      .modulate({ saturation: 0.75 })
      .linear([CONTRAST, CONTRAST, CONTRAST], OFFSET)
      .webp({ quality: 82 })
      .toFile(path.join(out, `${key}.webp`));
    console.log("ok ", key, `${w}×${h}`);
  } catch (e) {
    console.log("skip", key, "—", e.message.split("\n")[0]);
  }
}
