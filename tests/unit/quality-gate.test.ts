import { describe, it, expect } from "vitest";
import { evaluateArea, evaluateService } from "~/lib/quality-gate";
import type { ServiceArea } from "~/lib/service-areas";
import type { Service } from "~/lib/services";

const completeArea: ServiceArea = {
  slug: "spring",
  name: "Spring",
  county: "Harris",
  landmarks: ["Klein"],
  neighborhoods: ["Klein", "Gleannloch Farms", "Old Town Spring", "Champions Forest"],
  intro: "Based off I-45 in Spring.",
  localContext: "Spring sits in the hail corridor north of Houston.",
  climateNote: "Spring storms bring large hail and straight-line winds.",
  permitHoaNote: "Harris County permitting plus HOA architectural review applies.",
  commonRoofTypes: ["architectural asphalt shingle", "3-tab asphalt shingle"],
  dataCompleteness: "complete",
};

const completeService: Service = {
  slug: "roof-repair",
  title: "Roof repair",
  serviceTag: "repair",
  seoTitle: "Roof repair",
  seoDescription: "Same-day roof repair.",
  summary: "Leaks, lifted shingles, failed flashing.",
  sections: [
    { heading: "A", body: "x" },
    { heading: "B", body: "y" },
    { heading: "C", body: "z" },
  ],
  dataCompleteness: "complete",
};

describe("evaluateArea", () => {
  it("blocks a draft area from indexing even when fields are full", () => {
    const verdict = evaluateArea({ ...completeArea, dataCompleteness: "draft" });
    expect(verdict.indexable).toBe(false);
  });

  it("indexes a complete area with all required fields (real NAP present)", () => {
    const verdict = evaluateArea(completeArea, { hasNap: true });
    expect(verdict.indexable).toBe(true);
    expect(verdict.missing).toHaveLength(0);
  });

  it("blocks a complete, content-rich area when the phone is still a placeholder", () => {
    const verdict = evaluateArea(completeArea, { hasNap: false });
    expect(verdict.indexable).toBe(false);
    expect(verdict.missing.some((m) => m.toLowerCase().includes("phone"))).toBe(true);
  });

  it("blocks a complete area that is missing required content", () => {
    const verdict = evaluateArea(
      { ...completeArea, climateNote: undefined, neighborhoods: ["Klein"] },
      { hasNap: true },
    );
    expect(verdict.indexable).toBe(false);
    expect(verdict.missing.length).toBeGreaterThan(0);
  });

  it("flags missing real-world proof without blocking indexing", () => {
    const verdict = evaluateArea(completeArea, { hasNap: true });
    expect(verdict.recommended.length).toBeGreaterThan(0);
    expect(verdict.indexable).toBe(true);
  });
});

describe("evaluateService", () => {
  it("indexes a complete service with enough sections", () => {
    expect(evaluateService(completeService).indexable).toBe(true);
  });

  it("blocks a draft service", () => {
    expect(evaluateService({ ...completeService, dataCompleteness: "draft" }).indexable).toBe(
      false,
    );
  });

  it("blocks a complete service with too few sections", () => {
    const verdict = evaluateService({
      ...completeService,
      sections: [{ heading: "A", body: "x" }],
    });
    expect(verdict.indexable).toBe(false);
  });
});
