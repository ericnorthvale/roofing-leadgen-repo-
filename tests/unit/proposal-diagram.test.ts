import { describe, it, expect } from "vitest";
import { ROOF_LAYERS, DIAGRAM_DISCLAIMER } from "~/lib/proposal-diagram";
import { ESTIMATE_ITEMS } from "~/lib/estimate-items";

/**
 * The roof diagram, tested as a set of CLAIMS rather than as a picture.
 *
 * Nothing here can tell you whether the drawing is attractive. What it can do
 * is stop the drawing from saying something false about the job, which is the
 * failure that actually costs money — and the one that is invisible in a
 * build, because a wrong diagram renders exactly as cleanly as a right one.
 *
 * Two real defects are pinned here, both found by the owner reading his own
 * proposal rather than by any test:
 *
 *   1. Standard replacement work was captioned "Not included in this quote"
 *      because the rep had not named each layer aloud.
 *   2. The starter course and the leak barrier were drawn covering the whole
 *      roof, when one is a strip at the edges and the other is patches at the
 *      valleys and penetrations.
 */

const byLabel = (label: string) => {
  const layer = ROOF_LAYERS.find((l) => l.label === label);
  if (!layer) throw new Error(`no layer labelled ${label}`);
  return layer;
};

describe("what each layer covers", () => {
  it("draws the starter course as a strip, not a roof", () => {
    expect(byLabel("Starter course").coverage).toBe("perimeter");
  });

  it("draws the leak barrier as patches, not a roof", () => {
    // The expensive misreading: a homeowner concluding the whole deck is
    // getting an ice-and-water membrane, because that is what was drawn.
    expect(byLabel("Leak barrier").coverage).toBe("patches");
  });

  it("covers the whole deck with the layers that actually do", () => {
    for (const label of ["Roof deck", "Synthetic underlayment", "Architectural shingles"]) {
      expect(byLabel(label).coverage ?? "full").toBe("full");
    }
  });

  it("says in writing what the drawing shows, so the page is not just pretty", () => {
    expect(DIAGRAM_DISCLAIMER).toMatch(/eaves and rakes/i);
    expect(DIAGRAM_DISCLAIMER).toMatch(/valleys and around penetrations/i);
    expect(DIAGRAM_DISCLAIMER).toMatch(/not to scale/i);
  });

  it("keeps each layer's note consistent with its coverage", () => {
    // A note that describes full coverage under a layer drawn as patches
    // would put the page back where it started, in words instead of pixels.
    expect(byLabel("Starter course").note).toMatch(/eaves and rakes/i);
    expect(byLabel("Leak barrier").note).toMatch(/valleys|penetrations/i);
  });
});

describe("what a replacement includes", () => {
  it("marks the layers Northvale fits on every replacement", () => {
    // Whether or not the rep named them aloud. Printing "not included" under
    // these on a roof replacement is a false statement about the scope.
    for (const label of [
      "Roof deck",
      "Leak barrier",
      "Synthetic underlayment",
      "Starter course",
      "Architectural shingles",
      "Hip &amp; ridge cap",
    ]) {
      expect(byLabel(label).standardOnReplacement).toBe(true);
    }
  });

  it("leaves the ridge vent an upsell, because it genuinely is one", () => {
    // If this ever becomes standard it must be priced as standard too. The
    // "what this quote does not include" box is driven off exactly this.
    expect(byLabel("Ridge vent").standardOnReplacement).toBeFalsy();
  });

  it("points every layer at catalogue items that exist", () => {
    const ids = new Set(ESTIMATE_ITEMS.map((i) => i.id));
    for (const layer of ROOF_LAYERS) {
      for (const id of layer.itemIds) {
        expect(ids.has(id), `${layer.label} -> ${id}`).toBe(true);
      }
    }
  });
});

describe("the order of installation", () => {
  it("runs deck, leak barrier, underlayment, starter, shingles, vent, cap", () => {
    // The owner's order, with one correction he was told about: the starter
    // goes OVER the underlayment, not under it. The ridge vent sits under the
    // cap, which was his correction to us.
    expect(ROOF_LAYERS.map((l) => l.label.replace("&amp;", "&"))).toEqual([
      "Roof deck",
      "Leak barrier",
      "Synthetic underlayment",
      "Starter course",
      "Architectural shingles",
      "Ridge vent",
      "Hip & ridge cap",
    ]);
  });

  it("treats the deck as the customer's, not as something being sold", () => {
    expect(byLabel("Roof deck").existing).toBe(true);
  });

  it("puts the starter ABOVE the underlayment, where IKO's own bulletin puts it", () => {
    // Checked twice, because it was questioned twice. IKO's Leading Edge Plus
    // bulletin says to apply "any underlayment, eave protection, valley
    // flashings, or drip edges required" BEFORE the starter course. Sources
    // are in docs/research-facts.md, "IKO installation sequence".
    const order = ROOF_LAYERS.map((l) => l.label);
    expect(order.indexOf("Starter course")).toBeGreaterThan(
      order.indexOf("Synthetic underlayment"),
    );
    expect(order.indexOf("Synthetic underlayment")).toBeGreaterThan(order.indexOf("Leak barrier"));
  });

  it("puts the ridge vent under the cap, which is the owner's own correction", () => {
    const order = ROOF_LAYERS.map((l) => l.label);
    expect(order.indexOf("Hip &amp; ridge cap")).toBeGreaterThan(order.indexOf("Ridge vent"));
    expect(order.indexOf("Ridge vent")).toBeGreaterThan(order.indexOf("Architectural shingles"));
  });
});
