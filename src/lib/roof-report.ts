/**
 * Roof measurement report — shared math and honesty gates.
 *
 * Used by /roof-size-calculator (browser) and /api/roof-measure (server) so a
 * number shown on screen is byte-identical to the number printed in the PDF.
 *
 * Two rules drive everything here:
 *  1. A measurement we can't stand behind is BLOCKED, not fudged. Heavy tree
 *     canopy is the common cause in this market (pine belt), and it shows up
 *     as low imagery quality, too few resolved planes, or roof planes that
 *     don't add up to the whole roof. Owner decision 2026-10: block, never
 *     publish a soft number (see docs/research-facts.md Sheet 8).
 *  2. Waste allowance is an INDUSTRY-STANDARD estimate driven by roof
 *     complexity (plane count), with a steep-pitch adder — never a Northvale
 *     guarantee and never a material order. Percentages sourced in Sheet 8.
 */

/** One roof plane as measured from aerial data. */
export interface RoofPlane {
  /** Sloped surface area of this plane, square feet. */
  areaFt2: number;
  /** Plane slope in degrees. */
  pitchDeg: number;
  /** Compass bearing the plane faces, degrees (0 = north). */
  azimuthDeg: number;
}

export type Confidence = "good" | "reduced" | "blocked";

export interface ConfidenceVerdict {
  level: Confidence;
  /** Machine-readable cause, for logs/tests. */
  reason:
    | "ok"
    | "medium-imagery"
    | "partial-coverage"
    | "distant-building"
    | "low-imagery"
    | "too-few-planes"
    | "heavy-occlusion"
    | "no-building"
    | "wrong-building";
  /** Plain-English line shown to the homeowner. */
  message: string;
}

/** Google's own imagery-quality grade for the capture. */
export type ImageryQuality = "HIGH" | "MEDIUM" | "LOW" | null;

const SQ_FT_PER_SQUARE = 100;

/* ---------------------------------------------------------------- units -- */

/** Degrees → roofer's rise-over-12. 27.1° → 6 (i.e. "6/12"). */
export function pitchToRise12(pitchDeg: number): number {
  return Math.round(Math.tan((pitchDeg * Math.PI) / 180) * 12);
}

/** "6/12" label, or "—" when pitch is unknown. */
export function pitchLabel(pitchDeg: number | null): string {
  if (pitchDeg == null || !Number.isFinite(pitchDeg)) return "—";
  return `${pitchToRise12(pitchDeg)}/12`;
}

/**
 * "6/12" when the roof is uniform, "6/12–12/12" when it isn't.
 *
 * A single area-weighted average is actively misleading on a cut-up roof: the
 * big shallow hips outweigh the small steep gables, so a roof with 12/12
 * sections can average out to 7/12 and the homeowner rightly says "that's not
 * my roof" (owner feedback, 2026-10). Always show the spread.
 */
export function pitchRangeLabel(range: { minDeg: number; maxDeg: number } | null): string {
  if (!range) return "—";
  const lo = pitchToRise12(range.minDeg);
  const hi = pitchToRise12(range.maxDeg);
  return lo === hi ? `${lo}/12` : `${lo}/12–${hi}/12`;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

/** Azimuth degrees → 8-point compass label. */
export function azimuthToCompass(azimuthDeg: number): string {
  const normalized = ((azimuthDeg % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 45) % 8];
}

/* ------------------------------------------------------------ complexity -- */

export type Complexity = "simple" | "moderate" | "complex";

/**
 * Roof complexity from the number of distinct planes aerial data resolved.
 * Plane count is the measurable proxy for the hips, valleys and dormers that
 * actually drive cutting waste (Sheet 8).
 */
export function complexityFromPlanes(planeCount: number): Complexity {
  if (planeCount <= 4) return "simple";
  if (planeCount <= 8) return "moderate";
  return "complex";
}

export const COMPLEXITY_LABEL: Record<Complexity, string> = {
  simple: "Simple — gable-style, few cuts",
  moderate: "Moderate — hip and/or dormers",
  complex: "Complex — cut-up hip & valley",
};

/* ----------------------------------------------------------------- waste -- */

/** Industry-standard base allowances by complexity (Sheet 8). */
const BASE_WASTE: Record<Complexity, number> = {
  simple: 0.1,
  moderate: 0.15,
  complex: 0.18,
};

/** Steep roofs add handling/cut loss. Applied at 9/12 and above (Sheet 8). */
const STEEP_RISE_THRESHOLD = 9;
const STEEP_ADDER = 0.02;
/** Industry guidance tops out around 20%; never print more. */
const WASTE_CAP = 0.2;

export interface WasteResult {
  complexity: Complexity;
  /** Base allowance before the steep-pitch adder, e.g. 0.15. */
  base: number;
  /** Steep-pitch adder actually applied (0 or 0.02). */
  steepAdder: number;
  /** Final allowance, capped. e.g. 0.17 */
  factor: number;
  /** Whole-number percent for display, e.g. 17. */
  percent: number;
}

/**
 * Waste allowance from measured complexity and pitch. Presentation-only — it
 * never changes the measured area, it's added alongside it.
 */
export function wasteAllowance(planeCount: number, avgPitchDeg: number | null): WasteResult {
  const complexity = complexityFromPlanes(planeCount);
  const base = BASE_WASTE[complexity];
  const rise = avgPitchDeg == null ? 0 : pitchToRise12(avgPitchDeg);
  const steepAdder = rise >= STEEP_RISE_THRESHOLD ? STEEP_ADDER : 0;
  const factor = Math.min(WASTE_CAP, base + steepAdder);
  return {
    complexity,
    base,
    steepAdder,
    factor,
    percent: Math.round(factor * 100),
  };
}

/* ------------------------------------------------------------ confidence -- */

/**
 * Minimum share of the whole roof that resolved planes must account for.
 * Below this, canopy or imagery gaps are hiding part of the roof.
 */
const COVERAGE_BLOCK = 0.8;
const COVERAGE_WARN = 0.92;
/** A real house resolves at least two planes; one or zero means occlusion. */
const MIN_PLANES = 2;

export interface ConfidenceInput {
  planeCount: number;
  imageryQuality: ImageryQuality;
  /** Sum of plane areas ÷ whole-roof area, 0–1. */
  coverage: number;
  /** False when the lookup found no building at all. */
  buildingFound: boolean;
  /**
   * Metres between the address we asked about and the centre of the building
   * the aerial service actually matched. Google's `findClosest` returns the
   * nearest structure, which 20 m away can be a neighbour's house, a detached
   * garage or a shed — verified 2026-10, see Sheet 8. A large offset is the
   * single most dangerous failure because the number still looks plausible.
   */
  buildingOffsetM?: number | null;
}

/** Past this, we're probably measuring the wrong structure entirely. */
const OFFSET_BLOCK_M = 45;
/** Past this, worth flagging — large homes can legitimately sit this far off. */
const OFFSET_WARN_M = 25;

const BLOCKED_TREES =
  "We can't get a trustworthy measurement here — tree cover or the available aerial imagery is hiding part of this roof. Rather than show you a number we don't trust, we'll measure it properly on site, free.";

/**
 * Decide whether a measurement is publishable. Blocking is deliberate: a
 * confident wrong number is worse than no number (owner, 2026-10).
 */
export function assessConfidence(input: ConfidenceInput): ConfidenceVerdict {
  if (!input.buildingFound) {
    return {
      level: "blocked",
      reason: "no-building",
      message:
        "We couldn't find a building at that address in the aerial data. Double-check the address, or let us measure it on site — it's free either way.",
    };
  }
  if (input.imageryQuality === "LOW") {
    return { level: "blocked", reason: "low-imagery", message: BLOCKED_TREES };
  }
  if (input.planeCount < MIN_PLANES) {
    return { level: "blocked", reason: "too-few-planes", message: BLOCKED_TREES };
  }
  if (input.coverage < COVERAGE_BLOCK) {
    return { level: "blocked", reason: "heavy-occlusion", message: BLOCKED_TREES };
  }
  if (input.buildingOffsetM != null && input.buildingOffsetM > OFFSET_BLOCK_M) {
    return {
      level: "blocked",
      reason: "wrong-building",
      message:
        "The nearest building in the aerial data sits well away from this address, so we'd likely be measuring a neighbour's roof, a garage or a shed. Check the pin on the map, trace the roof yourself, or let us measure it on site — free.",
    };
  }
  if (input.buildingOffsetM != null && input.buildingOffsetM > OFFSET_WARN_M) {
    return {
      level: "reduced",
      reason: "distant-building",
      message:
        "Check the highlighted area on the map is your roof — the matched building sits a little off the address pin.",
    };
  }
  if (input.coverage < COVERAGE_WARN) {
    return {
      level: "reduced",
      reason: "partial-coverage",
      message:
        "Partly obscured — some of this roof is hidden by trees, so treat this as a close estimate. We'll confirm it on site.",
    };
  }
  if (input.imageryQuality === "MEDIUM") {
    return {
      level: "reduced",
      reason: "medium-imagery",
      message:
        "The aerial imagery here is lower resolution than we'd like, so treat this as a close estimate. We'll confirm it on site.",
    };
  }
  return {
    level: "good",
    reason: "ok",
    message: "Measured plane by plane from high-quality aerial imagery.",
  };
}

/* --------------------------------------------------------------- summary -- */

export interface RoofSummary {
  /** Total sloped roof surface, ft². */
  surfaceFt2: number;
  /** Building footprint, ft². */
  footprintFt2: number;
  squares: number;
  avgPitchDeg: number | null;
  /** Shallowest and steepest measured plane — the honest headline figure. */
  pitchRangeDeg: { minDeg: number; maxDeg: number } | null;
  planes: RoofPlane[];
  waste: WasteResult;
  /** Measured squares plus the waste allowance, for ordering. */
  squaresWithWaste: number;
  confidence: ConfidenceVerdict;
  imageryQuality: ImageryQuality;
  imageryDate: { year?: number; month?: number; day?: number } | null;
}

/** Round half-up to `places` decimals (JS toFixed is unreliable on .x5). */
const round = (n: number, places = 1) => {
  const f = 10 ** places;
  return Math.round(n * f + Number.EPSILON) / f;
};

export interface BuildSummaryInput {
  planes: RoofPlane[];
  surfaceFt2: number;
  footprintFt2: number;
  /** Whole-roof surface ft² as reported independently of the planes. */
  wholeRoofFt2?: number;
  imageryQuality: ImageryQuality;
  imageryDate?: { year?: number; month?: number; day?: number } | null;
  buildingFound?: boolean;
  /** Metres from the requested address to the matched building's centre. */
  buildingOffsetM?: number | null;
  /**
   * "aerial" runs the full occlusion gate. "manual" means a person traced the
   * outline themselves on the satellite view — they can see the trees, so the
   * aerial-confidence checks don't apply and must not block their own work.
   */
  method?: "aerial" | "manual";
}

/** Assemble everything the screen and the PDF both render. */
export function buildRoofSummary(input: BuildSummaryInput): RoofSummary {
  const planes = input.planes ?? [];
  const surfaceFt2 = Math.max(0, input.surfaceFt2);
  const planeSum = planes.reduce((acc, p) => acc + p.areaFt2, 0);
  const whole = input.wholeRoofFt2 && input.wholeRoofFt2 > 0 ? input.wholeRoofFt2 : surfaceFt2;
  // Coverage compares resolved planes against the whole-roof figure. When the
  // API gives no independent whole-roof number, coverage is 1 by definition.
  const coverage = whole > 0 ? Math.min(1, planeSum / whole) : 0;

  const avgPitchDeg =
    planeSum > 0 ? planes.reduce((acc, p) => acc + p.pitchDeg * p.areaFt2, 0) / planeSum : null;

  // Ignore slivers when quoting the spread — a tiny dormer cheek shouldn't set
  // the headline pitch for the whole roof.
  const significant = planes.filter((p) => p.areaFt2 >= Math.max(40, planeSum * 0.03));
  const forRange = significant.length > 0 ? significant : planes;
  const pitchRangeDeg =
    forRange.length > 0
      ? {
          minDeg: Math.min(...forRange.map((p) => p.pitchDeg)),
          maxDeg: Math.max(...forRange.map((p) => p.pitchDeg)),
        }
      : null;

  // Waste follows the STEEPEST significant plane, not the average: the steep
  // sections are where the cutting loss actually happens.
  const waste = wasteAllowance(planes.length, pitchRangeDeg?.maxDeg ?? avgPitchDeg);
  const squares = surfaceFt2 / SQ_FT_PER_SQUARE;

  const confidence: ConfidenceVerdict =
    input.method === "manual"
      ? surfaceFt2 > 0
        ? {
            level: "good",
            reason: "ok",
            message: "Traced by hand on the satellite view and measured from that outline.",
          }
        : {
            level: "blocked",
            reason: "no-building",
            message: "Outline the roof on the map to get a measurement.",
          }
      : assessConfidence({
          planeCount: planes.length,
          imageryQuality: input.imageryQuality,
          coverage,
          buildingFound: input.buildingFound ?? surfaceFt2 > 0,
          buildingOffsetM: input.buildingOffsetM ?? null,
        });

  return {
    surfaceFt2: Math.round(surfaceFt2),
    footprintFt2: Math.round(Math.max(0, input.footprintFt2)),
    squares: round(squares, 1),
    avgPitchDeg: avgPitchDeg == null ? null : round(avgPitchDeg, 0),
    pitchRangeDeg,
    planes,
    waste,
    squaresWithWaste: round(squares * (1 + waste.factor), 1),
    confidence,
    imageryQuality: input.imageryQuality,
    imageryDate: input.imageryDate ?? null,
  };
}

/** "March 2023" from Google's imagery date, or null. */
export function formatImageryDate(d: RoofSummary["imageryDate"]): string | null {
  if (!d?.year) return null;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const m = d.month && d.month >= 1 && d.month <= 12 ? `${months[d.month - 1]} ` : "";
  return `${m}${d.year}`;
}
