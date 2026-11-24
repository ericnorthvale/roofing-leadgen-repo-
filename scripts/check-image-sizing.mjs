/**
 * Does any image ship far more pixels than it paints?
 *
 * WHY THIS EXISTS (2026-11-24). Lighthouse failed `uses-responsive-images` on
 * the homepage and the report alone did not say why: it names the file and a
 * byte count, not the cause. Reproducing its comparison locally is what turned
 * "five images are too big" into two distinct, fixable causes:
 *
 *   1. ASPECT MISMATCH. Every slot renders `object-fit: cover` inside a fixed
 *      aspect-ratio box, so the browser ALREADY crops to that ratio — it just
 *      downloads the whole photo first. A 1200x2133 portrait in a 3:2 card
 *      wasted 74% of its bytes, and no width ladder can fix that: a narrower
 *      file scales the height down too, so the discarded share never changes.
 *   2. LADDER GAP. A 92vw card needs 992 device pixels; the ladder jumped
 *      800 -> 1200, so such cards over-fetched by about a third.
 *
 * Run it after a build to re-check, or when adding photos or a new slot:
 *
 *     pnpm build && pnpm check:images
 *
 * NOT part of `pnpm build`: it drives a real browser, which the build job has
 * no reason to install. Lighthouse CI remains the enforcing gate; this is the
 * tool that tells you WHICH image and WHY, in one line each.
 *
 * ONE SUBTLETY, and it is the one that makes a naive version of this script
 * report perfect health on a broken page: for an <img> with a w-descriptor
 * srcset, `naturalWidth` returns the DENSITY-CORRECTED intrinsic size, not the
 * file's real pixels. Reading it makes every image look exactly right. The real
 * dimensions are therefore read off disk, from the file `currentSrc` resolved to.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const OUT_DIRS = [".vercel/output/static", "dist/client", "dist"];
const root = OUT_DIRS.find((d) => existsSync(d));
if (!root) {
  console.error(`check-image-sizing: no build output (looked in ${OUT_DIRS.join(", ")})`);
  process.exit(1);
}

/**
 * Emulation comes from the Lighthouse config, not from constants here, so the
 * two can never drift apart and quietly disagree about what "too big" means.
 */
const lhc = JSON.parse(readFileSync(".lighthouserc.json", "utf8"));
const screen = lhc.ci.collect.settings.screenEmulation;
const { width: W, height: H, deviceScaleFactor: DPR } = screen;

/** The pages Lighthouse actually audits, unless some are named on argv. */
const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : lhc.ci.collect.url.map((u) => new URL(u).pathname);

/** Lighthouse ignores an image until its waste clears a few KB. */
const WASTE_BYTES = 4096;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let file = path.join(root, p);
    if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
    if (!existsSync(file) || (await stat(file)).isDirectory()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(500).end("error");
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

// Uses the browser Playwright manages (`pnpm exec playwright install chromium`).
// CHROME_PATH overrides it, for a machine or image that already ships one.
const browser = await chromium
  .launch({
    args: ["--no-sandbox"],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  })
  .catch((err) => {
    console.error(
      `check-image-sizing: could not start Chromium.\n` +
        `  Install it with:  pnpm exec playwright install chromium\n` +
        `  Or point at one:  CHROME_PATH=/path/to/chrome pnpm check:images\n\n${err.message}`,
    );
    process.exit(1);
  });
const failures = [];
let checked = 0;

for (const p of pages) {
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: DPR,
    isMobile: true,
  });
  await page.goto(base + p, { waitUntil: "networkidle" });
  // Lazy images below the fold still have to be measured.
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) img.loading = "eager";
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1200));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
  });
  await page.waitForTimeout(1000);

  const seen = await page.evaluate(
    (dpr) =>
      [...document.querySelectorAll("img")].map((img) => {
        const r = img.getBoundingClientRect();
        return {
          src: (img.currentSrc || img.src).replace(location.origin, ""),
          needW: Math.round(r.width * dpr),
          needH: Math.round(r.height * dpr),
          visible: r.width > 0 && r.height > 0,
        };
      }),
    DPR,
  );
  await page.close();

  for (const img of seen) {
    // An SVG is vector: there is no oversized raster to speak of.
    if (!img.visible || /\.svg$/i.test(img.src)) continue;
    const file = path.join(root, decodeURIComponent(img.src));
    let meta, bytes;
    try {
      meta = await sharp(file).metadata();
      bytes = (await stat(file)).size;
    } catch {
      continue; // not a raster we can measure; check-urls covers existence
    }
    checked++;
    const actual = meta.width * meta.height;
    const used = img.needW * img.needH;
    const ratio = Math.max(0, 1 - used / actual);
    const wasted = Math.round(bytes * ratio);
    if (wasted > WASTE_BYTES) {
      failures.push(
        `${p}  ${img.src}\n` +
          `      file ${meta.width}x${meta.height} (${(bytes / 1024).toFixed(0)}KB) · ` +
          `painted ${img.needW}x${img.needH} · ` +
          `wasting ${(ratio * 100).toFixed(0)}% = ${(wasted / 1024).toFixed(0)}KB`,
      );
    }
  }
}

await browser.close();
server.close();

if (failures.length) {
  console.error(`\nimage sizing FAILED — ${failures.length} oversized image(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  console.error(
    `Give the slot its aspect ratio: <ImagePlaceholder ratio="3/2" …> or\n` +
      `<RoofImage ratio="16/9" …>. That serves a pre-cropped file instead of the\n` +
      `whole photo — identical on screen, because object-cover was already\n` +
      `cropping to exactly that box. If the ratio is new, add it to RATIOS and\n` +
      `CROP_PLAN in scripts/optimize-images.mjs first.\n\n` +
      `Do NOT add a ratio to a full-bleed slot, or to one using a non-centre\n` +
      `object-position — a centre crop would re-frame those.\n`,
  );
  process.exit(1);
}

console.log(
  `image sizing: ${checked} images across ${pages.length} pages at ` +
    `${W}x${H} dpr=${DPR} · none oversized`,
);
