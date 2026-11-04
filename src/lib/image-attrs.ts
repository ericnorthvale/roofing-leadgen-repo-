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

type Entry = { w: number; h: number; v?: number[] };

const MANIFEST = manifest as Record<string, Entry>;

/** Variant files sit beside the original: foo.webp -> foo-800.webp */
function variantPath(src: string, width: number): string {
  return src.replace(/\.(webp|jpe?g|png)$/i, `-${width}.webp`);
}

export interface ImageAttrs {
  width?: number;
  height?: number;
  srcSet?: string;
}

export function imageAttrs(src: string): ImageAttrs {
  const entry = MANIFEST[src];
  if (!entry) return {};

  const srcSet = entry.v?.length
    ? [...entry.v.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${entry.w}w`].join(", ")
    : undefined;

  return { width: entry.w, height: entry.h, srcSet };
}
