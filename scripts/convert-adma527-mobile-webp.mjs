/**
 * One-off: Adma 527 mobile JPG → WebP q80 @ 1080×1920.
 * Usage: node scripts/convert-adma527-mobile-webp.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public/frames-mobile/adma-527-9-16");
const DST = path.join(ROOT, "public/frames-mobile/adma-527-9-16-webp");

const TOTAL = 470;
const QUALITY = 80;

await fs.promises.mkdir(DST, { recursive: true });

let ok = 0;
let bytes = 0;
const start = Date.now();

for (let i = 1; i <= TOTAL; i++) {
  const name = `frame_${String(i).padStart(4, "0")}`;
  const srcPath = path.join(SRC, `${name}.jpg`);
  const dstPath = path.join(DST, `${name}.webp`);
  const buf = await sharp(srcPath)
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  if (meta.width !== 1080 || meta.height !== 1920) {
    throw new Error(`${name}: expected 1080×1920, got ${meta.width}×${meta.height}`);
  }
  await fs.promises.writeFile(dstPath, buf);
  bytes += buf.length;
  ok += 1;
  if (i % 50 === 0 || i === TOTAL) {
    console.log(`[${i}/${TOTAL}] ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  }
}

console.log(`Done: ${ok} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB, ${((Date.now() - start) / 1000).toFixed(1)}s`);
