/**
 * IKO-only guard. Northvale standardized its installed shingle line on IKO
 * (see docs/research-facts.md Sheet 1B). No published site content — data
 * models, pages, components, or blog posts — may name a competitor shingle
 * brand. This test fails loudly if a GAF/TAMKO/CertainTeed reference creeps back
 * into rendered content.
 *
 * Scope note: docs/research-facts.md deliberately retains the deprecated
 * competitor facts for historical reference and is NOT scanned; the astro.config
 * 301 redirect intentionally keeps the old slug and is NOT scanned.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Word-boundary patterns for competitor brands + their signature product/warranty
// names. IKO is the only shingle brand allowed in published content.
const FORBIDDEN = [
  /\bGAF\b/,
  /Timberline/,
  /TAMKO/,
  /Titan XT/,
  /CertainTeed/,
  /\bLandmark\b/,
  /WindProven/,
  /StainGuard/,
  /Golden Pledge/,
  /Silver Pledge/,
  /Master Elite/,
  /LayerLock/,
  /SureStart/,
];

// Content-bearing trees whose text renders to users.
const SCAN_DIRS = [
  "src/lib",
  "src/pages",
  "src/components",
  "src/layouts",
  "src/content/blog",
  "src/data",
];

const SCAN_EXT = new Set([".ts", ".astro", ".md", ".mdx", ".json"]);

function walk(dir: string): string[] {
  const abs = join(ROOT, dir);
  let out: string[] = [];
  for (const entry of readdirSync(abs)) {
    const full = join(abs, entry);
    if (statSync(full).isDirectory()) {
      out = out.concat(walk(join(dir, entry)));
    } else if (SCAN_EXT.has(entry.slice(entry.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

describe("IKO-only: no competitor shingle brands in published content", () => {
  const files = SCAN_DIRS.flatMap((d) => walk(d));

  it("scans a non-trivial number of content files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const pattern of FORBIDDEN) {
    it(`no published content matches ${pattern}`, () => {
      const hits: string[] = [];
      for (const file of files) {
        const text = readFileSync(file, "utf8");
        if (pattern.test(text)) hits.push(file.replace(ROOT, ""));
      }
      expect(hits, `Competitor brand ${pattern} found in: ${hits.join(", ")}`).toEqual([]);
    });
  }
});
