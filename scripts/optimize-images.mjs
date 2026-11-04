/**
 * Build-time image pipeline for everything under /public.
 *
 * WHY THIS EXISTS (audit, 2026-11): all 227 <img> tags shipped without
 * width/height, so every page shifted as images loaded — Cumulative Layout
 * Shift, a confirmed ranking signal. And the gallery shipped 12MB: individual
 * photos over 1MB rendered as ~280px thumbnails in a four-column grid.
 *
 * Astro's own <Image> only processes images it can import from src/, and every
 * image path here lives as a plain string inside data files (work-photos.ts,
 * service-areas.ts, the project JSON) and inside JSON-LD contentUrl and OG
 * tags, which need stable public URLs. Moving them into src/ would mean
 * rewriting all of that and hashing the URLs. So the pipeline comes to the
 * files instead:
 *
 *  - measures every raster image and writes its intrinsic size to a manifest
 *    that RoofImage reads, which is what actually kills the layout shift;
 *  - emits down-scaled siblings (name-400.webp, name-800.webp, …) so the
 *    browser can pick a size that matches the slot.
 *
 * Originals are never modified, so the URLs already published in structured
 * data, OG tags and the PDF keep resolving.
 *
 * Idempotent: a variant is only rebuilt when it is missing or older than its
 * source, so repeat builds cost almost nothing. Runs from `prebuild`, which
 * means photos added later are handled without anyone remembering to run it.
 */
import { readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = "public";
/** Directories worth processing — photography, not icons or logos. */
const DIRS = ["work", "projects", "placeholders", "design-center", "villages", "hero", "about"];
/** Widths that cover every slot the site renders: grid thumb → card → hero. */
const WIDTHS = [400, 800, 1200];
/** Below this, a smaller sibling saves nothing worth the request. */
const MIN_SOURCE_WIDTH = 500;
const QUALITY = 74;
const MANIFEST = "src/lib/image-manifest.json";
/** A variant file itself, e.g. foo-800.webp — never treat one as a source. */
const VARIANT_RE = new RegExp(`-(${WIDTHS.join("|")})\\.webp$`);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function isStale(src, out) {
  if (!existsSync(out)) return true;
  const [a, b] = await Promise.all([stat(src), stat(out)]);
  return a.mtimeMs > b.mtimeMs;
}

const manifest = {};
let built = 0;
let skipped = 0;

for (const dir of DIRS) {
  const root = path.join(PUBLIC_DIR, dir);
  if (!existsSync(root)) continue;

  for await (const file of walk(root)) {
    if (!/\.(webp|jpe?g|png)$/i.test(file)) continue;
    if (VARIANT_RE.test(file)) continue;

    const url = "/" + path.relative(PUBLIC_DIR, file).split(path.sep).join("/");
    let meta;
    try {
      meta = await sharp(file).metadata();
    } catch {
      continue; // unreadable or not an image sharp handles — leave it alone
    }
    if (!meta.width || !meta.height) continue;

    const variants = [];
    for (const w of WIDTHS) {
      // No upscaling, and no variant that barely differs from the source.
      if (meta.width < MIN_SOURCE_WIDTH || w >= meta.width * 0.9) continue;
      const out = file.replace(/\.(webp|jpe?g|png)$/i, `-${w}.webp`);
      if (await isStale(file, out)) {
        await mkdir(path.dirname(out), { recursive: true });
        await sharp(file).resize({ width: w }).webp({ quality: QUALITY }).toFile(out);
        built++;
      } else {
        skipped++;
      }
      variants.push(w);
    }

    manifest[url] = { w: meta.width, h: meta.height, ...(variants.length ? { v: variants } : {}) };
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

console.log(
  `images: ${Object.keys(sorted).length} measured · ${built} variants built · ${skipped} up to date`,
);
