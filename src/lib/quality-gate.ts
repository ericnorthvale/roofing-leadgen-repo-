/**
 * Quality gate — the anti-doorway / anti-thin-content guardrail.
 *
 * A data-driven page (a service area, or a service) is only allowed into the
 * index + sitemap when:
 *   1. a human has explicitly marked the record `dataCompleteness: "complete"`, AND
 *   2. the record carries the required, page-specific, REAL content fields.
 *
 * Anything else renders `noindex` and is excluded from the sitemap until a
 * human fills in real data. We never auto-fill or invent the missing content.
 *
 * `recommended` items (real projects / testimonials / photos) strengthen a page
 * but are NOT required to index — a brand-new contractor legitimately has none
 * yet, and gating on them would pressure fabrication, which is the opposite of
 * what this gate is for. They surface as flags, not blockers.
 */
import type { ServiceArea } from "./service-areas";
import type { Service } from "./services";
import businessInfo from "../data/business-info.json";

export type DataCompleteness = "complete" | "draft";

const PLACEHOLDER_PHONE = "+12810000000";

/**
 * True only when the business has a real, publishable NAP (not the placeholder
 * phone, and a real street address + ZIP). Local/city pages must not be indexed
 * with a fake phone, so this gates their indexability — they auto-publish the
 * moment the owner enters real NAP in the admin panel.
 */
export function hasRealNap(): boolean {
  return (
    businessInfo.phoneE164.trim().length > 0 &&
    businessInfo.phoneE164 !== PLACEHOLDER_PHONE &&
    businessInfo.addressLine1.trim().length > 0 &&
    businessInfo.postalCode.trim().length > 0
  );
}

export interface QualityVerdict {
  /** Safe to index + include in sitemap. */
  indexable: boolean;
  /** Hard requirements still missing (block indexing). */
  missing: string[];
  /** Real-world proof that would strengthen the page (does not block indexing). */
  recommended: string[];
}

const MIN_NEIGHBORHOODS = 4;
const MIN_ROOF_TYPES = 2;
const MIN_SERVICE_SECTIONS = 3;

function verdict(
  dataCompleteness: DataCompleteness,
  requirements: Record<string, boolean>,
  recommendations: Record<string, boolean> = {},
): QualityVerdict {
  const missing = Object.entries(requirements)
    .filter(([, ok]) => !ok)
    .map(([label]) => label);
  const recommended = Object.entries(recommendations)
    .filter(([, ok]) => !ok)
    .map(([label]) => label);
  return {
    indexable: dataCompleteness === "complete" && missing.length === 0,
    missing,
    recommended,
  };
}

const filled = (s?: string) => !!s && s.trim().length > 0;

/**
 * Quality verdict for a service-area (city) page. `opts.hasNap` overrides the
 * real-NAP check (defaults to the live business info) — handy for tests.
 */
export function evaluateArea(area: ServiceArea, opts: { hasNap?: boolean } = {}): QualityVerdict {
  return verdict(
    area.dataCompleteness,
    {
      "real business NAP (phone + address)": opts.hasNap ?? hasRealNap(),
      "distinct local intro": filled(area.intro),
      "factual local context": filled(area.localContext),
      [`${MIN_NEIGHBORHOODS}+ named neighborhoods`]:
        (area.neighborhoods?.length ?? 0) >= MIN_NEIGHBORHOODS,
      "local climate / storm note": filled(area.climateNote),
      "permit / HOA note": filled(area.permitHoaNote),
      [`${MIN_ROOF_TYPES}+ common local roof types`]:
        (area.commonRoofTypes?.length ?? 0) >= MIN_ROOF_TYPES,
    },
    {
      "a real local project": (area.projects?.length ?? 0) >= 1,
      "a real local testimonial": (area.testimonials?.length ?? 0) >= 1,
      "real local photos": (area.photos?.length ?? 0) >= 1,
    },
  );
}

/** Quality verdict for a service page. */
export function evaluateService(service: Service): QualityVerdict {
  return verdict(service.dataCompleteness, {
    summary: filled(service.summary),
    [`${MIN_SERVICE_SECTIONS}+ content sections`]:
      (service.sections?.length ?? 0) >= MIN_SERVICE_SECTIONS,
  });
}
