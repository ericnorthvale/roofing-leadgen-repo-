/**
 * Intrinsic size + responsive `srcset` for any image under /public.
 *
 * `scripts/optimize-images.mjs` measures every photo at build time and writes
 * `image-manifest.json`; this is the one place that reads it, so the Astro
 * wrapper (`RoofImage.astro`) and the React design-center studio agree on what
 * a given path is worth serving.
 *
 * Two things come out of it, and they fix two different problems:
 *
 *  - `width`/`height` — the intrinsic pixel size. Emitting them lets the
 *    browser reserve the box before the bytes arrive, which is what stops the
 *    page jumping as images load (Cumulative Layout Shift, a ranking signal).
 *    They are the INTRINSIC size, not the rendered one: CSS still decides how
 *    big the image draws, so they are safe on a `w-full`/`h-full` image.
 *  - `srcSet` — the down-scaled siblings the pipeline emitted, so a 272px
 *    gallery thumbnail stops downloading a 1MB photo.
 *
 * Unknown path (an SVG, an icon, anything outside the processed directories)
 * returns empty attributes rather than guessing.
 */
import manifest from "~/lib/image-manifest.json";

type Entry = { w: number; h: number; v?: number[]; c?: Record<string, number[]> };

const MANIFEST = manifest as Record<string, Entry>;

/** Variant files sit beside the original: foo.webp -> foo-800.webp */
function variantPath(src: string, width: number): string {
  return src.replace(/\.(webp|jpe?g|png)$/i, `-${width}.webp`);
}

/** Cropped variants carry their ratio: foo.webp -> foo-16x9-800.webp */
function cropPath(src: string, key: string, width: number): string {
  return src.replace(/\.(webp|jpe?g|png)$/i, `-${key}-${width}.webp`);
}

/** "16/9" -> "16x9", the form the pipeline writes into filenames. */
function ratioKey(ratio: string): string {
  return ratio.trim().replace("/", "x");
}

export interface ImageAttrs {
  width?: number;
  height?: number;
  srcSet?: string;
}

/**
 * `ratio` is the slot's aspect ratio ("16/9", "3/2", …) when it has a fixed
 * one. Pass it and the image is served from the matching CROPPED ladder.
 *
 * WHY THAT MATTERS (2026-11-24). Every slot on this site renders its photo with
 * `object-fit: cover`, so the browser already crops to the slot's ratio. It
 * just downloads the whole photo first. A 1200x2133 portrait painted into a 3:2
 * card threw away 74% of its bytes, and no width ladder can fix that — choosing
 * a narrower file scales the height down too, so the discarded proportion never
 * changes. Only a crop helps, and because the browser was performing exactly
 * this centre-crop anyway, the pre-cropped file is pixel-identical on screen.
 *
 * Unknown ratio, or a source already that shape, falls back to the plain width
 * ladder — so a wrong or missing `ratio` costs bytes, never correctness.
 */
export function imageAttrs(src: string, ratio?: string): ImageAttrs {
  const entry = MANIFEST[src];
  if (!entry) return {};

  const cropped = ratio ? entry.c?.[ratioKey(ratio)] : undefined;
  if (cropped?.length) {
    const [a, b] = ratioKey(ratio!).split("x").map(Number);
    const widest = cropped[cropped.length - 1];
    return {
      // Intrinsic size of the crop, so the reserved box matches what loads.
      width: widest,
      height: Math.round(widest / (a / b)),
      // No uncropped fallback: the ladder already tops out at the widest crop
      // the source can give, so a large viewport never reaches for the tall
      // original it would only crop again.
      srcSet: cropped.map((w) => `${cropPath(src, ratioKey(ratio!), w)} ${w}w`).join(", "),
    };
  }

  const srcSet = entry.v?.length
    ? [...entry.v.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${entry.w}w`].join(", ")
    : undefined;

  return { width: entry.w, height: entry.h, srcSet };
}
