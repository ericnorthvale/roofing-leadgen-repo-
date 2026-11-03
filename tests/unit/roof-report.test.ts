import { describe, it, expect } from "vitest";
import {
  pitchToRise12,
  pitchLabel,
  azimuthToCompass,
  complexityFromPlanes,
  wasteAllowance,
  assessConfidence,
  buildRoofSummary,
  formatImageryDate,
  pitchRangeLabel,
  slopeFactor,
  COMMON_SLOPE_FACTORS,
  type RoofPlane,
} from "~/lib/roof-report";
import { reportReference } from "~/lib/roof-report-pdf";

const plane = (areaFt2: number, pitchDeg = 27, azimuthDeg = 180): RoofPlane => ({
  areaFt2,
  pitchDeg,
  azimuthDeg,
});

describe("pitch conversion", () => {
  it("converts degrees to the roofer's rise-over-12", () => {
    expect(pitchToRise12(26.57)).toBe(6); // tan(26.57°)·12 ≈ 6
    expect(pitchToRise12(18.43)).toBe(4);
    expect(pitchToRise12(36.87)).toBe(9);
    expect(pitchToRise12(45)).toBe(12);
  });

  it("labels pitch, and degrades gracefully when unknown", () => {
    expect(pitchLabel(26.57)).toBe("6/12");
    expect(pitchLabel(null)).toBe("—");
    expect(pitchLabel(Number.NaN)).toBe("—");
  });
});

describe("azimuthToCompass", () => {
  it("maps bearings to 8-point compass labels", () => {
    expect(azimuthToCompass(0)).toBe("N");
    expect(azimuthToCompass(180)).toBe("S");
    expect(azimuthToCompass(213.66)).toBe("SW");
    expect(azimuthToCompass(359)).toBe("N"); // wraps
    expect(azimuthToCompass(-90)).toBe("W"); // normalizes negatives
  });
});

describe("complexity + waste allowance", () => {
  it("rates complexity by resolved plane count", () => {
    expect(complexityFromPlanes(2)).toBe("simple");
    expect(complexityFromPlanes(4)).toBe("simple");
    expect(complexityFromPlanes(5)).toBe("moderate");
    expect(complexityFromPlanes(8)).toBe("moderate");
    expect(complexityFromPlanes(9)).toBe("complex");
  });

  it("applies the base allowances, set at the top of the published ranges", () => {
    expect(wasteAllowance(3, 20).percent).toBe(12); // simple gable
    expect(wasteAllowance(6, 20).percent).toBe(15); // hip / dormers
    expect(wasteAllowance(12, 20).percent).toBe(20); // cut-up hip & valley
  });

  it("runs deliberately above the EagleView figure for 5806 Sugar Bush Dr", () => {
    // Owner-supplied report: 17 planes, predominantly 9/12 → EagleView 17%.
    // The model prints 20%. That gap is intended (owner, 2026-10): the extra
    // replaced a separate ordering margin, so an order is never short.
    const w = wasteAllowance(17, 40.0);
    expect(w.complexity).toBe("complex");
    expect(w.percent).toBe(20);
    expect(w.percent).toBeGreaterThan(17);
  });

  it("adds the steep-pitch adder at 9/12 and above only", () => {
    expect(wasteAllowance(6, 26.57).steepAdder).toBe(0); // 6/12 → none
    expect(wasteAllowance(6, 36.87).steepAdder).toBe(0.02); // 9/12 → adder
    expect(wasteAllowance(6, 36.87).percent).toBe(17);
  });

  it("never prints more than the 20% industry ceiling", () => {
    // Complex roofs now sit ON the ceiling, so it binds rather than being a
    // theoretical guard rail — the steep adder must not push past it.
    const worst = wasteAllowance(40, 60);
    expect(worst.base).toBe(0.2);
    expect(worst.steepAdder).toBe(0.02);
    expect(worst.percent).toBe(20);
    expect(worst.factor).toBeLessThanOrEqual(0.2);
  });

  it("treats unknown pitch as not-steep rather than guessing", () => {
    expect(wasteAllowance(6, null).steepAdder).toBe(0);
  });
});

describe("assessConfidence — the honesty gate", () => {
  const base = {
    planeCount: 5,
    imageryQuality: "HIGH" as const,
    coverage: 1,
    buildingFound: true,
  };

  it("passes a clean high-quality measurement", () => {
    expect(assessConfidence(base).level).toBe("good");
  });

  it("blocks when no building was found", () => {
    const v = assessConfidence({ ...base, buildingFound: false });
    expect(v.level).toBe("blocked");
    expect(v.reason).toBe("no-building");
  });

  it("blocks on low-quality imagery (typical under heavy canopy)", () => {
    const v = assessConfidence({ ...base, imageryQuality: "LOW" });
    expect(v.level).toBe("blocked");
    expect(v.reason).toBe("low-imagery");
  });

  it("blocks when too few roof planes resolve", () => {
    expect(assessConfidence({ ...base, planeCount: 1 }).reason).toBe("too-few-planes");
    expect(assessConfidence({ ...base, planeCount: 0 }).level).toBe("blocked");
  });

  it("blocks when planes don't account for the whole roof", () => {
    const v = assessConfidence({ ...base, coverage: 0.6 });
    expect(v.level).toBe("blocked");
    expect(v.reason).toBe("heavy-occlusion");
  });

  it("warns (not blocks) on partial coverage just above the floor", () => {
    const v = assessConfidence({ ...base, coverage: 0.85 });
    expect(v.level).toBe("reduced");
    expect(v.reason).toBe("partial-coverage");
  });

  it("warns on medium imagery", () => {
    expect(assessConfidence({ ...base, imageryQuality: "MEDIUM" }).level).toBe("reduced");
  });

  it("blocking beats warning when both apply", () => {
    const v = assessConfidence({ ...base, imageryQuality: "LOW", coverage: 0.85 });
    expect(v.level).toBe("blocked");
  });
});

describe("buildRoofSummary", () => {
  it("summarizes a clean three-plane roof end to end", () => {
    const s = buildRoofSummary({
      planes: [plane(600, 26.57), plane(600, 26.57), plane(400, 26.57)],
      surfaceFt2: 1600,
      footprintFt2: 1430,
      wholeRoofFt2: 1600,
      imageryQuality: "HIGH",
      imageryDate: { year: 2023, month: 3, day: 28 },
    });
    expect(s.squares).toBe(16);
    expect(s.confidence.level).toBe("good");
    expect(s.waste.percent).toBe(12); // 3 planes → simple
    expect(s.squaresWithWaste).toBe(17.9);
    expect(s.avgPitchDeg).toBe(27);
  });

  it("area-weights average pitch rather than averaging planes evenly", () => {
    // A big shallow plane and a tiny steep one must not average to the middle.
    const s = buildRoofSummary({
      planes: [plane(1900, 18.43), plane(100, 45)],
      surfaceFt2: 2000,
      footprintFt2: 1900,
      wholeRoofFt2: 2000,
      imageryQuality: "HIGH",
    });
    expect(s.avgPitchDeg).toBe(20); // weighted toward the large shallow plane
  });

  it("blocks when resolved planes fall short of the whole roof", () => {
    const s = buildRoofSummary({
      planes: [plane(400), plane(300)],
      surfaceFt2: 700,
      footprintFt2: 640,
      wholeRoofFt2: 1600, // planes cover only 44% — trees hiding the rest
      imageryQuality: "HIGH",
    });
    expect(s.confidence.level).toBe("blocked");
    expect(s.confidence.reason).toBe("heavy-occlusion");
  });

  it("treats a missing whole-roof figure as full coverage, not zero", () => {
    const s = buildRoofSummary({
      planes: [plane(800), plane(800)],
      surfaceFt2: 1600,
      footprintFt2: 1430,
      imageryQuality: "HIGH",
    });
    expect(s.confidence.level).toBe("good");
  });
});

describe("formatImageryDate", () => {
  it("formats month and year", () => {
    expect(formatImageryDate({ year: 2023, month: 3, day: 28 })).toBe("March 2023");
  });
  it("falls back to year alone, and null when absent", () => {
    expect(formatImageryDate({ year: 2024 })).toBe("2024");
    expect(formatImageryDate(null)).toBeNull();
  });
});

describe("wrong-building detection (owner bug report, 2026-10)", () => {
  const base = {
    planeCount: 5,
    imageryQuality: "HIGH" as const,
    coverage: 1,
    buildingFound: true,
  };

  it("blocks when the matched building is far from the address", () => {
    // Verified against the live API: moving the pin 20 m returns a different
    // building entirely (11.4 squares vs 2.7), so a large offset is fatal.
    const v = assessConfidence({ ...base, buildingOffsetM: 60 });
    expect(v.level).toBe("blocked");
    expect(v.reason).toBe("wrong-building");
  });

  it("warns when the offset is plausible but worth eyeballing", () => {
    const v = assessConfidence({ ...base, buildingOffsetM: 30 });
    expect(v.level).toBe("reduced");
    expect(v.reason).toBe("distant-building");
  });

  it("passes a tight match, and when offset is unknown", () => {
    expect(assessConfidence({ ...base, buildingOffsetM: 8 }).level).toBe("good");
    expect(assessConfidence({ ...base, buildingOffsetM: null }).level).toBe("good");
  });
});

describe("pitch range (owner: 'the roof is more than a 6 slope')", () => {
  it("reports the spread, not just the area-weighted average", () => {
    // Big shallow hips + smaller steep gables: the average alone reads 6/12
    // and hides the 12/12 sections the homeowner can see from the kerb.
    const s = buildRoofSummary({
      planes: [plane(1200, 26.57), plane(1200, 26.57), plane(600, 45), plane(600, 45)],
      surfaceFt2: 3600,
      footprintFt2: 3200,
      wholeRoofFt2: 3600,
      imageryQuality: "HIGH",
    });
    expect(pitchRangeLabel(s.pitchRangeDeg)).toBe("6/12–12/12");
    expect(pitchToRise12(s.avgPitchDeg!)).toBe(8); // the misleading single number
  });

  it("collapses to one value when the roof really is uniform", () => {
    const s = buildRoofSummary({
      planes: [plane(900, 26.57), plane(900, 26.9)],
      surfaceFt2: 1800,
      footprintFt2: 1600,
      wholeRoofFt2: 1800,
      imageryQuality: "HIGH",
    });
    expect(pitchRangeLabel(s.pitchRangeDeg)).toBe("6/12");
  });

  it("ignores slivers so a tiny dormer can't set the headline", () => {
    const s = buildRoofSummary({
      planes: [plane(1500, 26.57), plane(1400, 26.57), plane(12, 60)],
      surfaceFt2: 2912,
      footprintFt2: 2600,
      wholeRoofFt2: 2912,
      imageryQuality: "HIGH",
    });
    expect(pitchRangeLabel(s.pitchRangeDeg)).toBe("6/12");
  });

  it("drives the steep-pitch waste adder off the steepest real plane", () => {
    // Average is 8/12 so the old logic added nothing; the 12/12 sections are
    // exactly where the cutting loss happens.
    const s = buildRoofSummary({
      planes: [plane(1200, 26.57), plane(1200, 26.57), plane(600, 45), plane(600, 45)],
      surfaceFt2: 3600,
      footprintFt2: 3200,
      wholeRoofFt2: 3600,
      imageryQuality: "HIGH",
    });
    expect(s.waste.steepAdder).toBe(0.02);
  });
});

describe("slopeFactor", () => {
  it("is pure sec(pitch) geometry, not a waste factor", () => {
    expect(slopeFactor(0)).toBe(1);
    expect(slopeFactor(4)).toBeCloseTo(1.054, 3);
    expect(slopeFactor(6)).toBeCloseTo(1.118, 3);
    expect(slopeFactor(9)).toBeCloseTo(1.25, 3);
    expect(slopeFactor(12)).toBeCloseTo(1.414, 3);
  });

  it("agrees with the surface-over-footprint ratio a summary reports", () => {
    const s = buildRoofSummary({
      planes: [plane(1250, 36.87), plane(1250, 36.87)],
      surfaceFt2: 2500,
      footprintFt2: 2000,
      wholeRoofFt2: 2500,
      imageryQuality: "HIGH",
    });
    // 9/12 roof: 2000 ft² of ground carries 2500 ft² of roof.
    expect(s.surfaceFt2 / s.footprintFt2).toBeCloseTo(slopeFactor(9), 2);
  });

  it("offers reference factors the report can print", () => {
    expect(COMMON_SLOPE_FACTORS).toContain(9);
    expect(COMMON_SLOPE_FACTORS.every((r) => slopeFactor(r) > 1)).toBe(true);
  });
});

describe("reportReference", () => {
  const day = new Date("2026-10-07T12:00:00Z");

  it("encodes the date and stays stable for the same address", () => {
    const a = reportReference("5806 Sugar Bush Dr, Magnolia, TX 77354", day);
    expect(a).toMatch(/^RM-261007-[A-Z2-9]{4}$/);
    expect(reportReference("5806 Sugar Bush Dr, Magnolia, TX 77354", day)).toBe(a);
  });

  it("separates two addresses measured on the same day", () => {
    expect(reportReference("1 Main St, Spring, TX", day)).not.toBe(
      reportReference("2 Main St, Spring, TX", day),
    );
  });

  it("avoids glyphs that get misread aloud or over the phone", () => {
    const tail = reportReference("3019 Rushing Brook Dr, Kingwood, TX", day).split("-")[2];
    expect(tail).not.toMatch(/[IO01]/);
  });
});

describe("waste allowance sits at the upper end of published guidance", () => {
  it("uses 12 / 15 / 20 by complexity", () => {
    expect(wasteAllowance(3, null).percent).toBe(12);
    expect(wasteAllowance(6, null).percent).toBe(15);
    expect(wasteAllowance(12, null).percent).toBe(20);
  });

  it("never prints more than the 20% ceiling, even with the steep adder", () => {
    // Complex roofs already sit on the cap, so the adder has nowhere to go.
    const steep = wasteAllowance(12, 36.87); // 9/12
    expect(steep.steepAdder).toBe(0.02);
    expect(steep.percent).toBe(20);
  });

  it("still lets the steep adder bite where there is headroom", () => {
    expect(wasteAllowance(3, 36.87).percent).toBe(14);
    expect(wasteAllowance(6, 36.87).percent).toBe(17);
  });

  it("applies the allowance to squares without touching the measured area", () => {
    const s = buildRoofSummary({
      planes: [plane(2000, 26.57), plane(2000, 26.57)],
      surfaceFt2: 4000,
      footprintFt2: 3578,
      wholeRoofFt2: 4000,
      imageryQuality: "HIGH",
    });
    expect(s.squares).toBe(40);
    expect(s.waste.percent).toBe(12);
    expect(s.squaresWithWaste).toBe(44.8);
  });
});
