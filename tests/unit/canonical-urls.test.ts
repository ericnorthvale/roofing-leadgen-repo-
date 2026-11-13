/**
 * The sitemap and every page's <link rel="canonical"> must name the SAME URL.
 *
 * They diverged silently once (audit, 2026-11-12): Astro's `directory` build
 * format made the sitemap emit every URL with a trailing slash, while 52 of 69
 * pages canonicalized without one. Google treated those 52 sitemap entries as
 * addresses the pages disowned and left them in "Discovered - currently not
 * indexed" — which looked like an indexing failure and hid whether there was a
 * real one underneath.
 *
 * Both sides now derive from `canonicalPath`, so they cannot disagree by
 * construction. These tests pin the RULE itself, because the risk is no longer
 * a mismatch — it is someone "tidying up" the rule and relocating ~50 indexed
 * URLs in the process.
 */
import { describe, expect, it } from "vitest";
import { canonicalPath } from "../../src/lib/routes";
import { buildSeo } from "../../src/lib/seo";

const SITE = "https://northvaleroofing.com";

describe("canonicalPath", () => {
  it("keeps the homepage as a bare slash", () => {
    for (const input of ["/", "", "//"]) {
      expect(canonicalPath(input)).toBe("/");
    }
  });

  it("strips the trailing slash on ordinary pages", () => {
    const cases: [string, string][] = [
      ["/about/", "/about"],
      ["/about", "/about"],
      ["/the-woodlands/insurance-claims/", "/the-woodlands/insurance-claims"],
      ["/legal/privacy/", "/legal/privacy"],
      ["/services/roof-repair/", "/services/roof-repair"],
    ];
    for (const [input, expected] of cases) {
      expect(canonicalPath(input), input).toBe(expected);
    }
  });

  it("KEEPS the trailing slash on blog posts and project stories", () => {
    // These are already indexed in this form — /blog/iko-dynasty-vs-nordic/
    // alone carried 583 impressions in the 28 days before this fix. Dropping
    // the slash to make the site tidy would move them.
    const cases: [string, string][] = [
      ["/blog/iko-dynasty-vs-nordic/", "/blog/iko-dynasty-vs-nordic/"],
      ["/blog/iko-dynasty-vs-nordic", "/blog/iko-dynasty-vs-nordic/"],
      [
        "/projects/insurance-denial-approved-the-woodlands",
        "/projects/insurance-denial-approved-the-woodlands/",
      ],
    ];
    for (const [input, expected] of cases) {
      expect(canonicalPath(input), input).toBe(expected);
    }
  });

  it("treats the blog and projects INDEX pages as ordinary pages", () => {
    expect(canonicalPath("/blog/")).toBe("/blog");
    expect(canonicalPath("/projects/")).toBe("/projects");
  });

  it("accepts a full URL as well as a path", () => {
    expect(canonicalPath(`${SITE}/about/`)).toBe("/about");
    expect(canonicalPath(`${SITE}/blog/storm-damage-what-to-do/`)).toBe(
      "/blog/storm-damage-what-to-do/",
    );
  });

  it("is idempotent — applying it twice changes nothing", () => {
    const paths = ["/", "/about/", "/blog", "/blog/x/", "/projects/y", "/a/b/c/"];
    for (const p of paths) {
      expect(canonicalPath(canonicalPath(p)), p).toBe(canonicalPath(p));
    }
  });
});

describe("buildSeo emits the canonical form", () => {
  it("normalizes whatever pathname the page happened to pass", () => {
    const withSlash = buildSeo({ title: "t", description: "d", pathname: "/about/" }, SITE);
    const without = buildSeo({ title: "t", description: "d", pathname: "/about" }, SITE);
    expect(withSlash.canonical).toBe(`${SITE}/about`);
    expect(without.canonical).toBe(`${SITE}/about`);
  });

  it("preserves the trailing slash on a blog post", () => {
    const seo = buildSeo(
      { title: "t", description: "d", pathname: "/blog/iko-dynasty-vs-nordic/" },
      SITE,
    );
    expect(seo.canonical).toBe(`${SITE}/blog/iko-dynasty-vs-nordic/`);
  });

  it("leaves an absolute URL alone", () => {
    const seo = buildSeo(
      { title: "t", description: "d", pathname: "https://example.com/elsewhere" },
      SITE,
    );
    expect(seo.canonical).toBe("https://example.com/elsewhere");
  });
});
