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
  it("makes no certification claim at all", async () => {
    // The licensing/credentials line was removed from the proposal at the
    // owner's request (2026-11-28): it opened by telling the customer what the
    // company is NOT, which reads as apology at the moment they are deciding
    // to sign. It still belongs on /warranty and /certifications, where a
    // homeowner is researching rather than signing. Making no claim is
    // strictly safer than making a hedged one, so this now asserts silence.
    const { aboutSection } = await withBusinessInfo({ certStatus: "IKO ROOFPRO applicant" });
    const prose = aboutSection().body.join(" ");
    expect(prose).not.toMatch(/ROOFPRO/i);
    expect(prose).not.toMatch(/licen[cs]/i);
    expect(prose).not.toMatch(/certif/i);
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

describe("which comparison page appears", () => {
  it("shows Class 3 vs Class 4 when Nordic was quoted", async () => {
    const { comparisonFor } = await import("~/lib/proposal-compare");
    expect(comparisonFor("nordic")?.heading).toMatch(/Class 3 vs Class 4/);
  });

  it("shows architectural vs 3-tab when Dynasty was quoted", async () => {
    const { comparisonFor } = await import("~/lib/proposal-compare");
    expect(comparisonFor("dynasty")?.heading).toMatch(/Architectural vs 3-Tab/);
  });

  it("shows nothing for a line with no agreed comparison", async () => {
    const { comparisonFor } = await import("~/lib/proposal-compare");
    expect(comparisonFor("cambridge")).toBeNull();
    expect(comparisonFor(undefined)).toBeNull();
  });

  it("never states a Marathon figure nobody has sourced", async () => {
    // UNVERIFIED #8 in research-facts.md: the 3-tab wind rating every blog
    // repeats has no manufacturer document behind it. The 3-tab column must
    // stay empty rather than plausible.
    const { ARCHITECTURAL_COMPARISON } = await import("~/lib/proposal-compare");
    const theirs = ARCHITECTURAL_COMPARISON.rows.map((r) => r.theirs).join(" ");
    expect(theirs).not.toMatch(/\bmph\b/i);
    expect(theirs).not.toMatch(/Class [1-4]/i);
    expect(theirs).not.toMatch(/Lifetime/i);
  });
});
