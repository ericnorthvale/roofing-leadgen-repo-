import { BRAND } from "./brand";
import { SERVICE_AREAS, SERVICE_AREA_SLUGS } from "./service-areas";

export interface SeoInput {
  title: string;
  description: string;
  /** Absolute path (leading slash) or full URL. Defaults to "/" for homepage. */
  pathname?: string;
  /** Override the default OG image. Absolute path or full URL. */
  ogImage?: string;
  /** If true, emit <meta name="robots" content="noindex"> */
  noindex?: boolean;
  /** JSON-LD LocalBusiness / Article / BreadcrumbList block(s). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export interface SeoOutput extends SeoInput {
  canonical: string;
  ogImageAbsolute: string;
  siteName: string;
  brandName: string;
  titleWithBrand: string;
}

const DEFAULT_OG = "/og/default.svg";

export function buildSeo(input: SeoInput, siteUrl: string): SeoOutput {
  const base = siteUrl.replace(/\/+$/, "");
  const path = input.pathname ?? "/";
  const canonical = path.startsWith("http") ? path : `${base}${path}`;
  const ogInput = input.ogImage ?? DEFAULT_OG;
  const ogImageAbsolute = ogInput.startsWith("http") ? ogInput : `${base}${ogInput}`;
  const titleWithBrand = input.title.includes(BRAND.name)
    ? input.title
    : `${input.title} — ${BRAND.name}`;
  return {
    ...input,
    canonical,
    ogImageAbsolute,
    siteName: BRAND.name,
    brandName: BRAND.name,
    titleWithBrand,
  };
}

/** Service areas surfaced in structured data. Single source = the data model. */
export function areaServedNames(): string[] {
  return SERVICE_AREA_SLUGS.map((slug) => `${SERVICE_AREAS[slug].name}, TX`);
}

export function localBusinessJsonLd(siteUrl: string): Record<string, unknown> {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "@id": `${base}#business`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: base,
    telephone: BRAND.phoneE164,
    email: BRAND.email,
    image: `${base}/brand/logo.svg`,
    logo: `${base}/brand/logo.svg`,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      // Street address + ZIP appear automatically once the owner fills them in
      // business-info.json — never hardcode them here.
      ...(BRAND.addressLine1 ? { streetAddress: BRAND.addressLine1 } : {}),
      addressLocality: BRAND.city,
      addressRegion: BRAND.region,
      ...(BRAND.postalCode ? { postalCode: BRAND.postalCode } : {}),
      addressCountry: BRAND.country,
    },
    areaServed: areaServedNames(),
    // Real owner-supplied profile URLs only (GBP, Facebook, …) — empty until provided.
    sameAs: BRAND.socialProfiles,
  };
}

/**
 * Service + areaServed structured data for a service page. `provider` references
 * the sitewide LocalBusiness node so Google links them.
 */
export function serviceJsonLd(
  siteUrl: string,
  service: { title: string; seoDescription: string; slug: string },
): Record<string, unknown> {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    description: service.seoDescription,
    url: `${base}/services/${service.slug}`,
    provider: { "@id": `${base}#business` },
    areaServed: areaServedNames().map((name) => ({ "@type": "City", name })),
  };
}

/** FAQPage structured data. Only emit when there is real, on-page Q&A. */
export function faqPageJsonLd(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** BlogPosting structured data for a published post. */
export function blogPostingJsonLd(
  siteUrl: string,
  post: {
    title: string;
    description: string;
    /** Absolute path, e.g. /blog/my-post */
    pathname: string;
    datePublished: Date;
    dateModified?: Date;
    authorName: string;
    /** "Organization" when the byline is the company itself, not a person. */
    authorType?: "Person" | "Organization";
    /** Absolute path or URL to the hero image, if any. */
    image?: string;
  },
): Record<string, unknown> {
  const base = siteUrl.replace(/\/+$/, "");
  const url = `${base}${post.pathname}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.datePublished.toISOString(),
    dateModified: (post.dateModified ?? post.datePublished).toISOString(),
    author: { "@type": post.authorType ?? "Person", name: post.authorName },
    publisher: { "@id": `${base}#business` },
    ...(post.image
      ? { image: post.image.startsWith("http") ? post.image : `${base}${post.image}` }
      : {}),
  };
}

/**
 * AggregateRating for the sitewide business node, computed from REAL reviews
 * only. Returns null when there are no reviews — callers must skip emitting it
 * (never fabricate a rating; FTC + Google policy).
 */
export function aggregateRatingJsonLd(
  siteUrl: string,
  reviews: { rating: number }[],
): Record<string, unknown> | null {
  if (reviews.length === 0) return null;
  const base = siteUrl.replace(/\/+$/, "");
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "@id": `${base}#business`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number((sum / reviews.length).toFixed(2)),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
  };
}
