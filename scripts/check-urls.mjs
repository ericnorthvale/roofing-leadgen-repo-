/**
 * Build-time URL consistency gate. Runs after `astro build` and FAILS THE BUILD
 * when the site's addresses disagree with each other.
 *
 * WHY THIS EXISTS (audit, 2026-11-12). Search Console had 52 pages stuck in
 * "Discovered - currently not indexed". They were not missing pages: the
 * sitemap was emitting every URL with a trailing slash while most pages
 * declared a canonical without one, so the sitemap was advertising 50
 * addresses the pages themselves disowned. Google crawled a few, saw the
 * contradiction, and stopped. Nothing in the build complained.
 *
 * `canonicalPath()` now makes the sitemap and the canonical tag structurally
 * agree, but that only covers the two things it generates. The drift that
 * remains is hand-written: a cross-link typed into a blog post, a href in a
 * new component, a page whose route changed. Twelve such links already existed
 * — every "/blog/x" in the markdown bodies, where the canonical is "/blog/x/".
 *
 * So this checks what actually shipped, in the built HTML:
 *
 *  1. every sitemap URL is some page's canonical
 *  2. every internal link points at a canonical URL — not a redirecting
 *     variant, not a 404
 *  3. no noindex page is in the sitemap
 *  4. every canonical resolves to a page that exists in the build
 *
 * Any failure exits non-zero, so a broken deploy never reaches Google. The
 * cost of a false positive is a failed build; the cost of a miss is months of
 * misindexing that nobody notices.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT_DIRS = [".vercel/output/static", "dist/client", "dist"];
const SITE = "https://northvaleroofing.com";

/** Asset and non-page targets a link check has no business following. */
const ASSET_RE =
  /\.(css|js|mjs|png|jpe?g|webp|avif|gif|svg|ico|xml|txt|pdf|json|webmanifest|woff2?|ttf|eot|mp4|zip)$/i;
/** Routes rendered on demand (SSR), so they have no file in the static build. */
const DYNAMIC_PREFIXES = ["/api/", "/keystatic"];

function outDir() {
  const dir = OUT_DIRS.find((d) => existsSync(d));
  if (!dir) {
    console.error(`check-urls: no build output found (looked in ${OUT_DIRS.join(", ")})`);
    process.exit(1);
  }
  return dir;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** The URL path a built HTML file is served at, in directory form. */
function servedPath(file, root) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  return "/" + rel.replace(/index\.html$/, "").replace(/\.html$/, "");
}

const root = outDir();

const pages = new Map(); // served path -> { canonical, noindex }
const sitemapLocs = new Set();
const links = new Map(); // href -> Set of pages linking to it

for await (const file of walk(root)) {
  if (file.endsWith(".xml") && path.basename(file).startsWith("sitemap")) {
    const xml = await readFile(file, "utf8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      // A sitemap INDEX points at other sitemaps, not at pages.
      if (!/sitemap[^/]*\.xml$/.test(m[1])) sitemapLocs.add(m[1]);
    }
    continue;
  }
  if (!file.endsWith(".html")) continue;

  const html = await readFile(file, "utf8");
  // Not every .html file is a page: the Google Search Console verification file
  // is one line of plain text with an .html extension.
  if (!/<html[\s>]/i.test(html)) continue;
  const here = servedPath(file, root);
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
  pages.set(here, {
    canonical: canon ? canon[1] : null,
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
  });

  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    const href = m[1];
    if (!href.startsWith("/")) continue; // external, anchors, mailto:, tel:
    const clean = href.split("#")[0].split("?")[0];
    if (!clean || ASSET_RE.test(clean)) continue;
    if (DYNAMIC_PREFIXES.some((p) => clean.startsWith(p))) continue;
    if (!links.has(clean)) links.set(clean, new Set());
    links.get(clean).add(here);
  }
}

const canonicals = new Set([...pages.values()].map((p) => p.canonical).filter(Boolean));
const canonicalPaths = new Set([...canonicals].map((u) => u.replace(SITE, "") || "/"));

const failures = [];

// 1. Every sitemap URL must be a page's canonical.
for (const loc of sitemapLocs) {
  if (!canonicals.has(loc)) {
    failures.push(
      `sitemap lists ${loc}, which is not any page's canonical URL.\n` +
        `    The sitemap must only contain canonical URLs — see canonicalPath() in src/lib/routes.ts.`,
    );
  }
}

// 2. No noindex page may appear in the sitemap.
for (const [p, info] of pages) {
  if (info.noindex && info.canonical && sitemapLocs.has(info.canonical)) {
    failures.push(`${p} is noindex but IS in the sitemap. The quality gate should exclude it.`);
  }
}

// 3. Every canonical must resolve to a page that exists in this build.
for (const [p, info] of pages) {
  if (!info.canonical) {
    failures.push(`${p} has no <link rel="canonical">.`);
    continue;
  }
  const target = info.canonical.replace(SITE, "") || "/";
  const normalized = target.endsWith("/") ? target : target + "/";
  if (!pages.has(normalized) && !pages.has(target)) {
    failures.push(`${p} canonicalizes to ${info.canonical}, which is not a page in this build.`);
  }
}

// 4. Every internal link must point at a canonical URL.
for (const [href, from] of links) {
  const withSlash = href.endsWith("/") ? href : href + "/";
  const exists = pages.has(withSlash) || pages.has(href);
  if (!exists) {
    failures.push(
      `broken internal link: ${href} (linked from ${[...from].slice(0, 3).join(", ")}) — no such page.`,
    );
    continue;
  }
  if (!canonicalPaths.has(href)) {
    const real = pages.get(withSlash)?.canonical ?? pages.get(href)?.canonical;
    failures.push(
      `internal link ${href} is not the canonical form — that page canonicalizes to ${real}.\n` +
        `    Linked from: ${[...from].slice(0, 3).join(", ")}${from.size > 3 ? ` (+${from.size - 3} more)` : ""}\n` +
        `    Every internal link should point straight at the canonical URL, so Google never\n` +
        `    has to follow a duplicate to reach the real page.`,
    );
  }
}

if (failures.length) {
  console.error(`\nURL consistency check FAILED — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  console.error(
    `These are the conditions that put 52 pages into "Discovered - currently not\n` +
      `indexed" in November 2026. Fix them rather than skipping this check.\n`,
  );
  process.exit(1);
}

console.log(
  `urls: ${pages.size} pages · ${sitemapLocs.size} sitemap entries · ${links.size} internal link targets · all consistent`,
);
