import { BRAND } from "./brand";

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
      addressLocality: BRAND.city,
      addressRegion: BRAND.region,
      addressCountry: BRAND.country,
    },
    areaServed: [
      "The Woodlands, TX",
      "Spring, TX",
      "Tomball, TX",
      "Magnolia, TX",
      "Conroe, TX",
      "Cypress, TX",
    ],
    sameAs: [] as string[],
  };
}
