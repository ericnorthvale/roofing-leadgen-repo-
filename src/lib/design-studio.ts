/**
 * Roof Design Center "Shingle Studio" — the four IKO lines Northvale presents,
 * with owner-supplied IKO photography (no homeowner photo uploads, ever).
 *
 * FACTS: every warranty/wind/algae figure below comes from IKO's official
 * Limited Warranty for asphalt shingles, US edition effective 2025-02-01
 * (archived at docs/vendor/iko-limited-warranty-us-2025.pdf) and is logged in
 * docs/research-facts.md (Sheet 1B). Impact ratings are published ONLY for
 * Dynasty (UL 2218 Class 3) and Nordic (FM 4473 / UL 2218 Class 4) — the two
 * lines whose ratings are verified on iko.com. Cambridge/Armourshake impact
 * claims stay off the site until verified (research-facts UNVERIFIED list).
 *
 * IMAGERY: /public/design-center/** — IKO product photography supplied by the
 * owner (2026-07). `home` = the color on a real IKO-photographed house;
 * `swatch` = the shingle up close. `chip` hexes are representative UI
 * approximations only — the UI must always carry the physical-sample hedge.
 *
 * EDITORIAL: taglines, stories, notes and "best for" lines are Northvale's
 * own guidance (opinion, allowed) — not manufacturer claims.
 */

export type StudioLineKey = "cambridge" | "dynasty" | "nordic" | "armourshake";

export interface StudioColor {
  name: string;
  slug: string;
  /** Representative UI chip hex — NOT exact; confirm with a physical sample. */
  chip: string;
  /** Editorial one-liner. */
  note: string;
  /** The color on a real house (IKO photography). */
  home?: string;
  /** The shingle up close (IKO photography). */
  swatch?: string;
}

export interface StudioLine {
  key: StudioLineKey;
  name: string;
  short: string;
  /** Collection label shown as the card eyebrow. */
  collection: string;
  tagline: string;
  story: string;
  /** IKO Limited Warranty (US, eff. 2025-02-01) — exact figures. */
  productWarranty: "Limited Lifetime";
  ironCladYears: 10 | 15;
  /** Homeowner-plain wind warranty wording (exact mph from the warranty). */
  wind: string;
  windShort: string;
  algaeYears: 10;
  /** Verified impact rating — Dynasty/Nordic only. */
  impactLabel?: string;
  bestFor: string;
  colors: StudioColor[];
  /** Honest note when the folder shows a subset of the line's palette. */
  moreColors?: string;
}

const DC = "/design-center";

export const STUDIO_LINES: StudioLine[] = [
  {
    key: "cambridge",
    name: "IKO Cambridge",
    short: "Cambridge",
    collection: "Architectural essential",
    tagline: "The dependable architectural shingle — classic dimensional looks, honest value.",
    story:
      "Cambridge is the workhorse of the IKO family: a laminated architectural shingle with the classic deep-shadow look Houston neighborhoods know. It's the smart pick when the budget leads the decision and you still want a roof that looks substantial from the street.",
    productWarranty: "Limited Lifetime",
    ironCladYears: 10,
    wind: "110-mph limited wind warranty — upgradable to 130 mph with IKO's documented high-wind installation. Ask us to spec it for your roof.",
    windShort: "110 mph (130 available)",
    algaeYears: 10,
    bestFor: "Budget-led replacements and rentals that still need real curb appeal.",
    colors: [
      {
        name: "Driftwood",
        slug: "driftwood",
        chip: "#6f6659",
        note: "A warm grey-brown blend that sits comfortably against brick, stone, and wooded lots.",
        home: `${DC}/cambridge/driftwood-home.webp`,
      },
      {
        name: "Weatherwood",
        slug: "weatherwood",
        chip: "#4a443a",
        note: "The classic wood-tone — deep brown-grey with golden flecks, at home under Woodlands tree cover.",
        home: `${DC}/cambridge/weatherwood-home.webp`,
        swatch: `${DC}/cambridge/weatherwood-swatch.webp`,
      },
      {
        name: "Dual Black",
        slug: "dual-black",
        chip: "#2e3032",
        note: "Two-tone black with real depth — the sharp, safe choice on almost any exterior.",
        home: `${DC}/cambridge/dual-black-home.webp`,
        swatch: `${DC}/cambridge/dual-black-swatch.webp`,
      },
    ],
    moreColors:
      "Cambridge comes in more blends than we show here — we bring the full physical sample deck to your free estimate.",
  },
  {
    key: "dynasty",
    name: "IKO Dynasty",
    short: "Dynasty",
    collection: "Performance line — our standard",
    tagline:
      "The shingle we install as standard — a wide ArmourZone nailing band built for Gulf-Coast wind.",
    story:
      "Dynasty is why we standardized on IKO: a premium architectural shingle whose reinforced ArmourZone nailing band gives every fastener a bigger, tougher target — the difference that keeps shingles on through the wind events that peel ordinary roofs.",
    productWarranty: "Limited Lifetime",
    ironCladYears: 15,
    wind: "130-mph limited high-wind warranty when installed to IKO's application requirements — which is how we nail every Dynasty roof.",
    windShort: "130 mph",
    algaeYears: 10,
    impactLabel: "UL 2218 Class 3",
    bestFor: "Most Woodlands-area homes: premium looks, serious wind performance.",
    colors: [
      {
        name: "Granite Black",
        slug: "granite-black",
        chip: "#2f3133",
        note: "The safe, sharp choice — near-black that frames white trim and reads clean on almost any exterior.",
        home: `${DC}/dynasty/granite-black-home.webp`,
        swatch: `${DC}/dynasty/granite-black-swatch.webp`,
      },
      {
        name: "Summit Grey",
        slug: "summit-grey",
        chip: "#6f7377",
        note: "A true mid-grey that suits contemporary and transitional homes without going stark.",
        home: `${DC}/dynasty/summit-grey-home.webp`,
        swatch: `${DC}/dynasty/summit-grey-swatch.webp`,
      },
      {
        name: "Shadow Brown",
        slug: "shadow-brown",
        chip: "#4b3b30",
        note: "Warm dark brown that ties into tan brick and stone — a Woodlands staple under tree cover.",
        swatch: `${DC}/dynasty/shadow-brown-swatch.webp`,
      },
      {
        name: "Olde Style Weatherwood",
        slug: "olde-style-weatherwood",
        chip: "#7c7266",
        note: "A blended wood-tone — brown, grey, and amber — that hides debris shadows on shaded lots.",
        swatch: `${DC}/dynasty/olde-style-weatherwood-swatch.webp`,
      },
      {
        name: "Cornerstone Weatherwood",
        slug: "cornerstone-weatherwood",
        chip: "#8a7d6d",
        note: "A lighter weatherwood blend — warmer and brighter than the classic, good on tan brick.",
        swatch: `${DC}/dynasty/cornerstone-weatherwood-swatch.webp`,
      },
      {
        name: "Glacier",
        slug: "glacier",
        chip: "#9ea3a6",
        note: "A light, cool grey for a bright, modern look — pairs well with dark windows and white brick.",
        swatch: `${DC}/dynasty/glacier-swatch.webp`,
      },
    ],
    moreColors:
      "Dynasty comes in 15 colors — these six are the most requested here. We bring the full sample deck to your free estimate.",
  },
  {
    key: "nordic",
    name: "IKO Nordic",
    short: "Nordic",
    collection: "Performance line — Class 4 impact",
    tagline:
      "The impact-resistant upgrade — polymer-modified asphalt with the highest UL 2218 hail rating.",
    story:
      "Nordic takes everything Dynasty does and adds polymer-modified (SBS) asphalt that flexes like a shock absorber. It carries the highest hail classification a shingle can earn — the rating many Texas insurers reward with a premium discount.",
    productWarranty: "Limited Lifetime",
    ironCladYears: 15,
    wind: "130-mph limited high-wind warranty when installed to IKO's application requirements — which is how we nail every Nordic roof.",
    windShort: "130 mph",
    algaeYears: 10,
    impactLabel: "FM 4473 / UL 2218 Class 4",
    bestFor: "Hail-exposed roofs and homeowners chasing an insurance premium discount.",
    colors: [
      {
        name: "Granite Black",
        slug: "granite-black",
        chip: "#2f3133",
        note: "The safe, sharp choice — near-black that frames white trim and reads clean on almost any exterior.",
        home: `${DC}/nordic/granite-black-home.webp`,
        swatch: `${DC}/nordic/granite-black-swatch.webp`,
      },
      {
        name: "Summit Grey",
        slug: "summit-grey",
        chip: "#6f7377",
        note: "A true mid-grey that suits contemporary and transitional homes without going stark.",
        swatch: `${DC}/nordic/summit-grey-swatch.webp`,
      },
      {
        name: "Shadow Brown",
        slug: "shadow-brown",
        chip: "#4b3b30",
        note: "Warm dark brown that ties into tan brick and stone — a Woodlands staple under tree cover.",
        home: `${DC}/nordic/shadow-brown-home.webp`,
        swatch: `${DC}/nordic/shadow-brown-swatch.webp`,
      },
      {
        name: "Olde Style Weatherwood",
        slug: "olde-style-weatherwood",
        chip: "#7c7266",
        note: "A blended wood-tone — brown, grey, and amber — that hides debris shadows on shaded lots.",
        swatch: `${DC}/nordic/olde-style-weatherwood-swatch.webp`,
      },
      {
        name: "Driftshake",
        slug: "driftshake",
        chip: "#8d8b85",
        note: "Soft driftwood grey with subtle warmth — a farmhouse-friendly alternative to flat grey.",
        home: `${DC}/nordic/driftshake-home.webp`,
        swatch: `${DC}/nordic/driftshake-swatch.webp`,
      },
      {
        name: "Glacier",
        slug: "glacier",
        chip: "#9ea3a6",
        note: "A light, cool grey for a bright, modern look — pairs well with dark windows and white brick.",
        swatch: `${DC}/nordic/glacier-swatch.webp`,
      },
    ],
  },
  {
    key: "armourshake",
    name: "IKO Armourshake",
    short: "Armourshake",
    collection: "Designer collection",
    tagline: "The premium designer shingle — a deep, hand-split shake look in asphalt.",
    story:
      "Armourshake is IKO's designer tier: an extra-heavyweight shingle cut to a random shake pattern, with color blends that read like real cedar from the street — without cedar's upkeep. For homes where the roof is part of the architecture.",
    productWarranty: "Limited Lifetime",
    ironCladYears: 15,
    wind: "110-mph limited wind warranty — upgradable to 130 mph with IKO's documented high-wind installation. Ask us to spec it for your roof.",
    windShort: "110 mph (130 available)",
    algaeYears: 10,
    bestFor: "Statement homes and shake-look lovers who want asphalt durability.",
    colors: [
      {
        name: "Greystone",
        slug: "greystone",
        chip: "#6d6f70",
        note: "Cool, layered greys with true shake-style depth — dressy without going dark.",
        home: `${DC}/armourshake/greystone-home.webp`,
      },
      {
        name: "Shadow Black",
        slug: "shadow-black",
        chip: "#37393b",
        note: "The boldest Armourshake — deep black with charcoal relief that makes trim pop.",
        home: `${DC}/armourshake/shadow-black-home.webp`,
      },
      {
        name: "Weathered Stone",
        slug: "weathered-stone",
        chip: "#7a766d",
        note: "Soft stone greys with warm undertones — the classic estate look on stone and stucco.",
        home: `${DC}/armourshake/weathered-stone-home.webp`,
      },
    ],
    moreColors:
      "Ask about additional Armourshake blends — we bring physical samples to your free estimate.",
  },
];

export function studioLine(key: StudioLineKey): StudioLine {
  return STUDIO_LINES.find((l) => l.key === key)!;
}
