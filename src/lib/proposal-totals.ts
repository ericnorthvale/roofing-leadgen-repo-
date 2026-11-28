/**
 * The arithmetic on the proposal's money page, kept separate so it can be
 * tested without a browser.
 *
 * IT LIVES HERE BECAUSE A WRONG FIGURE HERE IS THE EXPENSIVE KIND. The
 * per-square number was briefly computed from the grand total, so a roof
 * quoted at $870 a square printed as $1,017 because a set of gutters had been
 * added to the same proposal. That is precisely the figure a homeowner reads
 * out to the next contractor, and nothing in the build would ever have caught
 * it — the PDF renders, the total is right, and only the derived number lies.
 *
 * Everything is in whole cents. 0.1 + 0.2 is not 0.3 in floating point, and an
 * estimate a penny out looks like a company that cannot add up.
 */
import { ESTIMATE_ITEMS, type EstimateBlock } from "./estimate-items";
import type { EstimateDraft } from "./estimate-draft";

const BLOCK_OF = new Map(ESTIMATE_ITEMS.map((i) => [i.id, i.block]));

type Line = EstimateDraft["lines"][number];

/** One line's money. An unpriced line is worth nothing, not zero dollars. */
export function lineCents(line: Line): number {
  if (line.price === null) return 0;
  return Math.round((line.qty ?? 1) * line.price * 100);
}

/** Money per trade, in cents, for the trades actually present. */
export function tradeSubtotals(lines: Line[]): Map<EstimateBlock, number> {
  const out = new Map<EstimateBlock, number>();
  for (const line of lines) {
    const block = BLOCK_OF.get(line.id);
    if (!block) continue; // not a catalogue item; never priced
    out.set(block, (out.get(block) ?? 0) + lineCents(line));
  }
  return out;
}

export function grandTotal(lines: Line[]): number {
  return lines.reduce((sum, l) => (BLOCK_OF.has(l.id) ? sum + lineCents(l) : sum), 0);
}

/**
 * Cost per roofing square — from the ROOF REPLACEMENT only.
 *
 * Gutters, repairs and maintenance are not roof area and must never be in
 * this numerator, however many of them share the proposal.
 */
export function perSquareCents(lines: Line[], squares: number | null): number | null {
  if (!squares || squares <= 0) return null;
  const roof = lines
    .filter((l) => BLOCK_OF.get(l.id) === "replacement")
    .reduce((sum, l) => sum + lineCents(l), 0);
  if (roof <= 0) return null;
  return Math.round(roof / squares);
}
