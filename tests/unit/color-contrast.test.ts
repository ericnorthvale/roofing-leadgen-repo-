import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Colour-contrast guard for the design tokens.
 *
 * WHY (2026-11-24). Lighthouse's colour-contrast audit failed on every page it
 * checked, and the cause was one token: `--color-ink-500` at #6e727c scored
 * 4.425 against the sand surface — under WCAG AA's 4.5 by less than a
 * hundredth. Widening the sweep found a second: Gold Deep, the colour the
 * brand guidelines explicitly name as THE gold allowed for text on light,
 * measured 3.94 on cream.
 *
 * Both were invisible to every other check. The build passed, the site looked
 * fine, and the numbers were a rounding error away from correct. That is
 * precisely the kind of thing a person never re-measures by hand, so it is
 * pinned here instead.
 *
 * MEASURE AGAINST CREAM, NOT WHITE. The brand guidelines recorded ratios on
 * white only, which is exactly how Gold Deep shipped failing: 4.60 on white,
 * 3.94 on cream. Cream is the darkest light surface in the system, so it is
 * the one that decides.
 */

const CSS = readFileSync(path.join(process.cwd(), "src/styles/globals.css"), "utf8");

function token(name: string): string {
  const m = CSS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --color-${name} not found in globals.css`);
  return m[1];
}

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const s = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(rgb(a)), luminance(rgb(b))];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** The light surfaces text actually sits on. Cream is the darkest, so it rules. */
const SURFACES = {
  white: "#ffffff",
  ivory: token("surface-ivory"),
  cream: token("surface-cream"),
};

const AA_BODY = 4.5;
const AA_LARGE = 3;

describe("design tokens meet WCAG AA on every light surface", () => {
  /** Tokens used for body-size text. All must clear 4.5 on the worst surface. */
  const BODY_TEXT_TOKENS = ["ink-500", "ink-700", "ink-800", "ink-900", "gold-600"];

  for (const name of BODY_TEXT_TOKENS) {
    for (const [surfaceName, surface] of Object.entries(SURFACES)) {
      it(`${name} on ${surfaceName} is at least ${AA_BODY}:1`, () => {
        const ratio = contrast(token(name), surface);
        expect(
          ratio,
          `--color-${name} (${token(name)}) on ${surfaceName} (${surface}) = ${ratio.toFixed(3)}`,
        ).toBeGreaterThanOrEqual(AA_BODY);
      });
    }
  }

  it("gold-400 is NOT used for small text on light — it cannot pass", () => {
    // Pinned as a reminder rather than a failure: the brand rule exists
    // because this value genuinely cannot clear AA on a light surface.
    expect(contrast(token("gold-400"), SURFACES.white)).toBeLessThan(AA_BODY);
  });

  it("gold-500 clears the large-text bar it is permitted for", () => {
    expect(contrast(token("gold-500"), SURFACES.cream)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it("white text on the gold-600 button fill clears AA", () => {
    expect(contrast("#ffffff", token("gold-600"))).toBeGreaterThanOrEqual(AA_BODY);
  });

  it("cream really is the darkest light surface, so it is the right one to test", () => {
    const lums = Object.values(SURFACES).map((s) => luminance(rgb(s)));
    expect(Math.min(...lums)).toBe(luminance(rgb(SURFACES.cream)));
  });
});
