/**
 * Single source of truth for which data-driven routes are indexable.
 *
 * Both the page (via its layout's `noindex`) and the sitemap (via the filter in
 * astro.config.mjs) read the SAME quality-gate verdict from here, so a page can
 * never be `noindex` on the page but still present in the sitemap (or vice
 * versa). When a record fails the gate, its path is excluded from the sitemap.
 *
 * Plain TS with no `astro:` imports so astro.config.mjs can import it at build.
 */
import { SERVICE_AREAS, SERVICE_AREA_SLUGS } from "./service-areas";
import { SERVICE_LIST } from "./services";
import { NEIGHBORHOODS } from "./neighborhoods";
import { CITY_SERVICES } from "./city-services";
import {
  evaluateArea,
  evaluateService,
  evaluateNeighborhood,
  evaluateCityService,
} from "./quality-gate";

/**
 * /team has no real people on it yet, so it renders `noindex` — but it was
 * still being listed in the sitemap, which tells Google the opposite. Those two
 * have to move together, so both the page and the sitemap filter read this one
 * flag. Flip it to true only when real names, roles and photos exist, never to
 * publish invented people (Hard Rule #2 / FTC).
 */
export const HAS_REAL_TEAM = false;

/** Utility pages excluded from search (mirror the Disallow rules in public/robots.txt). */
const STATIC_EXCLUDED = new Set(["/thank-you", ...(HAS_REAL_TEAM ? [] : ["/team"])]);

/**
 * Route prefixes whose DETAIL pages canonicalize WITH a trailing slash.
 * `/blog` and `/projects` (the index pages) do not — only `/blog/<post>/` and
 * `/projects/<slug>/` do.
 */
const TRAILING_SLASH_PREFIXES = ["/blog/", "/projects/"];

/**
 * The one true URL for a path — what goes in `<link rel="canonical">` AND in
 * the sitemap, so the two can never disagree.
 *
 * WHY THIS EXISTS (audit, 2026-11-12). The sitemap emitted every URL with a
 * trailing slash (Astro's `directory` build format), while 52 of 69 pages
 * declared a canonical WITHOUT one, and every internal link on the site used
 * the no-slash form. So the sitemap was advertising 52 addresses that the pages
 * themselves disowned. Google crawled a handful, saw the canonical pointing
 * elsewhere, filed them under "Alternate page with proper canonical tag", and
 * declined to crawl the rest — 52 URLs stuck in "Discovered - currently not
 * indexed", which buried any real indexing problem in noise.
 *
 * The rule below reproduces the EXISTING canonical of every page exactly, so
 * nothing that currently ranks moves. It is deliberately not a cleanup: making
 * the whole site consistent either way would relocate ~52 indexed URLs
 * (including /about and /the-woodlands/insurance-claims) for tidiness alone.
 * Mixed conventions are harmless once canonical, sitemap and links agree.
 */
export function canonicalPath(pathnameOrUrl: string): string {
  let path = pathnameOrUrl;
  try {
    path = new URL(pathnameOrUrl).pathname;
  } catch {
    // already a path
  }
  if (!path.startsWith("/")) path = `/${path}`;
  const bare = path.replace(/\/+$/, "");
  if (bare === "") return "/";
  const wantsSlash = TRAILING_SLASH_PREFIXES.some(
    (p) => bare.startsWith(p) && bare.length > p.length,
  );
  return wantsSlash ? `${bare}/` : bare;
}

export interface RouteStatus {
  path: string;
  indexable: boolean;
}

/** Indexability of every data-driven route (cities + services). */
export function dataRouteStatuses(): RouteStatus[] {
  const areas = SERVICE_AREA_SLUGS.map((slug) => ({
    path: `/${slug}`,
    indexable: evaluateArea(SERVICE_AREAS[slug]).indexable,
  }));
  const services = SERVICE_LIST.map((svc) => ({
    path: `/services/${svc.slug}`,
    indexable: evaluateService(svc).indexable,
  }));
  const neighborhoods = Object.values(NEIGHBORHOODS).map((n) => ({
    path: `/${n.citySlug}/${n.slug}`,
    indexable: evaluateNeighborhood(n).indexable,
  }));
  const cityServices = Object.values(CITY_SERVICES).map((cs) => ({
    path: `/${cs.citySlug}/${cs.slug}`,
    indexable: evaluateCityService(cs).indexable,
  }));
  return [...areas, ...services, ...neighborhoods, ...cityServices];
}

/** Set of absolute paths (no trailing slash) that must be kept OUT of the sitemap. */
export function noindexPaths(): Set<string> {
  return new Set(
    dataRouteStatuses()
      .filter((r) => !r.indexable)
      .map((r) => r.path),
  );
}

/** True if the given page URL/path is allowed in the sitemap. */
export function isAllowedInSitemap(pageUrlOrPath: string): boolean {
  let path = pageUrlOrPath;
  try {
    path = new URL(pageUrlOrPath).pathname;
  } catch {
    // already a path
  }
  path = path.replace(/\/+$/, "") || "/";
  if (noindexPaths().has(path)) return false;
  // Utility pages that should never be in search (kept in sync with robots.txt).
  if (STATIC_EXCLUDED.has(path)) return false;
  // Draft conventions.
  if (path.includes("/draft/") || path.includes("/_")) return false;
  return true;
}
