import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ISR_EXCLUDE } from "~/lib/routes";

/**
 * Every server-rendered page must be excluded from the ISR cache.
 *
 * WHY THIS TEST EXISTS. A page that decides what to render from the request —
 * a cookie, a header, a query parameter — cannot be cached at the CDN, because
 * the CDN will hand the first visitor's copy to everyone after them. It has
 * caught this project out twice: once on the Keystatic admin (PR #10), and
 * again when the crew estimator shipped, where the code screen was cached and
 * so entering the right code dropped the rep straight back on a logged-out
 * page. It presented as a dead button, and because it tracked the cache rather
 * than the code it came and went, which is what made it expensive to find.
 *
 * Nothing else in the suite can see it. The unit tests pass, the browser tests
 * pass against a dev server that has no CDN in front of it, the build is
 * clean — the bug exists only in the gap between a page's own declaration and
 * a list in the Astro config. So this test closes that gap by reading both.
 *
 * IT DELIBERATELY SCANS THE FILESYSTEM rather than taking a hardcoded list.
 * A hardcoded list would need updating by exactly the person who already
 * forgot to update the other one.
 */

const PAGES_DIR = path.join(process.cwd(), "src/pages");

/** Every page file that opts out of prerendering. */
function serverRenderedRoutes(): string[] {
  const found: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(astro|ts|js)$/.test(entry.name)) continue;
      const source = fs.readFileSync(full, "utf8");
      // `export const prerender = false`, however it is spaced.
      if (!/export\s+const\s+prerender\s*=\s*false/.test(source)) continue;

      const route =
        "/" +
        path
          .relative(PAGES_DIR, full)
          .replace(/\\/g, "/")
          .replace(/\.(astro|ts|js)$/, "")
          .replace(/\/index$/, "");
      found.push(route);
    }
  };

  walk(PAGES_DIR);
  return found.sort();
}

describe("ISR exclusions", () => {
  const routes = serverRenderedRoutes();

  it("finds the server-rendered pages at all (guards the scanner itself)", () => {
    // If the scan silently returned nothing, every assertion below would pass
    // while checking nothing — the failure mode that makes a test worthless.
    expect(routes.length).toBeGreaterThan(5);
    expect(routes).toContain("/estimator");
    expect(routes).toContain("/api/lead");
  });

  for (const route of routes) {
    it(`never ISR-caches ${route}`, () => {
      const covered = ISR_EXCLUDE.some((pattern) => pattern.test(route));
      expect(
        covered,
        `${route} declares prerender = false but no ISR_EXCLUDE pattern matches it. ` +
          `Vercel's CDN would cache one visitor's copy and serve it to everyone. ` +
          `Add a pattern to ISR_EXCLUDE in src/lib/routes.ts.`,
      ).toBe(true);
    });
  }

  it("does not exclude the static content pages, which should be cached", () => {
    // The other half of the bargain: over-excluding would quietly drop ISR for
    // the pages whose whole performance story is being served from the edge.
    for (const page of ["/", "/about", "/services", "/blog", "/the-woodlands", "/contact"]) {
      expect(ISR_EXCLUDE.some((p) => p.test(page))).toBe(false);
    }
  });
});
