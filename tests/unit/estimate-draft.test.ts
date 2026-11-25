import { describe, it, expect } from "vitest";
import { ESTIMATE_ITEMS } from "~/lib/estimate-items";
import {
  DRAFT_SCHEMA,
  buildDraftSystem,
  numbersSpokenIn,
  validateDraft,
} from "~/lib/estimate-draft";

/**
 * These tests exist because the risk in this feature is not "the model is
 * clumsy" — it is "the model is confident". The interesting cases below are
 * therefore the ones where a MODEL RETURNS SOMETHING PERFECTLY PLAUSIBLE that
 * nobody said, which is exactly what a fabricated price looks like.
 */

describe("numbersSpokenIn", () => {
  it("finds digits as dictated, commas and all", () => {
    const n = numbersSpokenIn("thirty squares at 1,250 and 30.5 on the back");
    expect(n.has(1250)).toBe(true);
    expect(n.has(30.5)).toBe(true);
  });

  it("finds plain spoken numbers", () => {
    const n = numbersSpokenIn("about thirty two squares, eight pipe boots");
    expect(n.has(32)).toBe(true);
    expect(n.has(8)).toBe(true);
  });

  it("finds prices the way people actually say them", () => {
    // "four fifty a square" is 450, not 4 and 50.
    expect(numbersSpokenIn("four fifty a square").has(450)).toBe(true);
    expect(numbersSpokenIn("twelve fifty for the gutters").has(1250)).toBe(true);
  });

  it("finds hundreds and thousands spelled out", () => {
    expect(numbersSpokenIn("four hundred and fifty a square").has(450)).toBe(true);
    expect(numbersSpokenIn("forty five hundred total").has(4500)).toBe(true);
    expect(numbersSpokenIn("twelve thousand five hundred").has(12500)).toBe(true);
  });

  it("forgives the dictation spelling of forty", () => {
    expect(numbersSpokenIn("fourty squares").has(40)).toBe(true);
  });
});

describe("validateDraft — the vocabulary is closed", () => {
  it("keeps a real catalogue id", () => {
    const d = validateDraft(
      { lines: [{ id: "tear-off", qty: 30, price: 450 }] },
      "thirty squares at four fifty",
    );
    expect(d.lines).toHaveLength(1);
    expect(d.lines[0]).toMatchObject({ id: "tear-off", qty: 30, price: 450 });
  });

  it("refuses an id the model made up, and says so rather than silently dropping it", () => {
    const d = validateDraft(
      { lines: [{ id: "solar-panel-install", qty: 1, price: 9000 }] },
      "nine thousand",
    );
    expect(d.lines).toHaveLength(0);
    expect(d.unmatched).toContain("solar-panel-install");
  });

  it("collapses a repeated id to one line", () => {
    const d = validateDraft(
      {
        lines: [
          { id: "tear-off", qty: 30, price: 450 },
          { id: "tear-off", qty: 12, price: 200 },
        ],
      },
      "thirty squares four fifty twelve two hundred",
    );
    expect(d.lines).toHaveLength(1);
    expect(d.lines[0].qty).toBe(30);
  });
});

describe("validateDraft — numbers must be numbers", () => {
  const cases: Array<[string, unknown]> = [
    ["a string", "450"],
    ["negative", -450],
    ["zero", 0],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["absurd", 99_000_000],
  ];

  for (const [name, price] of cases) {
    it(`nulls a price that is ${name}`, () => {
      const d = validateDraft({ lines: [{ id: "tear-off", qty: 30, price }] }, "thirty squares");
      expect(d.lines[0].price).toBeNull();
    });
  }
});

describe("validateDraft — a price nobody said is flagged", () => {
  it("flags a plausible price that appears nowhere in the transcript", () => {
    // The rep never said a price. A helpful model filling in the going rate is
    // precisely the failure this feature has to survive.
    const d = validateDraft(
      { lines: [{ id: "tear-off", qty: 30, price: 475 }] },
      "tear off and replace, thirty squares",
    );
    expect(d.lines[0].price).toBe(475);
    expect(d.lines[0].unverified).toBe(true);
  });

  it("does not flag a price the rep actually said", () => {
    const d = validateDraft(
      { lines: [{ id: "tear-off", qty: 30, price: 450 }] },
      "tear off and replace, thirty squares, four fifty a square",
    );
    expect(d.lines[0].unverified).toBeUndefined();
  });

  it("drops a roof size nobody gave", () => {
    expect(validateDraft({ squares: 28 }, "big two storey in Conroe").squares).toBeNull();
    expect(validateDraft({ squares: 28 }, "about twenty eight squares").squares).toBe(28);
  });
});

describe("validateDraft — never throws, never half-fills", () => {
  for (const junk of [null, undefined, "", 42, [], { lines: "nope" }, { lines: [null, 7] }]) {
    it(`returns an empty draft for ${JSON.stringify(junk) ?? "undefined"}`, () => {
      const d = validateDraft(junk, "thirty squares");
      expect(d.lines).toEqual([]);
      expect(d.notes).toBe("");
    });
  }

  it("caps a runaway notes field", () => {
    const d = validateDraft({ notes: "x".repeat(99_999) }, "");
    expect(d.notes.length).toBeLessThanOrEqual(4_000);
  });

  it("caps a runaway unmatched list", () => {
    const d = validateDraft({ unmatched: Array.from({ length: 500 }, (_, i) => `thing ${i}`) }, "");
    expect(d.unmatched.length).toBeLessThanOrEqual(20);
  });
});

describe("the prompt and schema stay in step with the catalogue", () => {
  it("offers the model every catalogue id and nothing else", () => {
    const ids = DRAFT_SCHEMA.properties.lines.items.properties.id.enum;
    expect([...ids].sort()).toEqual(ESTIMATE_ITEMS.map((i) => i.id).sort());
  });

  it("names every item in the system prompt so the model can match speech to it", () => {
    const system = buildDraftSystem();
    for (const item of ESTIMATE_ITEMS) {
      expect(system).toContain(item.id);
      expect(system).toContain(item.label);
    }
  });

  it("tells the model in as many words not to invent a number", () => {
    expect(buildDraftSystem()).toMatch(/null/i);
    expect(buildDraftSystem()).toMatch(/do not price work|not an estimator/i);
  });
});
