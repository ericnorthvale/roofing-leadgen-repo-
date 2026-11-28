import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The proposal's prose, tested for what it REFUSES to say.
 *
 * The risk in a generated proposal is not a typo. It is a sentence the company
 * never agreed to, printed on its letterhead, handed to a homeowner who keeps
 * it. So these tests mostly assert absence: no warranty section without a real
 * term, no coverage list invented around a term, no credentials claim beyond
 * what business-info.json actually holds.
 */

async function withBusinessInfo(overrides: Record<string, unknown>) {
  vi.resetModules();
  const actual = await vi.importActual<Record<string, unknown>>("~/data/business-info.json");
  vi.doMock("~/data/business-info.json", () => ({
    default: { ...actual, ...overrides },
  }));
  return import("~/lib/proposal-copy");
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.doUnmock("~/data/business-info.json"));

describe("warranty section", () => {
  it("prints the term the owner actually gave", async () => {
    const { warrantySection } = await withBusinessInfo({
      warranties: "5-year workmanship warranty",
    });
    const section = warrantySection();
    expect(section).not.toBeNull();
    expect(section!.body.join(" ")).toContain("5-year workmanship warranty");
  });

  it("prints NOTHING when no term has been supplied", async () => {
    // The whole point. An empty field must produce no warranty section at all,
    // not a generic paragraph that sounds like a warranty.
    const { warrantySection } = await withBusinessInfo({ warranties: "" });
    expect(warrantySection()).toBeNull();
  });

  it("never invents a coverage list around the term", async () => {
    const { warrantySection } = await withBusinessInfo({
      warranties: "5-year workmanship warranty",
    });
    const prose = warrantySection()!.body.join(" ").toLowerCase();
    // Phrases a model reaches for that nobody at Northvale has agreed to.
    for (const invented of [
      "lifetime",
      "fully transferable",
      "100%",
      "parts and labor",
      "no questions asked",
      "unlimited",
    ]) {
      expect(prose).not.toContain(invented);
    }
  });
});

describe("credentials", () => {
  it("claims only the certification status on file", async () => {
    const { aboutSection } = await withBusinessInfo({ certStatus: "IKO ROOFPRO applicant" });
    const prose = aboutSection().body.join(" ");
    expect(prose).toContain("IKO ROOFPRO applicant");
    // Named ROOFPRO tiers are not held and must never be asserted.
    expect(prose).not.toMatch(/ROOFPRO (Select|Premium|Craftsman)/i);
  });

  it("carries no competitor brand onto the proposal", async () => {
    const { aboutSection, SCOPE_INTRO, ACCEPTANCE } = await withBusinessInfo({});
    const all = [aboutSection().body.join(" "), SCOPE_INTRO, ACCEPTANCE.body].join(" ");
    for (const brand of ["GAF", "Timberline", "TAMKO", "CertainTeed", "Owens Corning"]) {
      expect(all).not.toContain(brand);
    }
  });
});

describe("the opening", () => {
  it("greets by first name and names the property", async () => {
    const { openingParagraphs } = await withBusinessInfo({});
    const text = openingParagraphs("Dale Whitaker", "118 Red Cedar Dr").join(" ");
    expect(text).toContain("Dale,");
    expect(text).toContain("118 Red Cedar Dr");
    expect(text).not.toContain("Whitaker,"); // first name, not the surname
  });

  it("stays readable when the rep left the name blank", async () => {
    const { openingParagraphs } = await withBusinessInfo({});
    const text = openingParagraphs("", "").join(" ");
    expect(text).not.toContain("undefined");
    expect(text).not.toContain("null");
    expect(text).not.toMatch(/\s,/); // no ", thank you" with nothing before it
  });
});

describe("blanks surfaced to the rep", () => {
  it("names a missing warranty term", async () => {
    const { missingFacts } = await withBusinessInfo({ warranties: "" });
    expect(missingFacts().join(" ")).toMatch(/warranty/i);
  });

  it("says nothing once the facts are in", async () => {
    const { missingFacts } = await withBusinessInfo({
      warranties: "5-year workmanship warranty",
      addressLine1: "1 Example St",
      financing: "Financing available",
    });
    expect(missingFacts()).toEqual([]);
  });
});
