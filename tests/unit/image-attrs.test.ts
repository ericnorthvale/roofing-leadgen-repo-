import { describe, it, expect } from "vitest";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { imageAttrs } from "~/lib/image-attrs";
import manifest from "~/lib/image-manifest.json";

/**
 * Guard for the responsive image ladders.
 *
 * WHY (2026-11-24). Lighthouse failed `uses-responsive-images` on the homepage:
 * five images shipped far more pixels than they painted. Measuring at its exact
 * mobile profile (412px, DPR 2.625) found 826KB wasted on one page, from two
 * distinct causes:
 *
 *  1. ASPECT MISMATCH. Every slot renders `object-fit: cover` inside a fixed
 *     aspect-ratio box, so the browser ALREADY crops to that ratio — it just
 *     downloads the whole photo first. A 1200x2133 portrait in a 3:2 card threw
 *     away 74% of its bytes. No width ladder can fix that: a narrower file
 *     scales the height down too, so the discarded proportion never changes.
 *  2. LADDER GAP. A 92vw card needs 992 device pixels and the ladder jumped
 *     800 -> 1200, so every such card over-fetched by about a third.
 *
 * The fix is only safe because a pre-cropped file is pixel-identical to what
 * the browser was already showing — same centre crop, same composition. These
 * tests pin the parts of that which are easy to break silently.
 */

const MANIFEST = manifest as Record<
  string,
  { w: number; h: number; v?: number[]; c?: Record<string, number[]> }
>;

/** A real entry with a cropped ladder, so the tests bind to shipped data. */
const withCrop = Object.entries(MANIFEST).find(([, e]) => e.c && Object.keys(e.c).length);

describe("imageAttrs", () => {
  it("returns empty attributes for a path the manifest does not know", () => {
    expect(imageAttrs("/nope/not-a-real-image.webp")).toEqual({});
  });

  it("emits intrinsic width and height so the box is reserved before load", () => {
    const [src, entry] = Object.entries(MANIFEST)[0];
    const a = imageAttrs(src);
    expect(a.width).toBe(entry.w);
    expect(a.height).toBe(entry.h);
  });

  it("falls back to the plain width ladder when no ratio is asked for", () => {
    const [src, entry] = Object.entries(MANIFEST).find(([, e]) => e.v?.length)!;
    const a = imageAttrs(src);
    for (const w of entry.v!) expect(a.srcSet).toContain(`-${w}.webp ${w}w`);
    // The original is the last candidate, for a viewport wider than any variant.
    expect(a.srcSet).toContain(`${src} ${entry.w}w`);
  });

  it("serves a cropped ladder when the slot declares that ratio", () => {
    const [src, entry] = withCrop!;
    const key = Object.keys(entry.c!)[0];
    const a = imageAttrs(src, key.replace("x", "/"));
    expect(a.srcSet).toBeDefined();
    for (const w of entry.c![key]) expect(a.srcSet).toContain(`-${key}-${w}.webp ${w}w`);
  });

  it("reports the CROP's dimensions, so the reserved box matches what loads", () => {
    const [src, entry] = withCrop!;
    const key = Object.keys(entry.c!)[0];
    const [a1, b1] = key.split("x").map(Number);
    const a = imageAttrs(src, key.replace("x", "/"));
    expect(a.width! / a.height!).toBeCloseTo(a1 / b1, 2);
  });

  /**
   * The uncropped original is TALLER than the slot. Offering it as a candidate
   * would let a wide viewport pick the very file the crop exists to avoid.
   */
  it("never offers the uncropped original inside a cropped ladder", () => {
    const [src, entry] = withCrop!;
    const key = Object.keys(entry.c!)[0];
    const a = imageAttrs(src, key.replace("x", "/"));
    expect(a.srcSet).not.toContain(`${src} ${entry.w}w`);
  });

  it("falls back to the plain ladder for a ratio that has no crops", () => {
    const [src] = withCrop!;
    // A ratio no slot uses and the pipeline therefore never generated.
    const a = imageAttrs(src, "7/3");
    expect(a.srcSet).toContain(`${src} ${MANIFEST[src].w}w`);
  });

  it("accepts the ratio exactly as components write it, e.g. 16/9", () => {
    const entry = Object.entries(MANIFEST).find(([, e]) => e.c?.["16x9"]);
    if (!entry) return; // no 16:9 crops in this build
    expect(imageAttrs(entry[0], "16/9").srcSet).toContain("-16x9-");
  });
});

describe("every cropped variant the manifest promises exists on disk", () => {
  it("has a file for each crop width", () => {
    const missing: string[] = [];
    for (const [src, entry] of Object.entries(MANIFEST)) {
      for (const [key, widths] of Object.entries(entry.c ?? {})) {
        for (const w of widths) {
          const rel = src.replace(/\.(webp|jpe?g|png)$/i, `-${key}-${w}.webp`);
          const file = path.join(process.cwd(), "public", rel);
          // statSync, not readFileSync: this walks ~1,100 files and reading
          // each one's bytes took 8s of the suite for no extra assurance.
          try {
            statSync(file);
          } catch {
            missing.push(rel);
          }
        }
      }
    }
    expect(missing, `missing crop files:\n${missing.slice(0, 10).join("\n")}`).toEqual([]);
  });
});

describe("the ratios components declare are ones the pipeline can crop to", () => {
  /**
   * A slot asking for a ratio the pipeline never heard of is not an error — it
   * silently falls back to the uncropped ladder and quietly wastes the bytes
   * this whole change exists to save. That is exactly the kind of regression
   * nobody notices, so it is pinned.
   */
  it("every ratio= prop in src/ is one scripts/optimize-images.mjs defines", () => {
    const pipeline = readFileSync(path.join(process.cwd(), "scripts/optimize-images.mjs"), "utf8");
    const known = new Set([...pipeline.matchAll(/"(\d+x\d+)":\s*\d/g)].map((m) => m[1]));
    expect(known.size).toBeGreaterThan(0);

    const srcDir = path.join(process.cwd(), "src");
    const declared = new Set<string>();
    const walk = (dir: string) => {
      for (const e of require("node:fs").readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(astro|tsx|ts)$/.test(e.name)) {
          const text = readFileSync(full, "utf8");
          // ratio="16/9" on a component, and imageAttrs(src, "4/3") in React.
          for (const m of text.matchAll(/ratio="(\d+)\/(\d+)"/g)) declared.add(`${m[1]}x${m[2]}`);
          for (const m of text.matchAll(/imageAttrs\([^,)]+,\s*"(\d+)\/(\d+)"/g))
            declared.add(`${m[1]}x${m[2]}`);
        }
      }
    };
    walk(srcDir);

    const unknown = [...declared].filter((r) => !known.has(r));
    expect(
      unknown,
      `these slot ratios have no entry in RATIOS, so they silently fall back ` +
        `to the uncropped ladder: ${unknown.join(", ")}`,
    ).toEqual([]);
  });
});
