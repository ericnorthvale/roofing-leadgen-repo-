/**
 * The estimate line-item library — the words, never the money.
 *
 * WHY THIS EXISTS. Northvale's pricing is not standardised: a re-roof, a pipe
 * boot, a run of gutter and a maintenance visit are each priced on the job, by
 * the rep standing in front of it. So the estimator asks the rep for the
 * number and supplies the SENTENCE. Two reps quoting the same work produce
 * identical, professional wording at whatever price each job warrants.
 *
 * That split is also the safety model. A human types every figure; nothing
 * here carries a price, a rate or a quantity, and the assistant that drafts
 * the narrative never touches either. There is no number in this file to get
 * wrong.
 *
 * RULES FOR ANYTHING ADDED HERE
 *
 * 1. Customer-facing voice. These sentences are read by a homeowner at a
 *    kitchen table, not by a crew. Plain, specific, no trade shorthand and no
 *    salesmanship.
 * 2. Only claims already sourced in docs/research-facts.md. Warranty terms,
 *    wind ratings and impact classes are quoted from IKO's own published
 *    specification and nowhere else. Never add a figure you cannot cite.
 * 3. IKO only. Naming a competitor's shingle brand fails the build
 *    (tests/unit/no-competitor-brands.test.ts).
 * 4. No extended-warranty claims. Iron Clad Extended Protection is available
 *    only through qualifying Select+ ROOFPRO contractors and Northvale's tier
 *    is not confirmed — see research-facts, IKO warranty facts (CRITICAL).
 * 5. Code citations stay as written. Tear-off to deck (R908.3), drip edge at
 *    eaves and rakes (R905.2.8.5), underlayment (R905.1.1) and flashing
 *    (R903.2) are 2021 IRC requirements, cited because they explain WHY a line
 *    is on the estimate rather than to pad it.
 *
 * `unit` tells the estimator what to ask for; it never implies a rate.
 */

export type EstimateBlock = "replacement" | "repair" | "gutters" | "ventilation" | "maintenance";

export type EstimateUnit = "square" | "sheet" | "foot" | "each" | "job";

export interface EstimateItem {
  /** Stable id — referenced by saved estimates, so never reuse or repurpose. */
  id: string;
  block: EstimateBlock;
  /** The line a customer reads. */
  label: string;
  /** One or two sentences under the label. Why it is here, or what it is. */
  detail: string;
  unit: EstimateUnit;
  /**
   * Pre-ticked when a rep starts a replacement estimate. These are the items a
   * compliant re-roof always includes, so leaving one off should be a decision
   * rather than an oversight.
   */
  defaultOnReplacement?: boolean;
}

export const ESTIMATE_ITEMS: EstimateItem[] = [
  // ─────────────────────────── Roof replacement ───────────────────────────
  {
    id: "tear-off",
    block: "replacement",
    label: "Tear off the existing roof to the deck",
    detail:
      "Every layer comes off down to the bare decking, so the new roof is fastened to wood rather than to the old roof. The residential code requires a replacement to be taken to the deck; a second layer laid over the first is not a replacement.",
    unit: "square",
    defaultOnReplacement: true,
  },
  {
    id: "deck-inspect",
    block: "replacement",
    label: "Inspect and re-nail the decking",
    detail:
      "With the old roof off, we walk the whole deck and re-fasten what has worked loose. This is the one moment in a roof's life when the structure underneath is visible, and we photograph what we find.",
    unit: "square",
    defaultOnReplacement: true,
  },
  {
    id: "deck-replace",
    block: "replacement",
    label: "Replace damaged decking",
    detail:
      "Rotten, delaminated or water-soaked sheets are cut out and replaced. We price this per sheet and only charge for what comes out, because nobody can see the deck until the roof is off.",
    unit: "sheet",
  },
  {
    id: "underlayment",
    block: "replacement",
    label: "Synthetic underlayment over the whole deck",
    detail:
      "A water-resistant layer between the deck and the shingles — the roof's second line of defence, and a code requirement in its own right.",
    unit: "square",
    defaultOnReplacement: true,
  },
  {
    id: "leak-barrier",
    block: "replacement",
    label: "Leak barrier in the valleys and around penetrations",
    detail:
      "A self-adhering membrane where water concentrates and where most leaks begin — valleys, chimneys, pipe penetrations and roof-to-wall joins.",
    unit: "foot",
    defaultOnReplacement: true,
  },
  {
    id: "drip-edge",
    block: "replacement",
    label: "New drip edge at the eaves and rakes",
    detail:
      "Metal edging that carries water off the roof instead of behind the fascia. It is required at both eaves and rakes under the 2021 code, and older roofs here very often never had it.",
    unit: "foot",
    defaultOnReplacement: true,
  },
  {
    id: "starter",
    block: "replacement",
    label: "Starter course at the eaves and rakes",
    detail:
      "A purpose-made first course that seals the bottom edge of the field shingles. It is what keeps the perimeter down in high wind, and it is the first thing we look for on a failed roof.",
    unit: "foot",
    defaultOnReplacement: true,
  },
  {
    id: "shingles-dynasty",
    block: "replacement",
    label: "IKO Dynasty architectural shingles, installed",
    detail:
      "IKO's performance architectural shingle, with the reinforced ArmourZone nailing band. Limited Lifetime warranty with 15 years of Iron Clad non-prorated coverage, a 130 mph limited wind warranty and a Class A fire rating. Rated Class 3 for impact.",
    unit: "square",
  },
  {
    id: "shingles-nordic",
    block: "replacement",
    label: "IKO Nordic impact-resistant shingles, installed",
    detail:
      "IKO's highest-performing shingle, reinforced with polymer-modified (SBS) asphalt. Rated Class 4 — the highest impact grade — which is the rating insurers look for when they give an impact-resistance credit. Same Limited Lifetime, 15-year Iron Clad, 130 mph wind and Class A fire terms as Dynasty.",
    unit: "square",
  },
  {
    id: "hip-ridge",
    block: "replacement",
    label: "Hip and ridge cap shingles",
    detail:
      "Purpose-made caps along every hip and ridge, rather than field shingles cut down to fit. It is the difference you see from the kerb and the difference water sees at the top of the roof.",
    unit: "foot",
    defaultOnReplacement: true,
  },
  {
    id: "ridge-vent",
    block: "replacement",
    label: "Ridge ventilation",
    detail:
      "Continuous exhaust along the ridge so hot attic air has somewhere to go. Ventilation is balanced against the intake at the soffits — exhaust on its own does not work, and we check both.",
    unit: "foot",
  },
  {
    id: "pipe-boots",
    block: "replacement",
    label: "New pipe boots on every penetration",
    detail:
      "Every plumbing vent gets a new boot. The rubber collar on a boot perishes in this sun years before the shingles do, and reusing an old one puts the roof's most common leak straight back into a new roof.",
    unit: "each",
    defaultOnReplacement: true,
  },
  {
    id: "step-flashing",
    block: "replacement",
    label: "New step and counter flashing at walls",
    detail:
      "Where the roof meets a wall, flashing is replaced rather than reused. Code treats flashing as part of the roof assembly, and a reused piece is a leak waiting on the right storm.",
    unit: "foot",
  },
  {
    id: "chimney-flashing",
    block: "replacement",
    label: "Re-flash the chimney",
    detail:
      "New base, step and counter flashing around the chimney, sealed into the mortar line. Chimneys are the single most common place we are called back to on somebody else's roof.",
    unit: "each",
  },
  {
    id: "valley-metal",
    block: "replacement",
    label: "Valley metal",
    detail:
      "Metal lining in the valleys, where two slopes send their water into one channel. Valleys carry more water than any other part of the roof and fail first when they are skimped.",
    unit: "foot",
  },
  {
    id: "skylight-reflash",
    block: "replacement",
    label: "Re-flash skylights",
    detail:
      "Skylights are re-flashed as part of the roof rather than left sitting in the old seal. If a unit is at the end of its life we will say so before we start, not after.",
    unit: "each",
  },
  {
    id: "detach-reset",
    block: "replacement",
    label: "Detach and reset roof-mounted equipment",
    detail:
      "Satellite dishes, solar attic fans or panels removed before tear-off and reinstalled onto the new roof.",
    unit: "each",
  },
  {
    id: "steep-adder",
    block: "replacement",
    label: "Steep-slope allowance",
    detail:
      "Slopes too steep to walk take longer and need staging and fall protection. Priced separately so you can see it rather than finding it buried in a rate.",
    unit: "square",
  },
  {
    id: "height-adder",
    block: "replacement",
    label: "Two-storey and access allowance",
    detail:
      "Extra height, awkward access or landscaping that has to be worked around and protected.",
    unit: "job",
  },
  {
    id: "site-protection",
    block: "replacement",
    label: "Site protection, clean-up and magnetic sweep",
    detail:
      "Landscaping and the pool area covered before anything comes off, debris hauled away, and the drive and lawn swept with a magnet for nails at the end of every day — not just the last one.",
    unit: "job",
    defaultOnReplacement: true,
  },
  {
    id: "permit",
    block: "replacement",
    label: "Building permit",
    detail:
      "Pulled and filed where your address requires one. We confirm the current fee with the city rather than estimating it.",
    unit: "job",
  },

  // ───────────────────────────── Roof repair ─────────────────────────────
  {
    id: "leak-diagnosis",
    block: "repair",
    label: "Leak diagnosis",
    detail:
      "We find where the water is actually entering, which is rarely above the stain on the ceiling. You get the photographs and the explanation whether or not you have the work done.",
    unit: "job",
  },
  {
    id: "pipe-boot-repair",
    block: "repair",
    label: "Replace a failed pipe boot",
    detail:
      "The perished collar is cut out and a new boot is woven into the surrounding shingles, rather than sealed over with caulk that will fail again next summer.",
    unit: "each",
  },
  {
    id: "shingle-repair",
    block: "repair",
    label: "Shingle repair",
    detail:
      "Missing, lifted or damaged shingles replaced and re-sealed into the courses around them. We tell you honestly whether a repair buys you years or months.",
    unit: "job",
  },
  {
    id: "flashing-repair",
    block: "repair",
    label: "Flashing repair",
    detail:
      "Failed flashing at a wall, chimney or valley cut out and replaced. Sealant over bad flashing is a way of being called back, not a repair.",
    unit: "job",
  },
  {
    id: "emergency-tarp",
    block: "repair",
    label: "Emergency tarping",
    detail:
      "A roof open to the weather covered and secured the same day to stop further damage while the claim or the schedule catches up.",
    unit: "job",
  },

  // ─────────────────────────────── Gutters ───────────────────────────────
  {
    id: "gutter-seamless",
    block: "gutters",
    label: "Seamless gutter, formed on site",
    detail:
      "Rolled to the exact length of each run so the only joins are at the corners. Fewer seams is fewer places to leak.",
    unit: "foot",
  },
  {
    id: "downspouts",
    block: "gutters",
    label: "Downspouts",
    detail:
      "Sized and placed to carry what this roof actually sheds, and turned away from the slab.",
    unit: "foot",
  },
  {
    id: "gutter-guards",
    block: "gutters",
    label: "Gutter guards",
    detail:
      "Covers to keep pine needles and leaf litter out of the run. Worth it under a canopy, and honestly not worth it on an open lot.",
    unit: "foot",
  },
  {
    id: "gutter-clean",
    block: "gutters",
    label: "Clear the gutters and downspouts",
    detail:
      "Everything flushed and the downspouts proved clear, with the debris taken away rather than left on the beds.",
    unit: "job",
  },

  // ───────────────────────────── Ventilation ─────────────────────────────
  {
    id: "solar-attic-fan",
    block: "ventilation",
    label: "Solar-powered attic ventilator",
    detail:
      "Powered exhaust that runs off its own panel, with no wiring and nothing on your electricity bill. Flashed into the roof like any other penetration.",
    unit: "each",
  },
  {
    id: "static-vents",
    block: "ventilation",
    label: "Static roof vents",
    detail: "Low-profile exhaust vents set near the ridge and flashed into the field of the roof.",
    unit: "each",
  },
  {
    id: "soffit-intake",
    block: "ventilation",
    label: "Open up or add soffit intake",
    detail:
      "Blocked soffits are the commonest ventilation fault we find, and they make the exhaust above them close to useless. Clearing or adding intake is what lets the rest of the system work.",
    unit: "foot",
  },
  {
    id: "vent-balance",
    block: "ventilation",
    label: "Balance the attic ventilation",
    detail:
      "Intake and exhaust measured against the attic's floor area and brought into balance, to the ratio the residential code sets.",
    unit: "job",
  },

  // ───────────────────────────── Maintenance ─────────────────────────────
  {
    id: "annual-inspection",
    block: "maintenance",
    label: "Annual roof inspection",
    detail:
      "A full photographic walk of the roof with written findings, so small faults are caught at repair price rather than at replacement price.",
    unit: "job",
  },
  {
    id: "sealant-renewal",
    block: "maintenance",
    label: "Renew exposed sealant",
    detail:
      "The sealant at flashings, fasteners and penetrations is the shortest-lived material on a roof in this sun. Renewing it on a schedule is the cheapest work we do.",
    unit: "job",
  },
  {
    id: "valley-clearing",
    block: "maintenance",
    label: "Clear valleys and roof debris",
    detail:
      "Needles and leaf litter cleared out of the valleys and off the roof, where left in place they hold water against the shingles.",
    unit: "job",
  },
  {
    id: "algae-treatment",
    block: "maintenance",
    label: "Treat roof algae",
    detail:
      "The black streaking on Gulf Coast roofs is algae rather than dirt. Treated with a low-pressure application — never a pressure washer, which takes the granules off with the stain.",
    unit: "square",
  },
];

/**
 * Grouping headings. Not used by the estimator screen, which lists lines in the
 * order the rep spoke them — kept because the printed estimate groups by block.
 */
export const BLOCK_LABEL: Record<EstimateBlock, string> = {
  replacement: "Roof replacement",
  repair: "Roof repair",
  gutters: "Gutters",
  ventilation: "Ventilation",
  maintenance: "Maintenance",
};
