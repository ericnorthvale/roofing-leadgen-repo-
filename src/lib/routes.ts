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
import { evaluateArea, evaluateService } from "./quality-gate";

/** Utility pages excluded from search (mirror the Disallow rules in public/robots.txt). */
const STATIC_EXCLUDED = new Set(["/thank-you"]);

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
  return [...areas, ...services];
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
