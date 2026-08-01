/**
 * Real Northvale job photos, supplied by the owner (2026-08-01, two zips) and
 * optimized into /public/work. REAL WORK ONLY — never stock (Hard Rule #2).
 *
 * Alt text is deliberately city-neutral until the owner confirms each job's
 * location (then add it — city-anchored alts are stronger for local SEO).
 * work-06 has the home's street number blurred for the homeowner's privacy.
 * work-08/09 are the same house (drone, mid-install → completed) and also
 * feed the homepage "See the difference" band.
 */
export interface WorkPhoto {
  src: string;
  alt: string;
}

export const WORK_PHOTOS: WorkPhoto[] = [
  {
    src: "/work/work-09-after.webp",
    alt: "Drone view of a completed shingle roof replacement by Northvale Roofing",
  },
  {
    src: "/work/work-04.webp",
    alt: "Completed roof replacement in dark architectural shingle on a red-brick Houston-area home",
  },
  {
    src: "/work/work-06.webp",
    alt: "Completed roof replacement on a two-story home beneath a mature oak tree",
  },
  {
    src: "/work/work-08-during.webp",
    alt: "Northvale Roofing crew installing synthetic underlayment during a roof replacement, seen from above",
  },
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
