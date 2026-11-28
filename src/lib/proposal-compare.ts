/**
 * The "why this shingle" page — the roof's answer to the owner's 5" vs 6"
 * gutter comparison.
 *
 * WHICH COMPARISON DEPENDS ON WHAT WAS SOLD (owner, 2026-11-28):
 *   Nordic quoted  → Class 3 vs Class 4. The customer is buying impact
 *                    resistance, so show them what it buys.
 *   Dynasty quoted → architectural vs 3-tab. The customer is buying a
 *                    laminated shingle, so show them what they are NOT
 *                    getting at the bottom of the market.
 *
 * EVERY FIGURE ON THIS PAGE IS SOURCED, and the sourcing is why the page is
 * short. docs/research-facts.md UNVERIFIED #8 records that the "3-tab is
 * rated 60–70 mph" line that every roofing blog repeats traces to no
 * manufacturer document — and says what to do instead: "contrast verified
 * manufacturer warranties". That is exactly what this does. A comparison page
 * is a page of claims about a competing product; the one thing it cannot be
 * is approximately true.
 *
 * BOTH COLUMNS ARE NOW FILLED (2026-11-28). The 3-tab column used to be a row
 * of em-dashes under a box explaining why, which the owner correctly called
 * useless: a comparison that compares nothing persuades nobody. Marathon's own
 * US warranty figures are now recorded in research-facts.md and published
 * here — including the one that matters most on the Gulf Coast, which is that
 * IKO warrants a Marathon roof against 60 mph wind and a Dynasty roof against
 * 130.
 *
 * THE TABLES DELIBERATELY SHOW WHERE THE TWO PRODUCTS ARE EQUAL. Both carry
 * Class A fire; Nordic and Dynasty carry identical wind, product, Iron Clad
 * and algae terms. Printing "same" in those rows costs a little drama and buys
 * the whole page's credibility — a table where every row favours the thing
 * being sold reads as a sales sheet, and a homeowner holding three bids can
 * tell the difference. It also puts the real reason for the Class 4 upgrade
 * where it belongs: the impact rating and what an insurer does with it, not an
 * invented warranty advantage.
 */

export interface CompareRow {
  label: string;
  /** The product being quoted. */
  ours: string;
  /** What it is being compared against. */
  theirs: string;
  /** Shown small under the row when the figure needs its source named. */
  source?: string;
}

export interface Comparison {
  kicker: string;
  heading: string;
  intro: string;
  oursLabel: string;
  theirsLabel: string;
  oursSub: string;
  theirsSub: string;
  rows: CompareRow[];
  /** The navy box at the foot of the page. */
  pointHeading: string;
  point: string;
  footnote: string;
}

/** Nordic was quoted: show what Class 4 actually buys. */
export const CLASS_4_COMPARISON: Comparison = {
  kicker: "Why the upgrade matters",
  heading: "Class 3 vs Class 4 Impact",
  intro:
    "UL 2218 drops a steel ball onto a shingle from a measured height and checks the back for cracks. Class 3 survives a 1.75-inch ball; Class 4 survives a 2-inch ball, the highest rating the test awards. In a county that takes the hail it does, that is the difference the test is for.",
  oursLabel: "IKO Nordic",
  oursSub: "Quoted on this roof",
  theirsLabel: "IKO Dynasty",
  theirsSub: "Our standard architectural",
  rows: [
    {
      label: "Impact rating",
      ours: "FM 4473 / UL 2218 Class 4",
      theirs: "UL 2218 Class 3",
      source: "Class 4 survives a 2-inch steel ball; Class 3, a 1.75-inch ball.",
    },
    {
      label: "Asphalt",
      ours: "Polymer-modified (SBS)",
      theirs: "Standard asphalt",
      source: "SBS stays flexible in cold and resists tearing — why Nordic takes the harder hit.",
    },
    { label: "Wind warranty", ours: "130 mph", theirs: "130 mph", source: "Identical." },
    {
      label: "Product warranty",
      ours: "Limited Lifetime",
      theirs: "Limited Lifetime",
      source: "Identical.",
    },
    {
      label: "Iron Clad period",
      ours: "15 years",
      theirs: "15 years",
      source: "Identical. Full, non-prorated cover for manufacturing defects.",
    },
    { label: "Algae coverage", ours: "10 years", theirs: "10 years", source: "Identical." },
    {
      label: "Hail damage",
      ours: "Not covered",
      theirs: "Not covered",
      source: "No asphalt shingle warranty covers hail. That is what your insurance is for.",
    },
  ],
  pointHeading: "What you are actually buying, said plainly",
  point:
    "Four of those rows are identical, and we have left them in rather than crop the table. The upgrade is not buying you a longer warranty — it is buying a shingle built to take a harder hit, and a Class 4 rating to put in front of your insurer. IKO is blunt about the second part: it states the impact rating is \u201csolely for the purpose of enabling residential property owners to obtain a reduction in their residential insurance premium, if available.\u201d Many Texas carriers offer that discount and it runs every year you own the roof. Ask yours, with the Class 4 rating in hand, before you decide.",
  footnote:
    "Impact classifications and warranty terms are IKO's, per the IKO Limited Warranty (US). Warranty coverage is subject to IKO's own terms and to installation per its application requirements.",
};

/** Dynasty was quoted: show what the bottom of the market leaves out. */
export const ARCHITECTURAL_COMPARISON: Comparison = {
  kicker: "Why the upgrade matters",
  heading: "Architectural vs 3-Tab",
  intro:
    "A 3-tab shingle is one flat layer with notches cut in it. An architectural shingle is two layers bonded together, which is where its thickness, its shadow line and its wind performance come from. It is the single biggest difference between a cheap roof and a roof, and it is visible from the kerb.",
  oursLabel: "IKO Dynasty",
  oursSub: "Quoted on this roof",
  theirsLabel: "IKO Marathon",
  theirsSub: "A 3-tab shingle",
  rows: [
    {
      label: "Construction",
      ours: "Two laminated layers",
      theirs: "Single layer, cut tabs",
    },
    {
      label: "Typical service life",
      ours: "~30 years",
      theirs: "~20 years",
      source: "InterNACHI life-expectancy chart — and hot climates shorten both.",
    },
    {
      label: "Wind warranty",
      ours: "130 mph",
      theirs: "60 mph",
      source: "IKO's own figures. Marathon has no high-wind upgrade available in the US.",
    },
    {
      label: "Product warranty",
      ours: "Limited Lifetime",
      theirs: "Limited 25 years",
    },
    {
      label: "Iron Clad period",
      ours: "15 years",
      theirs: "5 years",
      source: "The years your cover is full and non-prorated, before it starts reducing.",
    },
    {
      label: "Impact rating",
      ours: "UL 2218 Class 3",
      theirs: "No rating published",
      source: "IKO publishes no UL 2218 class for Marathon. That is not the same as a low one.",
    },
    {
      label: "Algae coverage",
      ours: "10-year limited warranty",
      theirs: "Granules, no warranty term",
    },
    { label: "Fire rating", ours: "Class A", theirs: "Class A", source: "Identical." },
  ],
  pointHeading: "Sixty miles an hour",
  point:
    "That is the wind IKO warrants a Marathon roof against, and it is worth sitting with for a moment. A Gulf Coast thunderstorm gusts past 60 most summers; a named storm is not close. The Dynasty going on this roof is warranted to 130, by the same manufacturer, in the same document. Both figures are IKO's, not ours — and the 3-tab is cheaper for exactly the reasons in this table.",
  footnote:
    "All warranty terms and ratings are IKO's own, for the US market, and are subject to IKO's terms and to installation per its application requirements. Canadian Marathon figures differ and are not used here. Service-life figures are InterNACHI's general chart for asphalt shingles, not a manufacturer warranty.",
};

/** Which comparison belongs in this proposal, if any. */
export function comparisonFor(lineKey: string | undefined): Comparison | null {
  if (lineKey === "nordic") return CLASS_4_COMPARISON;
  if (lineKey === "dynasty") return ARCHITECTURAL_COMPARISON;
  // Cambridge, ArmourShake and the metal line have no agreed comparison yet,
  // and an invented one is worse than none.
  return null;
}
