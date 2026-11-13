/**
 * Real `lastmod` dates for the sitemap.
 *
 * WHY (audit, 2026-11-12): the sitemap stamped `new Date()` on every URL at
 * every build, so each deploy told Google all 68 pages had just changed. That
 * is not a small inaccuracy — Google only leans on `lastmod` when a site is
 * consistently honest about it, and a site that claims everything changed on
 * every deploy teaches Google to ignore the field entirely. The cost lands
 * later: publish one genuinely new blog post and the signal that says "this one
 * is new" is already worthless.
 *
 * So: a real date where one exists, and NO date where one doesn't. `lastmod` is
 * optional in the sitemaps protocol, and silence is more useful to Google than
 * a number it has learned to distrust.
 *
 * Blog posts and project stories carry real dates in their own content, which
 * is also the only place on this site that tracks when a page's substance
 * changed. Everything else — service pages, city pages, villages — is rendered
 * from data files with no per-page date, so those entries ship without one.
 *
 * Plain fs + regex, no `astro:content`, so astro.config.mjs can import it.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const BLOG_DIR = "src/content/blog";
const PROJECT_DIR = "src/content/projects";

/** Pull one scalar out of a YAML frontmatter block. Quotes optional. */
function frontmatterField(source, field) {
  const fm = source.startsWith("---") ? source.split("---")[1] : "";
  const m = fm.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

function isoDay(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Map of canonical path -> YYYY-MM-DD, for the pages that have a real date. */
export function contentLastmod() {
  const dates = new Map();

  if (existsSync(BLOG_DIR)) {
    for (const file of readdirSync(BLOG_DIR)) {
      if (!/\.mdx?$/.test(file)) continue;
      const src = readFileSync(path.join(BLOG_DIR, file), "utf8");
      if (frontmatterField(src, "status") !== "published") continue;
      // An updated post is genuinely newer than its publication date.
      const day = isoDay(frontmatterField(src, "updatedDate") ?? frontmatterField(src, "pubDate"));
      if (day) dates.set(`/blog/${file.replace(/\.mdx?$/, "")}/`, day);
    }
  }

  if (existsSync(PROJECT_DIR)) {
    for (const file of readdirSync(PROJECT_DIR)) {
      if (!file.endsWith(".json")) continue;
      let data;
      try {
        data = JSON.parse(readFileSync(path.join(PROJECT_DIR, file), "utf8"));
      } catch {
        continue; // a malformed story is the content build's problem, not the sitemap's
      }
      if (data.status !== "published") continue;
      const day = isoDay(data.updatedDate ?? data.date);
      if (day) dates.set(`/projects/${file.replace(/\.json$/, "")}/`, day);
    }
  }

  return dates;
}
