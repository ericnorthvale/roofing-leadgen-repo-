import { describe, it, expect } from "vitest";
import { grandTotal, lineCents, perSquareCents, tradeSubtotals } from "~/lib/proposal-totals";

/**
 * The money on the proposal's last page.
 *
 * WRITTEN AFTER A REAL WRONG NUMBER. The per-square figure was computed from
 * the grand total, so adding gutters to a roof proposal printed "$1,017.63 per
 * square" on a roof quoted at $870. Nothing would have caught it: the PDF
 * renders, the total is right, and only the derived figure lies — and that is
 * the exact figure a homeowner repeats to the next contractor.
 */

const roof = [
  { id: "tear-off", qty: 30, price: 450 }, // 13,500
  { id: "shingles-dynasty", qty: 30, price: 310 }, // 9,300
  { id: "ridge-vent", qty: 40, price: null }, // included, worth nothing
];
const gutters = [
  { id: "gutter-seamless", qty: 267, price: 12 }, // 3,204
  { id: "downspouts", qty: 7, price: 175 }, // 1,225
];

describe("line arithmetic", () => {
  it("multiplies quantity by price in whole cents", () => {
    expect(lineCents({ id: "tear-off", qty: 30, price: 450 })).toBe(1_350_000);
  });

  it("treats a quantity-less line as one of them", () => {
    expect(lineCents({ id: "gutter-guards", qty: null, price: 1250 })).toBe(125_000);
  });

  it("counts an unpriced line as nothing, not as zero dollars quoted", () => {
    expect(lineCents({ id: "ridge-vent", qty: 40, price: null })).toBe(0);
  });

  it("does not drift on figures that float badly", () => {
    // 0.1 + 0.2 territory: 3 × 10.10 must be 30.30 exactly.
    expect(lineCents({ id: "drip-edge", qty: 3, price: 10.1 })).toBe(3030);
  });
});

describe("per trade", () => {
  it("keeps each trade's money separate", () => {
    const subs = tradeSubtotals([...roof, ...gutters]);
    expect(subs.get("replacement")).toBe(2_280_000);
    expect(subs.get("gutters")).toBe(442_900);
  });

  it("ignores an id that is not in the catalogue", () => {
    const subs = tradeSubtotals([...roof, { id: "solar-panel-install", qty: 1, price: 9000 }]);
    expect([...subs.values()].reduce((a, b) => a + b, 0)).toBe(2_280_000);
  });

  it("totals to the sum of its trades", () => {
    expect(grandTotal([...roof, ...gutters])).toBe(2_280_000 + 442_900);
  });
});

describe("per square", () => {
  it("uses the ROOF only, never the whole proposal", () => {
    // The bug: 2,722,900 / 30 = $907.63. The truth: 2,280,000 / 30 = $760.
    expect(perSquareCents([...roof, ...gutters], 30)).toBe(76_000);
    expect(perSquareCents(roof, 30)).toBe(76_000);
  });

  it("says nothing when there is no roof in the proposal", () => {
    expect(perSquareCents(gutters, 30)).toBeNull();
  });

  it("says nothing without a square count", () => {
    expect(perSquareCents(roof, null)).toBeNull();
    expect(perSquareCents(roof, 0)).toBeNull();
  });
});
