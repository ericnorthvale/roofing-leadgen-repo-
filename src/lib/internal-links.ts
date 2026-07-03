/**
 * Internal-link graph — single source for the cross-links that make every page
 * support the others (city hub ↔ service-in-city spokes ↔ neighborhoods ↔
 * generic services ↔ blog). Layouts call these instead of hand-building lists,
 * so new records join the link graph automatically and links never go stale.
 *
 * Only INDEXABLE targets are returned for gated page types — linking every page
 * to a noindex draft wastes crawl equity and surfaces unfinished pages.
 * (Generic service pages are always indexable today but are filtered through
 * the same gate for safety.)
 *
 * Plain TS (no `astro:` imports) so it stays importable anywhere; blog helpers
 * take the posts array as an argument instead of loading collections here.
 */
import { SERVICE_AREAS, SERVICE_AREA_SLUGS, type ServiceAreaSlug } from "./service-areas";
import { SERVICE_LIST, type ServiceTag } from "./services";
import { NEIGHBORHOODS, neighborhoodsForCity } from "./neighborhoods";
import { CITY_SERVICES, cityServicesForCity } from "./city-services";
import {
  evaluateArea,
  evaluateService,
  evaluateNeighborhood,
  evaluateCityService,
} from "./quality-gate";

export interface LinkItem {
  href: string;
  label: string;
  description?: string;
}

/** Generic service pages, optionally excluding the current one. */
export function serviceLinks(excludeTag?: ServiceTag): LinkItem[] {
  return SERVICE_LIST.filter(
    (s) => s.serviceTag !== excludeTag && evaluateService(s).indexable,
  ).map((s) => ({
    href: `/services/${s.slug}`,
    label: s.title,
    description: s.summary,
  }));
}

/** Indexable city hub pages, optionally excluding one. */
export function cityLinks(excludeSlug?: ServiceAreaSlug): LinkItem[] {
  return SERVICE_AREA_SLUGS.filter(
    (slug) => slug !== excludeSlug && evaluateArea(SERVICE_AREAS[slug]).indexable,
  ).map((slug) => ({
    href: `/${slug}`,
    label: `Roofing in ${SERVICE_AREAS[slug].name}`,
    description: SERVICE_AREAS[slug].intro,
  }));
}

/** Indexable service-in-city pages for a city, optionally excluding one slug. */
export function cityServiceLinks(citySlug: ServiceAreaSlug, excludeSlug?: string): LinkItem[] {
  return cityServicesForCity(citySlug)
    .filter((cs) => cs.slug !== excludeSlug && evaluateCityService(cs).indexable)
    .map((cs) => ({
      href: `/${cs.citySlug}/${cs.slug}`,
      label: cs.title,
      description: cs.summary,
    }));
}

/** Indexable neighborhood pages for a city, optionally excluding one slug. */
export function neighborhoodLinks(citySlug: ServiceAreaSlug, excludeSlug?: string): LinkItem[] {
  return neighborhoodsForCity(citySlug)
    .filter((n) => n.slug !== excludeSlug && evaluateNeighborhood(n).indexable)
    .map((n) => ({
      href: `/${n.citySlug}/${n.slug}`,
      label: `Roofing in ${n.name}`,
      description: n.intro,
    }));
}

/** The city hub a child page belongs to. */
export function cityHubLink(citySlug: ServiceAreaSlug): LinkItem {
  const area = SERVICE_AREAS[citySlug];
  return {
    href: `/${citySlug}`,
    label: `Roofing in ${area.name}`,
    description: area.intro,
  };
}

/**
 * Blog clusters that are topically related to each service — used to pick
 * related posts without hand-curating per page.
 */
export const SERVICE_CLUSTERS: Record<ServiceTag, string[]> = {
  replacement: ["replacement", "materials"],
  repair: ["repair", "maintenance"],
  inspection: ["inspection", "buyer-seller"],
  storm: ["storm-damage", "local-weather"],
  insurance: ["insurance-claims", "storm-damage"],
};

export interface PostLike {
  id: string;
  data: {
    title: string;
    description: string;
    cluster: string;
    relatedCity?: string;
    status: string;
  };
}

/**
 * Published posts related to a service and/or city. Callers pass the posts
 * (from `getCollection("blog")`) — this stays a pure function.
 */
export function relatedPostLinks(
  posts: PostLike[],
  opts: { serviceTag?: ServiceTag; citySlug?: ServiceAreaSlug; limit?: number } = {},
): LinkItem[] {
  const clusters = opts.serviceTag ? SERVICE_CLUSTERS[opts.serviceTag] : null;
  const scored = posts
    .filter((p) => p.data.status === "published")
    .map((p) => {
      let score = 0;
      if (clusters?.includes(p.data.cluster)) score += 2;
      if (opts.citySlug && p.data.relatedCity === opts.citySlug) score += 1;
      return { p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.limit ?? 4).map(({ p }) => ({
    href: `/blog/${p.id}/`,
    label: p.data.title,
    description: p.data.description,
  }));
}

/** Every neighborhood record, for hub pages that list them all (gated). */
export function allNeighborhoodLinks(): LinkItem[] {
  return Object.values(NEIGHBORHOODS)
    .filter((n) => evaluateNeighborhood(n).indexable)
    .map((n) => ({
      href: `/${n.citySlug}/${n.slug}`,
      label: `Roofing in ${n.name}`,
      description: n.intro,
    }));
}

/** Indexable city-specific versions of one service (e.g. replacement → The Woodlands). */
export function cityVersionsOfService(serviceTag: ServiceTag): LinkItem[] {
  return Object.values(CITY_SERVICES)
    .filter((cs) => cs.serviceTag === serviceTag && evaluateCityService(cs).indexable)
    .map((cs) => ({
      href: `/${cs.citySlug}/${cs.slug}`,
      label: cs.title,
      description: cs.summary,
    }));
}

/** Every indexable service-in-city page (all cities). */
export function allCityServiceLinks(): LinkItem[] {
  return Object.values(CITY_SERVICES)
    .filter((cs) => evaluateCityService(cs).indexable)
    .map((cs) => ({
      href: `/${cs.citySlug}/${cs.slug}`,
      label: cs.title,
      description: cs.summary,
    }));
}
