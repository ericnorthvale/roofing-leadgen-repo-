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
 * LOCATIONS ARE NOW ALL CONFIRMED (owner, 2026-11). The twenty photos above are
 * THE WOODLANDS, TX jobs; the five below are, in his words, "just generic
 * Houston roofs", so they are anchored to the Houston AREA and no further —
 * that is as precise as he was and as precise as the photos support.
 *
 * The rule that got us here still stands for anything new: a location goes in
 * only when the owner states it. Guessing a city to win a keyword would be
 * inventing a fact about a real customer's home.
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
    title: "Stripped to bare deck in The Woodlands",
    alt: "Red-brick home in The Woodlands, TX stripped to bare roof decking during a Northvale Roofing tear-off, ladders up and the debris trailer in the driveway",
    description:
      "A full tear-off to the deck on a roof replacement in The Woodlands, TX — no layovers, so nothing stays hidden under the new roof.",
    tags: ["roof tear-off", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/roof-deck-valley-membrane-the-woodlands-tx.webp",
    title: "Valley membrane on fresh deck, The Woodlands",
    alt: "Valley membrane set into fresh roof decking on a roof replacement in The Woodlands, TX — install detail",
    description:
      "Valleys carry the most water on a roof, so on this Woodlands, TX replacement the membrane went in before anything else.",
    tags: ["roof valley", "valley membrane", "roof decking", "The Woodlands TX"],
  },
  {
    src: "/work/valley-membrane-install-the-woodlands-tx.webp",
    title: "Setting a valley membrane in The Woodlands",
    alt: "Northvale Roofing crew installing valley membrane over new roof decking in The Woodlands, TX",
    description:
      "The crew bedding valley membrane onto new decking on a roof replacement in The Woodlands, TX.",
    tags: ["valley membrane", "roofing crew", "roof installation", "The Woodlands TX"],
  },
  {
    src: "/work/synthetic-underlayment-the-woodlands-tx.webp",
    title: "Underlayment down on a Woodlands re-roof",
    alt: "Synthetic underlayment laid across the new decking as the Northvale Roofing crew begins shingling in The Woodlands, TX",
    description:
      "Synthetic underlayment across the whole deck of a home in The Woodlands, TX, with the first courses of shingle going on behind it.",
    tags: ["synthetic underlayment", "roof installation", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-the-woodlands-tx.webp",
    title: "The same Woodlands roof, completed",
    alt: "The same red-brick home in The Woodlands, TX with its roof replacement completed, seen from the driveway",
    description:
      "The finished roof on this Woodlands, TX home, photographed from the same spot in the driveway as the tear-off shot.",
    tags: ["completed roof replacement", "before and after", "The Woodlands TX"],
  },
  {
    src: "/work/completed-shingle-roof-brick-home-the-woodlands-tx.webp",
    title: "Finished roof over an arched entry, The Woodlands",
    alt: "Completed charcoal architectural shingle roof on a red-brick home with arched entryways in The Woodlands, TX",
    description:
      "Charcoal architectural shingle finished over the arched brick entry of a home in The Woodlands, TX.",
    tags: ["architectural shingles", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-rear-elevation-the-woodlands-tx.webp",
    title: "Rear elevation finished, The Woodlands",
    alt: "Completed charcoal shingle roof above the rear covered patio of a home in The Woodlands, TX, ridge cap and chimney finished",
    description:
      "Ridge cap, chimney and the run over the covered patio, all finished on this Woodlands, TX roof.",
    tags: ["ridge cap", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/tear-off-crew-removing-shingles-the-woodlands-tx.webp",
    title: "Tear-off by hand in The Woodlands",
    alt: "Northvale Roofing crew member shovelling old shingles off a roof during a tear-off in The Woodlands, TX",
    description:
      "Tear-off on this Woodlands, TX roof was done by hand down to the deck so the sheathing underneath could actually be inspected.",
    tags: ["roof tear-off", "roofing crew", "Houston TX", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/rotted-roof-decking-exposed-the-woodlands-tx.webp",
    title: "Rotted decking found on a Woodlands roof",
    alt: "Rotted roof decking and exposed rafters revealed after tear-off on a home in The Woodlands, TX",
    description:
      "Decking rot like this on a Woodlands, TX roof is invisible from the ground and from the air — it only shows once the old roof is off, which is exactly why no measurement can price it.",
    tags: ["rotted roof decking", "deck replacement", "roof tear-off", "The Woodlands TX"],
  },
  {
    src: "/work/full-roof-redeck-the-woodlands-tx.webp",
    title: "A full re-deck in The Woodlands",
    alt: "Roof fully re-sheathed with new decking, trailer and ladders on site, on a home in The Woodlands, TX",
    description:
      "The entire roof of this Woodlands, TX home re-sheathed in new decking before a single square of underlayment goes down.",
    tags: ["roof decking", "re-deck", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/new-roof-decking-installed-the-woodlands-tx.webp",
    title: "Fresh decking on a Woodlands re-roof",
    alt: "Northvale Roofing crew on newly installed roof decking with underlayment ready to roll out, The Woodlands, TX",
    description:
      "New decking down on a Woodlands, TX replacement and the crew setting out along the ridge, ready for underlayment.",
    tags: ["roof decking", "roof installation", "roofing crew", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-brick-home-the-woodlands-tx.webp",
    title: "Completed brick-and-stucco roof, The Woodlands",
    alt: "Completed architectural shingle roof on a brick and cream stucco home in The Woodlands, TX",
    description:
      "The finished roof on a single-storey brick home in The Woodlands, TX, clean lines through the hips and ridges.",
    tags: ["completed roof replacement", "architectural shingles", "The Woodlands TX"],
  },
  {
    src: "/work/completed-shingle-roof-vents-the-woodlands-tx.webp",
    title: "Ventilation set on a Woodlands roof",
    alt: "Completed grey architectural shingle roof with ridge vent, pipe boots and a box vent, in The Woodlands, TX",
    description:
      "Ridge vent, pipe boots and a box vent all set and sealed on a completed roof in The Woodlands, TX.",
    tags: ["roof ventilation", "ridge vent", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-brick-ranch-the-woodlands-tx.webp",
    title: "Completed roof on a Woodlands brick ranch",
    alt: "Completed dark shingle roof on a long single-storey brick ranch home, ladder still set, The Woodlands, TX",
    description:
      "A long ranch roofline in The Woodlands, TX finished end to end, photographed before the ladders came down.",
    tags: ["completed roof replacement", "ranch home roof", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-replacement-ranch-home-the-woodlands-tx.webp",
    title: "Evening light on a finished Woodlands roof",
    alt: "Completed shingle roof on a brick ranch home with green shutters at golden hour, The Woodlands, TX",
    description:
      "The same long Woodlands, TX ranch roofline at the end of the day, with the crew packing up.",
    tags: ["completed roof replacement", "ranch home roof", "The Woodlands TX"],
  },
  {
    src: "/work/roof-vent-and-pipe-boot-detail-the-woodlands-tx.webp",
    title: "Vent stack and pipe boots, The Woodlands",
    alt: "Roof vent stack, sealed pipe boots and ridge vent on a completed shingle roof in The Woodlands, TX",
    description:
      "Penetrations are where roofs leak. On this Woodlands, TX roof every stack and boot got new flashing and a sealed collar.",
    tags: ["pipe boot", "roof vent", "roof flashing", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-aerial-patio-cover-the-woodlands-tx.webp",
    title: "Roof meets patio cover, The Woodlands",
    alt: "Aerial view of a completed shingle roof meeting a metal patio cover, crew finishing the valley, The Woodlands, TX",
    description:
      "Where a shingle roof meets a metal patio cover on a Woodlands, TX home, the valley and the flashing decide whether it leaks.",
    tags: ["roof valley", "patio cover flashing", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/completed-roof-ridge-vent-aerial-the-woodlands-tx.webp",
    title: "Ridge vent the full length, The Woodlands",
    alt: "Aerial view of a completed shingle roof with continuous ridge vent, turbine and pipe boots, The Woodlands, TX",
    description:
      "A continuous ridge vent run end to end on a Woodlands, TX roof — which only works if the intake at the eaves matches it.",
    tags: ["ridge vent", "attic ventilation", "completed roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/hip-roof-and-chimney-brick-home-the-woodlands-tx.webp",
    title: "Hip roof and chimney flashing, The Woodlands",
    alt: "Hip roof meeting a brick chimney with a metal cap on a home in The Woodlands, TX",
    description:
      "A chimney is one of the few places a roof has to stop and start again, so on this Woodlands, TX job the flashing there was checked like everything else.",
    tags: ["chimney flashing", "hip roof", "roof inspection", "The Woodlands TX"],
  },
  {
    src: "/work/roofline-at-sunrise-the-woodlands-tx.webp",
    title: "Early start on a Woodlands roof",
    alt: "Sun rising behind the roofline of a brick home at the start of a roofing day in The Woodlands, TX",
    description:
      "Crews start at first light in The Woodlands, TX through the Texas summer so most of the tear-off is done before the heat sets in.",
    tags: ["roofing crew", "roof replacement", "The Woodlands TX"],
  },
  {
    src: "/work/roof-tear-off-single-story-home-houston.webp",
    title: "Mid tear-off on a Houston home",
    alt: "Northvale Roofing crew mid tear-off on a single-story home in the Houston area",
    description:
      "Tear-off underway on a Houston-area roof, old shingles coming off down to the deck.",
    tags: ["roof tear-off", "roofing crew", "Houston TX"],
  },
  {
    src: "/work/landscaping-tarped-during-re-roof-houston.webp",
    title: "Landscaping tarped on a Houston re-roof",
    alt: "Home and landscaping protected with tarps during a Northvale Roofing re-roof in the Houston area",
    description:
      "On every Houston-area job, beds, shrubs and walls go under tarps before the first shingle comes off.",
    tags: ["site protection", "roof replacement", "Houston TX"],
  },
  {
    src: "/work/roof-inspection-steep-two-story-houston.webp",
    title: "Inspecting a steep Houston roof",
    alt: "Northvale Roofing inspector walking a steep two-story roof in the Houston area",
    description: "Every Houston-area inspection is walked, not flown — steep roofs included.",
    tags: ["roof inspection", "steep roof", "Houston TX"],
  },
  {
    src: "/work/underlayment-and-starter-course-houston.webp",
    title: "Starter course at a Houston roof edge",
    alt: "Synthetic underlayment and starter course installed at a roof edge on a Houston-area home — install detail",
    description:
      "Underlayment and the starter course set at the eave of a Houston-area roof, where wind uplift starts.",
    tags: ["starter course", "synthetic underlayment", "install detail", "Houston TX"],
  },
  {
    src: "/work/hand-nailing-shingles-houston.webp",
    title: "Hand-nailing shingles on a Houston roof",
    alt: "Roofer hand-nailing shingles during installation on a Houston-area home — close-up detail",
    description:
      "Hand-nailing on a Houston-area install keeps every fastener in the nail line and at the right depth.",
    tags: ["hand nailing", "shingle installation", "install detail", "Houston TX"],
  },
];
