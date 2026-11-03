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
 * Alt text is city-neutral until the owner confirms a job's location, then it
 * gets anchored — city-anchored alts are stronger for local SEO. The owner
 * confirmed (2026-11) that the seven-photo job above is in THE WOODLANDS, TX,
 * so those carry the city in both filename and alt. work-01 through work-07
 * remain neutral: their locations are still unconfirmed, and guessing a city to
 * win a keyword would be inventing a fact about a real customer's home.
 */
export interface WorkPhoto {
  src: string;
  /** Screen-reader + image-search description of what is actually in frame. */
  alt: string;
  /**
   * Short unique headline. Rendered as the `title` attribute and as the
   * `name` of the image's ImageObject in the gallery's structured data, so no
   * two photos should share one (owner, 2026-11).
   */
  title?: string;
  /** One sentence of context — the ImageObject `description`. */
  description?: string;
  /** Keywords for the ImageObject. Specific beats many. */
  tags?: string[];
}

export const WORK_PHOTOS: WorkPhoto[] = [
  {
    src: "/work/roof-tear-off-to-deck-the-woodlands-tx.webp",
    title: "Stripped to bare deck",
    alt: "Red-brick home in The Woodlands, TX stripped to bare roof decking during a Northvale Roofing tear-off, ladders up and the debris trailer in the driveway",
    description:
      "A full tear-off to the deck in The Woodlands — no layovers, so nothing stays hidden under the new roof.",
    tags: ["roof tear-off", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/roof-deck-valley-membrane-the-woodlands-tx.webp",
    title: "Valley membrane on fresh deck",
    alt: "Valley membrane set into fresh roof decking on a roof replacement in The Woodlands, TX — install detail",
    description:
      "Valleys carry the most water on a roof, so the membrane goes in before anything else.",
    tags: ["roof valley", "valley membrane", "roof decking", "The Woodlands TX"],
  },
  {
    src: "/work/valley-membrane-install-the-woodlands-tx.webp",
    title: "Setting the valley membrane",
    alt: "Northvale Roofing crew installing valley membrane over new roof decking in The Woodlands, TX",
    description:
      "The crew bedding the valley membrane onto new decking before the underlayment goes down.",
    tags: ["valley membrane", "roofing crew", "roof installation", "The Woodlands TX"],
  },
  {
    src: "/work/synthetic-underlayment-the-woodlands-tx.webp",
    title: "Underlayment down, shingling begins",
    alt: "Synthetic underlayment laid across the new decking as the Northvale Roofing crew begins shingling in The Woodlands, TX",
    description:
      "Synthetic underlayment across the whole deck, with the first courses of shingle going on behind it.",
    tags: ["synthetic underlayment", "roof installation", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-the-woodlands-tx.webp",
    title: "The same roof, completed",
    alt: "The same red-brick home in The Woodlands, TX with its roof replacement completed, seen from the driveway",
    description:
      "The finished roof photographed from the same spot in the driveway as the tear-off shot.",
    tags: ["completed roof replacement", "before and after", "The Woodlands TX"],
  },
  {
    src: "/work/completed-shingle-roof-brick-home-the-woodlands-tx.webp",
    title: "Finished roof over the arched entry",
    alt: "Completed charcoal architectural shingle roof on a red-brick home with arched entryways in The Woodlands, TX",
    description: "Charcoal architectural shingle finished over the arched brick entry.",
    tags: ["architectural shingles", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-rear-elevation-the-woodlands-tx.webp",
    title: "Rear elevation, ridge cap finished",
    alt: "Completed charcoal shingle roof above the rear covered patio of a home in The Woodlands, TX, ridge cap and chimney finished",
    description: "Ridge cap, chimney and the run over the covered patio, all finished.",
    tags: ["ridge cap", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/tear-off-crew-removing-shingles-the-woodlands-tx.webp",
    title: "Tear-off, shingle by shingle",
    alt: "Northvale Roofing crew member shovelling old shingles off a roof during a tear-off in The Woodlands, TX",
    description:
      "Tear-off is done by hand down to the deck so the sheathing underneath can actually be inspected.",
    tags: ["roof tear-off", "roofing crew", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/rotted-roof-decking-exposed-the-woodlands-tx.webp",
    title: "Rotted decking under the old roof",
    alt: "Rotted roof decking and exposed rafters revealed after tear-off on a home in The Woodlands, TX",
    description:
      "Decking rot like this is invisible from the ground and from the air — it only shows once the old roof is off, which is exactly why no measurement can price it.",
    tags: ["rotted roof decking", "deck replacement", "roof tear-off", "The Woodlands TX"],
  },
  {
    src: "/work/full-roof-redeck-the-woodlands-tx.webp",
    title: "A full re-deck before the new roof",
    alt: "Roof fully re-sheathed with new decking, trailer and ladders on site, on a home in The Woodlands, TX",
    description:
      "The entire roof re-sheathed in new decking before a single square of underlayment goes down.",
    tags: ["roof decking", "re-deck", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/new-roof-decking-installed-the-woodlands-tx.webp",
    title: "Fresh decking, crew setting out",
    alt: "Northvale Roofing crew on newly installed roof decking with underlayment ready to roll out, The Woodlands, TX",
    description:
      "New decking down and the crew setting out along the ridge, ready for underlayment.",
    tags: ["roof decking", "roof installation", "roofing crew", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-brick-home-the-woodlands-tx.webp",
    title: "Completed roof, brick and stucco home",
    alt: "Completed architectural shingle roof on a brick and cream stucco home in The Woodlands, TX",
    description:
      "The finished roof on a single-storey brick home, clean lines through the hips and ridges.",
    tags: ["completed roof replacement", "architectural shingles", "The Woodlands TX"],
  },
  {
    src: "/work/completed-shingle-roof-vents-the-woodlands-tx.webp",
    title: "Finished roof with the ventilation set",
    alt: "Completed grey architectural shingle roof with ridge vent, pipe boots and a box vent, in The Woodlands, TX",
    description: "Ridge vent, pipe boots and a box vent all set and sealed on the finished roof.",
    tags: ["roof ventilation", "ridge vent", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-brick-ranch-the-woodlands-tx.webp",
    title: "Completed roof on a brick ranch",
    alt: "Completed dark shingle roof on a long single-storey brick ranch home, ladder still set, The Woodlands, TX",
    description:
      "A long ranch roofline finished end to end, photographed before the ladders came down.",
    tags: ["completed roof replacement", "ranch home roof", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-ranch-home-the-woodlands-tx.webp",
    title: "Evening light on a finished ranch roof",
    alt: "Completed shingle roof on a brick ranch home with green shutters at golden hour, The Woodlands, TX",
    description: "The same long ranch roofline at the end of the day, with the crew packing up.",
    tags: ["completed roof replacement", "ranch home roof", "The Woodlands TX"],
  },
  {
    src: "/work/roof-vent-and-pipe-boot-detail-the-woodlands-tx.webp",
    title: "Vent stack and pipe boots, sealed",
    alt: "Roof vent stack, sealed pipe boots and ridge vent on a completed shingle roof in The Woodlands, TX",
    description:
      "Penetrations are where roofs leak. Every stack and boot gets new flashing and a sealed collar.",
    tags: ["pipe boot", "roof vent", "roof flashing", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-aerial-patio-cover-the-woodlands-tx.webp",
    title: "Where the roof meets a patio cover",
    alt: "Aerial view of a completed shingle roof meeting a metal patio cover, crew finishing the valley, The Woodlands, TX",
    description:
      "Where a shingle roof meets a metal patio cover, the valley and the flashing decide whether it leaks.",
    tags: ["roof valley", "patio cover flashing", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-ridge-vent-aerial-the-woodlands-tx.webp",
    title: "Ridge vent running the full ridge",
    alt: "Aerial view of a completed shingle roof with continuous ridge vent, turbine and pipe boots, The Woodlands, TX",
    description:
      "A continuous ridge vent run end to end — which only works if the intake at the eaves matches it.",
    tags: ["ridge vent", "attic ventilation", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/hip-roof-and-chimney-brick-home-the-woodlands-tx.webp",
    title: "Hip roof and chimney flashing",
    alt: "Hip roof meeting a brick chimney with a metal cap on a home in The Woodlands, TX",
    description:
      "A chimney is one of the few places a roof has to stop and start again, so the flashing there is checked on every job.",
    tags: ["chimney flashing", "hip roof", "roof inspection", "The Woodlands TX"],
  },
  {
    src: "/work/roofline-at-sunrise-the-woodlands-tx.webp",
    title: "Early start on a Woodlands roof",
    alt: "Sun rising behind the roofline of a brick home at the start of a roofing day in The Woodlands, TX",
    description:
      "Crews start at first light through the Texas summer so most of the tear-off is done before the heat sets in.",
    tags: ["roofing crew", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/work-02.webp",
    title: "Mid tear-off on a single-storey home",
    alt: "Northvale Roofing crew mid tear-off on a single-story home",
    description: "Tear-off underway, old shingles coming off down to the deck.",
    tags: ["roof tear-off", "roofing crew"],
  },
  {
    src: "/work/work-03.webp",
    title: "Landscaping tarped before work starts",
    alt: "Home and landscaping protected with tarps during a Northvale Roofing re-roof",
    description: "Beds, shrubs and walls go under tarps before the first shingle comes off.",
    tags: ["site protection", "roof replacement"],
  },
  {
    src: "/work/work-01.webp",
    title: "Inspecting a steep two-storey roof",
    alt: "Northvale Roofing inspector walking a steep two-story roof",
    description: "Every inspection is walked, not flown — steep roofs included.",
    tags: ["roof inspection", "steep roof"],
  },
  {
    src: "/work/work-05.webp",
    title: "Starter course at the roof edge",
    alt: "Synthetic underlayment and starter course installed at a roof edge — install detail",
    description: "Underlayment and the starter course set at the eave, where wind uplift starts.",
    tags: ["starter course", "synthetic underlayment", "install detail"],
  },
  {
    src: "/work/work-07.webp",
    title: "Hand-nailing the field shingles",
    alt: "Roofer hand-nailing shingles during installation — close-up detail",
    description: "Hand-nailing keeps every fastener in the nail line and at the right depth.",
    tags: ["hand nailing", "shingle installation", "install detail"],
  },
];
