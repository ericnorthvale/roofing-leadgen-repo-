/**
 * The roof, drawn in cross-section, layer by layer.
 *
 * WHY A DIAGRAM EARNS ITS PAGE. A homeowner comparing three bids is reading
 * three lists of words they do not know — "starter course", "leak barrier",
 * "synthetic underlayment" — and has no way to tell whether the cheap bid is
 * cheap because it leaves two of them out. A cross-section answers that
 * question in one look: here is what goes on your deck, in order, and here is
 * which of these you are being quoted for. That is the single most persuasive
 * page in a roofing proposal, and it is persuasive because it is TRUE, not
 * because it is decorated.
 *
 * DRAWN, NOT ILLUSTRATED. Every layer is a rectangle and every label a line of
 * type, built from pdf-lib primitives — no bitmap to go blurry in print, no
 * stock illustration showing a roof assembly that is not the one being sold.
 *
 * THE LAYERS ARE THE ONES NORTHVALE INSTALLS, in the order they go down, and
 * each maps to a real catalogue item. A layer that is not in this estimate is
 * drawn muted and labelled as not included — which is the honest way to show
 * an upsell, and far more convincing than hiding it.
 *
 * NOTHING HERE IS TO SCALE and the drawing says so. A 3/8" deck and a 1/8"
 * shingle cannot be drawn at the same scale on a letter page and remain
 * legible, so the layers are exaggerated for clarity. Saying that out loud
 * costs nothing and is the difference between a diagram and a claim.
 */

/** One layer of the assembly, bottom (deck) to top (ridge cap). */
/** Kept as its own constant because the array below references it. */
const RIDGE_VENT_ITEM_ID = "ridge-vent";

export interface RoofLayer {
  /** Catalogue ids that mean this layer is part of the job. */
  itemIds: string[];
  label: string;
  /** What it does, in a homeowner's words. One short line. */
  note: string;
  /** Drawn thickness in points — legibility, not scale. */
  thickness: number;
  /** How the canvas renderer paints this layer. */
  kind?: "deck" | "membrane" | "underlayment" | "starter" | "shingles" | "vent" | "cap";
  fill: { r: number; g: number; b: number };
  /** Drawn as a repeating edge rather than a solid band (shingle courses). */
  courses?: boolean;
  /**
   * The layer is part of the house already, not something being sold. It is
   * always drawn solid and never captioned "not included" — telling a
   * homeowner their own roof deck is not included is nonsense, and it makes
   * the honest "not included" captions on the layers that ARE optional read
   * as noise.
   */
  existing?: boolean;
}

const C = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16) / 255,
  g: parseInt(hex.slice(3, 5), 16) / 255,
  b: parseInt(hex.slice(5, 7), 16) / 255,
});

/**
 * Bottom to top. The order is the order of installation, which is the whole
 * point of showing it — it is why you cannot add a leak barrier afterwards.
 */
export const ROOF_LAYERS: RoofLayer[] = [
  {
    itemIds: ["deck-inspect", "deck-replace"],
    label: "Roof deck",
    note: "The plywood your whole roof is fastened to. Inspected and re-nailed once the old roof is off.",
    thickness: 22,
    fill: C("#c8a97e"),
    kind: "deck",
    existing: true,
  },
  {
    itemIds: ["leak-barrier"],
    label: "Leak barrier",
    note: "Self-sealing membrane in the valleys and around penetrations — where roofs actually leak.",
    thickness: 11,
    fill: C("#7d4f3a"),
    kind: "membrane",
  },
  {
    itemIds: ["underlayment"],
    label: "Synthetic underlayment",
    note: "A second water-resistant plane over the whole deck, under the shingles.",
    thickness: 11,
    fill: C("#4a5568"),
    kind: "underlayment",
  },
  {
    itemIds: ["starter"],
    label: "Starter course",
    note: "A bonded first course at the eaves and rakes. It is what stops the edge lifting in wind.",
    thickness: 10,
    fill: C("#2f3f55"),
    kind: "starter",
  },
  {
    itemIds: ["shingles-dynasty", "shingles-nordic"],
    label: "Architectural shingles",
    note: "The roof you see. Nailed to the manufacturer's pattern so the wind warranty stands.",
    thickness: 20,
    fill: C("#3a3f45"),
    kind: "shingles",
    courses: true,
  },
  {
    itemIds: [RIDGE_VENT_ITEM_ID],
    label: "Ridge vent",
    note: "Lets hot attic air out at the peak. It goes on over the shingles and under the cap.",
    thickness: 9,
    fill: C("#6f5a3a"),
    kind: "vent",
  },
  {
    itemIds: ["hip-ridge"],
    label: "Hip &amp; ridge cap",
    note: "Purpose-made caps along the ridges — not cut-up field shingles.",
    thickness: 14,
    fill: C("#22262b"),
    kind: "cap",
  },
];

/** Ridge ventilation sits at the peak rather than in the stack. */
export const RIDGE_VENT_ITEM = RIDGE_VENT_ITEM_ID;

/**
 * Called out at the eave rather than drawn as a layer — it is an edge detail,
 * and stacking it would imply it covers the whole deck.
 */
export const EDGE_CALLOUTS: Array<{ itemIds: string[]; label: string; note: string }> = [
  {
    itemIds: ["drip-edge"],
    label: "Drip edge",
    note: "Directs water off the deck and into the gutter.",
  },
  {
    itemIds: ["step-flashing", "chimney-flashing", "valley-metal"],
    label: "Flashing",
    note: "Seals the joints and penetrations where roofs meet walls and chimneys.",
  },
];

export const DIAGRAM_DISCLAIMER =
  "Cross-section is illustrative and not to scale; layer thicknesses are exaggerated for legibility. Components shown reflect the scope quoted in this proposal.";
