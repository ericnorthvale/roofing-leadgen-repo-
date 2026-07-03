import type { DataCompleteness } from "./quality-gate";
import type { ServiceAreaSlug, ServiceAreaProject, ServiceAreaTestimonial } from "./service-areas";
import type { ServiceFaq } from "./services";

/**
 * Neighborhood (village) landing pages — the deepest level of the local
 * hub-and-spoke: city hub → service-in-city spokes → neighborhood pages.
 *
 * HARD RULE: every record must be distinct on the fields that matter
 * (development era, housing stock, covenant/design-review specifics). The
 * quality gate (evaluateNeighborhood) treats those as hard requirements, so a
 * name-swapped record can never index. Facts must be sourced — see
 * docs/research-facts.md for the citations behind each field.
 */
export interface Neighborhood {
  slug: string;
  name: string;
  citySlug: ServiceAreaSlug;
  county: "Harris" | "Montgomery";
  /** Unique SEO <title> (brand appended by the layout). */
  seoTitle: string;
  /** Unique meta description, ≤160 chars. */
  seoDescription: string;
  /** Distinct hero subhead. */
  intro: string;
  /** Sourced local context — what makes roofing HERE different. */
  localContext: string;
  /** When the village opened / built out (sourced) — drives roof-age framing. */
  developmentEra?: string;
  /** Distinct housing-stock note (styles, price tier, roof types). */
  housingStock?: string;
  /** Covenant / design-review specifics for re-roofing in this village. */
  hoaNote?: string;
  /** Named places inside the village (real). */
  landmarks?: string[];
  faqs?: ServiceFaq[];

  // --- Real-world proof (recommended, not required to index). NEVER fabricate. ---
  projects?: ServiceAreaProject[];
  testimonials?: ServiceAreaTestimonial[];
  photos?: { src: string; alt: string }[];

  /** Quality gate — stays "draft" (noindex, out of sitemap) until real. */
  dataCompleteness: DataCompleteness;
}

/** Populated in this file as research-backed records land. Keyed by slug. */
export const NEIGHBORHOODS: Record<string, Neighborhood> = {};

export const NEIGHBORHOOD_SLUGS = Object.keys(NEIGHBORHOODS);

export function neighborhoodsForCity(citySlug: ServiceAreaSlug): Neighborhood[] {
  return Object.values(NEIGHBORHOODS).filter((n) => n.citySlug === citySlug);
}
