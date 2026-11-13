import { BRAND } from "./brand";
import { SERVICE_AREAS, SERVICE_AREA_SLUGS } from "./service-areas";
import { canonicalPath } from "./routes";

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

// PNG, not SVG — social crawlers (FB/LinkedIn/X) don't rasterize SVG og:images.
const DEFAULT_OG = "/og/default.png";

/**
 * Character budget for a rendered <title>. Google truncates on PIXEL width
 * (~600px desktop), so this is a proxy, but a conservative one — 60 characters
 * of mixed-case text is comfortably inside the box.
 */
export const SERP_TITLE_MAX = 60;
const BRAND_SUFFIX = ` — ${BRAND.name}`;

/**
 * The brand suffix is appended only when it still FITS.
 *
 * This used to be unconditional, and the regression test capped the page's own
 * title at 60 — then this function added 20 more characters, so 39 of 67
 * indexable pages shipped a title Google had to cut (audit, 2026-11). What a
 * cut title loses is its tail, and the tail is the brand: an over-long suffix
 * buys nothing and costs the words that would otherwise have been visible.
 *
 * So the rule is: the page's own words come first, and the brand rides along
 * when there is room. A page whose title is already 58 characters of useful,
 * specific language keeps all 58 and drops the suffix — Google shows the site
 * name beside the result anyway. A title that already contains the brand is
 * left alone, which is how the homepage puts the brand first.
 */
export function titleWithBrand(title: string): string {
  if (title.includes(BRAND.name)) return title;
  return title.length + BRAND_SUFFIX.length <= SERP_TITLE_MAX ? title + BRAND_SUFFIX : title;
}

export function buildSeo(input: SeoInput, siteUrl: string): SeoOutput {
  const base = siteUrl.replace(/\/+$/, "");
  const path = input.pathname ?? "/";
  // Normalized through the SAME function the sitemap uses, so a page's canonical
  // and its sitemap entry are structurally incapable of disagreeing.
  const canonical = path.startsWith("http") ? path : `${base}${canonicalPath(path)}`;
  const ogInput = input.ogImage ?? DEFAULT_OG;
  const ogImageAbsolute = ogInput.startsWith("http") ? ogInput : `${base}${ogInput}`;
  return {
    ...input,
    canonical,
    ogImageAbsolute,
    siteName: BRAND.name,
    brandName: BRAND.name,
    titleWithBrand: titleWithBrand(input.title),
  };
}

/** Service areas surfaced in structured data. Single source = the data model. */
export function areaServedNames(): string[] {
  return SERVICE_AREA_SLUGS.map((slug) => `${SERVICE_AREAS[slug].name}, TX`);
}

/**
 * `WebSite` node, emitted once per page beside the business node.
 *
 * It is what lets Google treat the pages as one site rather than a pile of
 * URLs, and it names the site explicitly — which matters because Google
 * otherwise guesses the site name shown beside every result from the domain,
 * the title tags or the logo.
 *
 * Deliberately NO `potentialAction` / `SearchAction`: that markup promises a
 * site-search endpoint, and this site has none. Declaring one that 404s is a
 * structured-data error, not a feature.
 */
export function webSiteJsonLd(siteUrl: string): Record<string, unknown> {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}#website`,
    url: `${base}/`,
    name: BRAND.name,
    publisher: { "@id": `${base}#business` },
    inLanguage: "en-US",
  };
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

/**
 * CreativeWork / case-study structured data for a completed-project story.
 * Uses `Article` (a project story is editorial content about a real job), with
 * an embedded `ImageObject` when a real photo exists. Never fabricated — only
 * emitted for real, published projects.
 */
export function projectStoryJsonLd(
  siteUrl: string,
  project: {
    title: string;
    description: string;
    pathname: string;
    datePublished: Date;
    image?: { src: string; alt: string };
  },
): Record<string, unknown> {
  const base = siteUrl.replace(/\/+$/, "");
  const url = `${base}${project.pathname}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.description,
    url,
    mainEntityOfPage: url,
    datePublished: project.datePublished.toISOString(),
    author: { "@id": `${base}#business` },
    publisher: { "@id": `${base}#business` },
    ...(project.image
      ? {
          image: {
            "@type": "ImageObject",
            url: project.image.src.startsWith("http")
              ? project.image.src
              : `${base}${project.image.src}`,
            caption: project.image.alt,
          },
        }
      : {}),
  };
}

/**
 * ImageGallery structured data: one ImageObject per photo, each with its own
 * name, description and keywords (owner, 2026-11 — "unique titles and meta
 * descriptions and meta tags on each image").
 *
 * This is where per-image metadata actually earns something. Alt text serves
 * screen readers and gives Google a hint; an ImageObject gives each photo a
 * name, a description and keywords of its own, which is what image search
 * indexes. A page of twenty-five photos with no structured data is one result;
 * with it, it is twenty-five.
 *
 * Photos without a title are skipped rather than given a generic one — a
 * duplicated name across many images is worse for image search than no name.
 */
export function galleryImagesJsonLd(
  siteUrl: string,
  pathname: string,
  photos: { url: string; alt: string; title?: string; description?: string; tags?: string[] }[],
): Record<string, unknown> | null {
  const described = photos.filter((p) => p.title);
  if (described.length === 0) return null;
  const abs = (u: string) => new URL(u, siteUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    url: abs(pathname),
    image: described.map((p) => ({
      "@type": "ImageObject",
      contentUrl: abs(p.url),
      name: p.title,
      description: p.description ?? p.alt,
      caption: p.alt,
      ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
    })),
  };
}
