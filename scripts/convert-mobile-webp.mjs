/**
 * Mobile JPG → WebP q80 @ 1080×1920.
 * Usage: node scripts/convert-mobile-webp.mjs <slug>
 * Slugs: adma527 | adma514 | dusk
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PROJECTS = {
  adma527: {
    src: "public/frames-mobile/adma-527-9-16",
    dst: "public/frames-mobile/adma-527-9-16-webp",
    total: 470,
  },
  adma514: {
    src: "public/frames-mobile/adma-514-9-16",
    dst: "public/frames-mobile/adma-514-9-16-webp",
    total: 429,
  },
  dusk: {
    src: "public/frames-mobile/dusk-9-16",
    dst: "public/frames-mobile/dusk-9-16-webp",
    total: 326,
  },
};

const slug = process.argv[2];
const project = PROJECTS[slug];
if (!project) {
  console.error("Usage: node scripts/convert-mobile-webp.mjs <adma527|adma514|dusk>");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, project.src);
const DST = path.join(ROOT, project.dst);
const { total: TOTAL } = project;
const QUALITY = 80;

await fs.promises.mkdir(DST, { recursive: true });

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
  if (i % 50 === 0 || i === TOTAL) {
    console.log(`[${slug}] [${i}/${TOTAL}] ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  }
}

console.log(
  `[${slug}] Done: ${TOTAL} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB, ${((Date.now() - start) / 1000).toFixed(1)}s`,
);
