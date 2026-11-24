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
/**
 * Widths that cover every slot the site renders: grid thumb → card → hero.
 *
 * 600 and 1000 were added (2026-11-24) after measuring the real demand. A
 * 92vw card on Lighthouse's mobile profile (412px at DPR 2.625) needs 992
 * device pixels; the old ladder jumped 800 → 1200, so every such card
 * downloaded a 1200px file to paint 992 — about a third of the bytes wasted on
 * the homepage alone.
 */
const WIDTHS = [400, 600, 800, 1000, 1200];
/** Below this, a smaller sibling saves nothing worth the request. */
const MIN_SOURCE_WIDTH = 500;
const QUALITY = 74;
const MANIFEST = "src/lib/image-manifest.json";

/**
 * ASPECT-CROPPED LADDERS (2026-11-24).
 *
 * Every image slot on this site sets a fixed `aspect-ratio` and renders the
 * photo with `object-fit: cover`, so the browser ALREADY crops to that ratio on
 * screen. It just downloads the whole photo first and throws the rest away.
 *
 * A 1200x2133 portrait painted into a 3:2 card wasted 74% of its bytes, and no
 * width ladder can fix that: picking a narrower file scales the height down
 * too, so the proportion thrown away never changes. Only a crop helps.
 *
 * Because the browser was performing exactly this centre-crop anyway, a
 * pre-cropped variant is PIXEL-IDENTICAL on screen. Nothing is re-framed and
 * no composition changes — the same crop simply happens at build time instead
 * of after a wasted download.
 *
 * These are the ratios the components actually declare. Keep this list in step
 * with the `ratio=` props and `aspect-*` classes in src/ — an unlisted ratio
 * costs nothing but falls back to the uncropped ladder.
 */
const RATIOS = {
  "16x9": 16 / 9,
  "16x10": 16 / 10,
  "3x2": 3 / 2,
  "4x3": 4 / 3,
  "1x1": 1,
  "4x5": 4 / 5,
};

/**
 * WHICH ratios each directory's photos are actually rendered at.
 *
 * Cropping every image to every ratio was measured first and rejected: 1,868
 * extra files, 202MB of /public and 3m17s added to a cold build, for crops no
 * slot ever requests. Images are purpose-specific here — village photos only
 * ever appear in the 3:2 village cards — so the plan is declared per directory
 * and nothing else is generated.
 *
 * KEEP THIS IN STEP WITH THE COMPONENTS. If you render a directory's photo at a
 * new ratio, add it here. Getting it wrong is not a broken image: `imageAttrs`
 * only emits a cropped ladder the manifest confirms, and otherwise falls back
 * to the plain width ladder, which is what ships today. The cost of a miss is a
 * slightly heavier download, not a visual defect.
 */
const CROP_PLAN = {
  // Work photos appear in the 3:2 homepage cards, the 1:1 gallery grid, the
  // 4:3 before/after pair, and 16:9 blog and service headers.
  work: ["3x2", "1x1", "4x3", "16x9"],
  // Project photos: 16:10 on the index, 16:9 on the detail page, 3:2 on home.
  projects: ["16x10", "16x9", "3x2"],
  // Roof mock-ups: 16:9 in the materials showcase, 4:3 in the shingle studio.
  "design-center": ["16x9", "4x3"],
  // Village street photos only ever fill the 3:2 showcase cards.
  villages: ["3x2"],
  // Team and story photos: a 4:5 portrait, a 3:2 row, and the 1:1 blog byline.
  about: ["4x5", "3x2", "1x1"],
  // Demo stock fills ImagePlaceholder slots, which default to 16:9.
  placeholders: ["16x9", "3x2", "4x3", "1x1"],
  // Heroes are full-bleed with no fixed ratio — a crop would be guesswork.
  hero: [],
};
/**
 * Don't emit a crop that barely differs from the source. Below this the extra
 * file costs more (a second cache entry, a longer srcset) than it saves.
 *
 * Set from measurement, not taste: at 0.12 the commonest pairing on the site —
 * a 4:3 photo in a 3:2 card — fell just under the bar at 11%, and those cards
 * stayed on the uncropped ladder still carrying ~12% waste. 0.08 admits them
 * and takes them to roughly 1%.
 */
const MIN_CROP_SAVING = 0.08;
/**
 * A variant file itself, e.g. foo-800.webp or foo-16x9-800.webp — never treat
 * one as a source.
 *
 * The cropped arm matches ANY trailing width, not just the ones in WIDTHS,
 * because each crop ladder also emits one at the source's full usable width
 * (foo-16x9-1264.webp). Matching only WIDTHS let those through as sources, so
 * the pipeline cropped its own crops: 99 images became 443 and the variant
 * count quadrupled.
 */
const VARIANT_RE = new RegExp(`(-\\d+x\\d+-\\d+|-(${WIDTHS.join("|")}))\\.webp$`);

/**
 * The source region a cover-crop to `ratio` actually uses, and therefore the
 * widest crop obtainable without upscaling.
 */
function cropGeometry(meta, ratio) {
  const native = meta.width / meta.height;
  // Wider target: keep full width, cut height. Taller target: cut width.
  const region =
    ratio >= native
      ? { w: meta.width, h: meta.width / ratio }
      : { w: meta.height * ratio, h: meta.height };
  const saving = 1 - (region.w * region.h) / (meta.width * meta.height);
  return { maxWidth: Math.floor(region.w), saving };
}

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

/**
 * Run `jobs` with bounded concurrency. Encoding is CPU-bound and was fully
 * sequential before, which left most of the machine idle; a small pool cuts a
 * cold run several-fold. Kept modest so a build box is not swamped.
 */
async function pool(jobs, limit = 6) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (next < jobs.length) await jobs[next++]();
  });
  await Promise.all(workers);
}

const manifest = {};
const jobs = [];
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

    /** Queue one encode, skipping it when the output is already current. */
    const queue = (out, build) => {
      jobs.push(async () => {
        if (!(await isStale(file, out))) return void skipped++;
        await mkdir(path.dirname(out), { recursive: true });
        await build();
        built++;
      });
    };

    const variants = [];
    for (const w of WIDTHS) {
      // No upscaling, and no variant that barely differs from the source.
      if (meta.width < MIN_SOURCE_WIDTH || w >= meta.width * 0.9) continue;
      const out = file.replace(/\.(webp|jpe?g|png)$/i, `-${w}.webp`);
      queue(out, () => sharp(file).resize({ width: w }).webp({ quality: QUALITY }).toFile(out));
      variants.push(w);
    }

    // Aspect-cropped ladders, for the ratios this directory is rendered at.
    const crops = {};
    const planned = CROP_PLAN[dir] ?? [];
    if (meta.width >= MIN_SOURCE_WIDTH) {
      for (const key of planned) {
        const ratio = RATIOS[key];
        if (!ratio) continue; // plan names a ratio RATIOS doesn't define
        const { maxWidth, saving } = cropGeometry(meta, ratio);
        if (saving < MIN_CROP_SAVING) continue; // source is already this shape

        const cropWidths = WIDTHS.filter((w) => w <= maxWidth);
        // Always offer a crop at the full usable width, so a large viewport
        // never has to fall back to the uncropped (and much taller) original.
        if (maxWidth > (cropWidths.at(-1) ?? 0) * 1.1) cropWidths.push(maxWidth);
        if (!cropWidths.length) continue;

        for (const w of cropWidths) {
          const out = file.replace(/\.(webp|jpe?g|png)$/i, `-${key}-${w}.webp`);
          queue(out, () =>
            sharp(file)
              .resize({ width: w, height: Math.round(w / ratio), fit: "cover", position: "centre" })
              .webp({ quality: QUALITY })
              .toFile(out),
          );
        }
        crops[key] = cropWidths;
      }
    }

    manifest[url] = {
      w: meta.width,
      h: meta.height,
      ...(variants.length ? { v: variants } : {}),
      ...(Object.keys(crops).length ? { c: crops } : {}),
    };
  }
}

await pool(jobs);

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

console.log(
  `images: ${Object.keys(sorted).length} measured · ${built} variants built · ${skipped} up to date`,
);
