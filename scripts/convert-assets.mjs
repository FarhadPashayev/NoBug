// One-off: the client-supplied generated graphics (forWebImg/) → slot-sized .webp.
// They are already in the palette — no grade is applied.
// Run: node scripts/convert-assets.mjs <source-dir>
import sharp from "sharp";
import path from "node:path";

const src = process.argv[2];
const out = path.resolve("public/assets/photo");
const SLOTS = {
  about: ["M-01_facade-light_16x9.png", 1920, 1080],
  band: ["M-02_light-trails_21x9.png", 2400, 1029],
  services: ["M-03_coverage-rings_4x3.png", 1600, 1200],
  tech: ["M-05_fibre-bundle_16x9.png", 1920, 1080],
  careers: ["M-04_system-layers_3x2.png", 1800, 1200],
};
for (const [key, [file, w, h]] of Object.entries(SLOTS)) {
  await sharp(path.join(src, file)).resize(w, h, { fit: "cover", position: "attention" }).webp({ quality: 84 }).toFile(path.join(out, `${key}.webp`));
  console.log("ok", key, `${w}×${h}`);
}
