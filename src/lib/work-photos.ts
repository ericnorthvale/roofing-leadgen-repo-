/**
 * Real Northvale job photos, supplied by the owner (2026-08-01, two zips) and
 * optimized into /public/work. REAL WORK ONLY — never stock (Hard Rule #2).
 *
 * SCOPE (owner, 2026-11): this list is now PROCESS photography only — tear-off,
 * underlayment, protection, hand-nailing, inspection. The finished-roof drone
 * shots that used to live here were retired from the gallery, because the
 * project stories now carry the owner's own finished-roof photos and those lead
 * the gallery instead (see src/pages/gallery.astro). Keeping both sets meant two
 * competing answers to "what does a finished Northvale roof look like".
 *
 * Retired from the gallery but NOT deleted: work-04, work-06, work-08-during
 * and work-09-after. work-08-during/work-09-after are the same house and still
 * feed the homepage, services and city-page "See the difference" before/after
 * bands by direct path, so the files must stay.
 *
 * work-08-during was pulled by the owner (2026-11). Worth knowing if it is ever
 * considered again: the underlayment across that roof is printed with a
 * competitor's brand name, legible at full size. The no-competitor-brands test
 * reads text, not pixels, so nothing here would have flagged it.
 *
 * Alt text is deliberately city-neutral until the owner confirms each job's
 * location (then add it — city-anchored alts are stronger for local SEO).
 */
export interface WorkPhoto {
  src: string;
  alt: string;
}

export const WORK_PHOTOS: WorkPhoto[] = [
  {
    src: "/work/work-02.webp",
    alt: "Northvale Roofing crew mid tear-off on a single-story home",
  },
  {
    src: "/work/work-03.webp",
    alt: "Home and landscaping protected with tarps during a Northvale Roofing re-roof",
  },
  {
    src: "/work/work-01.webp",
    alt: "Northvale Roofing inspector walking a steep two-story roof",
  },
  {
    src: "/work/work-05.webp",
    alt: "Synthetic underlayment and starter course installed at a roof edge — install detail",
  },
  {
    src: "/work/work-07.webp",
    alt: "Roofer hand-nailing shingles during installation — close-up detail",
  },
];
