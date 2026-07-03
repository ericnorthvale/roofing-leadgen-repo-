import type { DataCompleteness } from "./quality-gate";
import type { ServiceAreaSlug } from "./service-areas";
import type { ServiceTag, ServiceSection, ServiceFaq } from "./services";

/**
 * Service-in-city pages (e.g. /the-woodlands/roof-replacement) — the pages that
 * target the money queries ("roof replacement The Woodlands"). One record per
 * (city, service) pair we can write DISTINCT local content for.
 *
 * HARD RULE: a record here must never be the generic service page with the city
 * name swapped in. Sections must be locally specific — covenants, local permits,
 * local storm history, local housing stock. The quality gate
 * (evaluateCityService) additionally requires local FAQs. Facts must be sourced
 * — see docs/research-facts.md.
 */
export interface CityService {
  citySlug: ServiceAreaSlug;
  serviceTag: ServiceTag;
  /** URL child segment, e.g. "roof-replacement" → /the-woodlands/roof-replacement */
  slug: string;
  /** Unique SEO <title> (brand appended by the layout). */
  seoTitle: string;
  /** Unique meta description, ≤160 chars. */
  seoDescription: string;
  /** H1 for the page. */
  title: string;
  /** Distinct hero subhead. */
  summary: string;
  sections: ServiceSection[];
  faqs?: ServiceFaq[];
  /** Quality gate — stays "draft" (noindex, out of sitemap) until real. */
  dataCompleteness: DataCompleteness;
}

/** Populated in this file as research-backed records land. Keyed by "citySlug/slug". */
export const CITY_SERVICES: Record<string, CityService> = {};

export const CITY_SERVICE_KEYS = Object.keys(CITY_SERVICES);

export function cityServicesForCity(citySlug: ServiceAreaSlug): CityService[] {
  return Object.values(CITY_SERVICES).filter((cs) => cs.citySlug === citySlug);
}
