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
 * IKO MARATHON'S OWN WARRANTY FIGURES ARE NOT HERE because nobody has
 * supplied the spec sheet. The 3-tab column therefore carries only what is
 * either definitional (single-layer construction) or independently sourced
 * (InterNACHI service life). See Sheet 18 of research-facts.md.
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
    },
    {
      label: "Asphalt",
      ours: "Polymer-modified (SBS)",
      theirs: "Standard asphalt",
    },
    { label: "Wind warranty", ours: "130 mph", theirs: "130 mph" },
    { label: "Product warranty", ours: "Limited Lifetime", theirs: "Limited Lifetime" },
    { label: "Iron Clad period", ours: "15 years", theirs: "15 years" },
    { label: "Algae coverage", ours: "10 years", theirs: "10 years" },
  ],
  pointHeading: "The part worth asking your insurer about",
  point:
    "Many Texas carriers offer a premium discount for a Class 4 roof, and the discount runs every year you own it. We cannot tell you what yours will allow — ask them, with the Class 4 rating in hand, before you decide.",
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
    { label: "Impact rating", ours: "UL 2218 Class 3", theirs: "—" },
    { label: "Wind warranty", ours: "130 mph", theirs: "—" },
    { label: "Product warranty", ours: "Limited Lifetime", theirs: "—" },
    { label: "Algae coverage", ours: "10 years", theirs: "—" },
  ],
  pointHeading: "Why the right-hand column has gaps",
  point:
    "We have not reproduced IKO's warranty figures for Marathon here, because we would be quoting them from memory. The Dynasty figures are from the IKO Limited Warranty. If you want the Marathon terms side by side, ask and we will bring the spec sheet.",
  footnote:
    "Dynasty warranty terms are IKO's, per the IKO Limited Warranty (US), and are subject to its terms and to installation per its application requirements. Service-life figures are InterNACHI's general chart for asphalt shingles, not a manufacturer warranty.",
};

/** Which comparison belongs in this proposal, if any. */
export function comparisonFor(lineKey: string | undefined): Comparison | null {
  if (lineKey === "nordic") return CLASS_4_COMPARISON;
  if (lineKey === "dynasty") return ARCHITECTURAL_COMPARISON;
  // Cambridge, ArmourShake and the metal line have no agreed comparison yet,
  // and an invented one is worse than none.
  return null;
}
