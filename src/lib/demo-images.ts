/**
 * ⚠️ DEMO / PREVIEW IMAGES — NOT REAL NORTHVALE WORK. ⚠️
 *
 * These are royalty-free stock photos (Pexels/Unsplash License: commercial use,
 * no attribution required — see public/placeholders/CREDITS.md) wired into the
 * ImagePlaceholder slots so the owner can FEEL the design before real photography
 * exists. They are illustrative only.
 *
 * BEFORE LAUNCH (required by FTC + repo hard rules): set USE_DEMO_IMAGES = false
 * (or delete public/placeholders/) and replace each slot with a REAL Northvale
 * photo via the `src` prop. Showing stock in the before/after and "recent work"
 * sections as if they were our jobs is illegal and off-brand.
 *
 * Flipping the one flag below reverts the entire site to the branded placeholder
 * boxes — a single, reversible kill-switch.
 */
export const USE_DEMO_IMAGES = true;

/** Stable slot key → image path under /public. */
export const DEMO_IMAGES: Record<string, string> = {
  hero: "/placeholders/hero.jpg",

  // Service cards (home + /services loop, keyed by serviceTag as svc-<tag>)
  "svc-replacement": "/placeholders/svc-replacement.jpg",
  "svc-repair": "/placeholders/svc-repair.jpg",
  "svc-inspection": "/placeholders/svc-inspection.jpg",
  "svc-storm": "/placeholders/svc-storm.jpg",
  "svc-insurance": "/placeholders/svc-insurance.jpg",
  neighborhood: "/placeholders/neighborhood.jpg",

  // Before / after bands (home, roof-replacement, storm-damage)
  before: "/placeholders/before.jpg",
  after: "/placeholders/after.jpg",

  // Crew / truck strips (home, about)
  "crew-pm": "/placeholders/crew-pm.jpg",
  "crew-foreman": "/placeholders/crew-foreman.jpg",
  "crew-install": "/placeholders/crew-install.jpg",
  truck: "/placeholders/truck.jpg",

  // The Woodlands flagship gallery
  "work-1": "/placeholders/work-1.jpg",
  "work-2": "/placeholders/work-2.jpg",
  "work-3": "/placeholders/work-3.jpg",
  "work-4": "/placeholders/work-4.jpg",
};

/**
 * Resolve a demo image path for a slot key. Returns undefined when demo images
 * are disabled or the key is unknown, so the caller falls back to the branded
 * placeholder box.
 */
export function demoSrc(key?: string): string | undefined {
  if (!USE_DEMO_IMAGES || !key) return undefined;
  return DEMO_IMAGES[key];
}
