/**
 * Build-time page-uniqueness gate. Runs after `astro build` and FAILS THE BUILD
 * when two indexable pages are too similar to each other.
 *
 * WHY THIS EXISTS. Hard Rule #1 says never ship a page that differs from
 * another only by a swapped city, neighborhood or service name. Until now that
 * was a principle in CLAUDE.md enforced by whoever happened to be paying
 * attention. The quality gate checks that a record is FULL — it cannot tell
 * whether it was filled with the same sentences as its neighbour.
 *
 * That is the exact failure mode a programmatic local-SEO site dies of, and it
 * gets worse with scale: the risk is not how many pages exist, it is how alike
 * any two of them are. A doorway page is typically 80–95% identical to its
 * siblings. When this gate was first run across the nine city-service pages,
 * the worst pair was 12.0% (Conroe vs Cypress storm damage) and everything
 * else sat under 2.1% — so the threshold here is set well above today's real
 * content but far below anything that reads as duplication.
 *
 * CALIBRATION, VERIFIED BY INJECTION (2026-11-13). The gate was tested the way
 * check-urls was, by breaking the build output on purpose:
 *
 *   real distinct pages, whole site ....................  max 15.6%  pass
 *   one page copied verbatim over another .............. 100.0%  FAIL
 *   one page with the city + county names swapped ......  84.6%  FAIL
 *
 * The name swap is the realistic doorway pattern and the one that matters.
 * There is a wide empty band between 15.6% and 84.6%, which is why 25% is a
 * safe line rather than a guess — and why raising it to make a build pass
 * would be throwing away the whole point.
 *
 * HOW IT MEASURES. Rendered <article> text (falling back to <main>), cut into
 * overlapping 5-word shingles and compared pairwise by Jaccard overlap.
 * Shingles catch reused SENTENCES, which is what name-swapping produces, while
 * tolerating the shared vocabulary any two roofing pages legitimately have.
 *
 * BOILERPLATE IS REMOVED BY DOCUMENT FREQUENCY, not by a list of selectors.
 * The first run of this gate reported /contact vs /gallery at 57.9%, which is
 * not duplication — it is the lead form, trust bar and CTA block those pages
 * share with everything else, and on a page with little prose that boilerplate
 * IS most of the text. Hardcoding selectors to strip would rot the moment a
 * component moves, so instead any shingle that appears on more than
 * MAX_DOC_FREQ of pages is treated as chrome and dropped from every page
 * before comparison. A phrase on half the site cannot be what distinguishes
 * two pages from each other, by definition.
 *
 * Pages that render noindex are skipped — they are already excluded from the
 * sitemap and are not competing for anything.
 *
 * Any failure exits non-zero. The cost of a false positive is a failed build
 * and a threshold conversation; the cost of a miss is a manual action.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT_DIRS = [".vercel/output/static", "dist/client", "dist"];

/** Fail above this. See the calibration note above. */
const THRESHOLD = 0.25;
/** Warn (but pass) above this, so drift is visible before it breaks the build. */
const WARN = 0.18;
/** Shingle width in words. */
const N = 5;
/** Pages shorter than this have too little text for the measure to mean much. */
const MIN_WORDS = 120;
/** A shingle on more than this share of pages is chrome, not content. */
const MAX_DOC_FREQ = 0.25;
/** After chrome is removed, a page needs at least this many shingles to judge. */
const MIN_SHINGLES = 40;

/**
 * Pairs allowed to exceed the threshold, each with a REASON and an owner
 * decision behind it. Keep this list empty if at all possible — an entry here
 * is a page that Google may well treat as duplicate, whatever we believe.
 */
const ALLOWED = [
  // ["/a", "/b", "why this is genuinely fine"],
];

function outDir() {
  const dir = OUT_DIRS.find((d) => existsSync(d));
  if (!dir) {
    console.error(`check-uniqueness: no build output found (looked in ${OUT_DIRS.join(", ")})`);
    process.exit(1);
  }
  return dir;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

/** The page's own words: <article> if present, else <main>, else the body. */
function mainText(html) {
  const pick =
    html.match(/<article[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main[\s\S]*?<\/main>/i)?.[0] ??
    html;
  return (
    pick
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      // A form is interactive chrome, not prose. Its field labels, dropdown
      // options and TCPA consent paragraph are identical wherever it appears,
      // and on a short page they ARE most of the text — /contact and /gallery
      // measured 57.9% alike on the lead form alone. Document-frequency
      // filtering misses it because the form sits inside <article> on only a
      // handful of pages, so it never looks sitewide.
      .replace(/<form[\s\S]*?<\/form>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&[a-z]+;|&#\d+;/gi, " ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  );
}

function shingles(text) {
  const words = text.split(" ").filter(Boolean);
  const set = new Set();
  for (let i = 0; i + N <= words.length; i++) set.add(words.slice(i, i + N).join(" "));
  return { set, words: words.length };
}

function jaccard(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let inter = 0;
  for (const g of small) if (large.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}

const dir = outDir();
const pages = [];

for await (const file of walk(dir)) {
  const html = await readFile(file, "utf8");
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) continue;

  const route =
    "/" +
    path
      .relative(dir, file)
      .replace(/index\.html$/, "")
      .replace(/\.html$/, "")
      .replace(/\\/g, "/")
      .replace(/\/$/, "");

  const { set, words } = shingles(mainText(html));
  if (words < MIN_WORDS || set.size === 0) continue;
  pages.push({ route: route === "/" ? "/" : route, set, words });
}

if (pages.length < 2) {
  console.log("check-uniqueness: fewer than two indexable pages — nothing to compare.");
  process.exit(0);
}

/* Strip sitewide chrome: count how many pages each shingle appears on, drop
   the ones common enough that they cannot distinguish anything. */
const docFreq = new Map();
for (const p of pages) for (const g of p.set) docFreq.set(g, (docFreq.get(g) ?? 0) + 1);
const freqLimit = Math.max(2, Math.ceil(pages.length * MAX_DOC_FREQ));
let stripped = 0;
for (const p of pages) {
  for (const g of p.set) {
    if (docFreq.get(g) > freqLimit) {
      p.set.delete(g);
      stripped++;
    }
  }
}
const judged = pages.filter((p) => p.set.size >= MIN_SHINGLES);
const skipped = pages.length - judged.length;
console.log(
  `check-uniqueness: dropped ${stripped} boilerplate shingle instances ` +
    `(present on more than ${freqLimit} of ${pages.length} pages)` +
    (skipped ? `; ${skipped} page(s) left with too little distinct text to judge` : ""),
);
pages.length = 0;
pages.push(...judged);

const allowed = new Set(ALLOWED.map(([a, b]) => [a, b].sort().join("::")));
const failures = [];
const warnings = [];
let worst = { j: 0 };

for (let i = 0; i < pages.length; i++) {
  for (let k = i + 1; k < pages.length; k++) {
    const j = jaccard(pages[i].set, pages[k].set);
    if (j > worst.j) worst = { j, a: pages[i].route, b: pages[k].route };
    if (j < WARN) continue;
    const key = [pages[i].route, pages[k].route].sort().join("::");
    if (allowed.has(key)) continue;
    (j >= THRESHOLD ? failures : warnings).push({ j, a: pages[i].route, b: pages[k].route });
  }
}

const pct = (j) => `${(j * 100).toFixed(1)}%`;

console.log(
  `check-uniqueness: compared ${pages.length} indexable pages ` +
    `(${(pages.length * (pages.length - 1)) / 2} pairs). ` +
    `Most similar: ${pct(worst.j)} — ${worst.a} vs ${worst.b}`,
);

for (const w of warnings.sort((x, y) => y.j - x.j)) {
  console.warn(
    `  ⚠ ${pct(w.j)}  ${w.a}  vs  ${w.b}  (over ${pct(WARN)}, under the ${pct(THRESHOLD)} limit)`,
  );
}

if (failures.length) {
  console.error(`\ncheck-uniqueness: ${failures.length} page pair(s) exceed ${pct(THRESHOLD)}:\n`);
  for (const f of failures.sort((x, y) => y.j - x.j)) {
    console.error(`  ✗ ${pct(f.j)}  ${f.a}  vs  ${f.b}`);
  }
  console.error(
    "\nTwo pages this alike read as one page to a search engine (Hard Rule #1).\n" +
      "Rewrite one of them around something the other genuinely does not cover —\n" +
      "local jurisdiction, housing stock, storm record, the actual failure mode.\n" +
      "Do not raise the threshold to make this pass.",
  );
  process.exit(1);
}

console.log("check-uniqueness: OK — every indexable page is distinct.");
