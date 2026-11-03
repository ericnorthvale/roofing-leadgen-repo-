/**
 * Real Northvale job photos, supplied by the owner and optimized into
 * /public/work. REAL WORK ONLY — never stock (Hard Rule #2).
 *
 * The first seven are a single job documented end to end (owner, 2026-11):
 * tear-off to bare deck, valley membrane on the fresh deck, underlayment, then
 * the finished roof from three angles. They lead the work photos because one
 * job shown start to finish is more convincing than seven unrelated roofs, and
 * because the first and fifth are the same house from the same spot in the
 * driveway — that pair feeds the "See the difference" bands.
 *
 * The owner confirmed all three completed shots are the NEW roof; there is no
 * photograph of the old roof in this set, so the bands are captioned "tear-off
 * to deck" / "completed" rather than before/after. Captioning an in-progress
 * photo as a "before" would be a fabricated comparison.
 *
 * BRAND CHECK, every time: these were inspected at full zoom before use. The
 * underlayment printing is not legible and the valley membrane carries no
 * visible brand. This matters — work-08-during was retired precisely because a
 * competitor's name was readable across its underlayment, and the
 * no-competitor-brands test reads source text, not image pixels. Nothing in CI
 * will catch the next one either.
 *
 * Retired from the gallery but NOT deleted: work-04, work-06, work-08-during
 * and work-09-after. work-09-after is still the hero photo on the Woodlands
 * replacement city-service page, so that file remains in use. work-08-during is
 * now unused sitewide.
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
    src: "/work/roof-tear-off-to-deck.webp",
    alt: "Red-brick home stripped to bare roof decking during a Northvale Roofing tear-off, ladders up and the debris trailer in the driveway",
  },
  {
    src: "/work/roof-deck-valley-membrane.webp",
    alt: "Valley membrane set into fresh roof decking before shingles go on — install detail",
  },
  {
    src: "/work/valley-membrane-install-detail.webp",
    alt: "Northvale Roofing crew installing valley membrane over new roof decking",
  },
  {
    src: "/work/synthetic-underlayment-installed.webp",
    alt: "Synthetic underlayment laid across the new decking as the Northvale Roofing crew begins shingling",
  },
  {
    src: "/work/completed-roof-front-elevation.webp",
    alt: "The same red-brick home with its roof replacement completed, seen from the driveway",
  },
  {
    src: "/work/completed-shingle-roof-brick-home.webp",
    alt: "Completed charcoal architectural shingle roof on a red-brick home with arched entryways",
  },
  {
    src: "/work/completed-shingle-roof-rear-elevation.webp",
    alt: "Completed charcoal shingle roof above the rear covered patio, ridge cap and chimney finished",
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
