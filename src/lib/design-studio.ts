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

export type StudioLineKey =
  | "cambridge"
  | "dynasty"
  | "nordic"
  | "armourshake"
  | "iko-metals-spanish-tile";

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
  /**
   * Asphalt shingle, or stone-coated steel. Every field below marked
   * asphalt-only is absent on a metal line — Iron Clad and the algae warranty
   * are terms of IKO's ASPHALT shingle warranty and do not exist on a metal
   * product. They were required fields until 2026-11-13, which would have
   * forced a metal line to assert coverage it does not carry.
   */
  material?: "asphalt" | "metal";
  /** IKO Limited Warranty (US, eff. 2025-02-01) — exact figures. */
  productWarranty: "Limited Lifetime" | "Lifetime Limited";
  /** Asphalt only. */
  ironCladYears?: 10 | 15;
  /** Homeowner-plain wind warranty wording (exact mph from the warranty). */
  wind: string;
  windShort: string;
  /** Asphalt only. */
  algaeYears?: 10;
  /** Verified impact rating — Dynasty/Nordic and the metal line. */
  impactLabel?: string;
  /** Metal only: ASTM E108 fire classification. */
  fireLabel?: string;
  /** Metal only: nominal installed weight. */
  weightLabel?: string;
  /** Metal only: published standards, verbatim from the product flyer. */
  standards?: string[];
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

  /**
   * IKO Metals — DECRA Spanish Tile (stone-coated steel), added 2026-11-13.
   *
   * IKO launched IKO Metals in September 2026, bringing DECRA's stone-coated
   * steel into its North American range. This is the only line here that is not
   * an asphalt shingle, so it carries NO Iron Clad term and NO algae warranty —
   * those are asphalt-warranty concepts. Every figure below is verbatim from
   * IKO's own product flyer (ML9L300 · 09/2026), archived and logged in
   * docs/research-facts.md Sheet 12.
   *
   * PALETTE: the flyer lists EIGHT colors. Four are shown here because those
   * are the swatches the owner has supplied so far and that can be matched to a
   * name with certainty; the other four are named in `moreColors` rather than
   * guessed at from a photograph. `assetFor()` in ShingleStudio dereferences
   * `color.swatch!`, so a color without an image would render broken — another
   * reason not to list one before its image is confirmed.
   */
  {
    key: "iko-metals-spanish-tile",
    material: "metal",
    name: "IKO Metals — DECRA Spanish Tile",
    short: "Spanish Tile",
    collection: "Stone-coated steel",
    tagline: "Barrel-tile looks, without the weight of clay.",
    story:
      "The shape of an old-world clay barrel tile, pressed into stone-coated steel. Clay is heavy and it breaks — hail, storm debris, and someone walking it to service an HVAC unit all take their toll, and the weight works on the structure underneath for decades. This gets you the same roofline at a fraction of the weight, on a panel that fastens direct to deck. It is also the one product here with a Class 4 impact rating AND a Class A fire rating, which is a combination worth knowing about in a hail market.",
    productWarranty: "Lifetime Limited",
    wind: "Warranty coverage up to 120 mph",
    windShort: "120-mph",
    impactLabel: "UL 2218 Class 4",
    fireLabel: "ASTM E108 Class A",
    weightLabel: "1.6 lbs/sq ft",
    standards: [
      "ASTM E108 Class A — fire resistance",
      "UL 580 Class 90 — wind uplift resistance",
      "UL 2218 Class 4 — impact resistance",
      "TAS 125 — HVHZ wind performance",
    ],
    bestFor:
      "Spanish, Mediterranean and hill-country elevations — and any roof where you want the tile look without the structural weight. Worth a conversation if your insurer offers an impact-resistant credit.",
    colors: [
      {
        name: "Carbon",
        slug: "carbon",
        chip: "#1c181c",
        note: "Near-black with the stone-coat texture breaking up the light — the one that reads modern rather than Mediterranean.",
        home: `${DC}/iko-metals-spanish-tile/carbon-home.webp`,
        swatch: `${DC}/iko-metals-spanish-tile/carbon-swatch.webp`,
      },
      {
        name: "Canyon Terra",
        slug: "canyon-terra",
        chip: "#773b2d",
        note: "The cleanest, deepest red of the three terracottas — closest to what people picture when they say Spanish tile.",
        swatch: `${DC}/iko-metals-spanish-tile/canyon-terra-swatch.webp`,
      },
      {
        name: "Bronzed Oak",
        slug: "bronzed-oak",
        chip: "#543d2e",
        note: "Warm mid-brown that sits naturally against limestone and stucco — the color IKO features on the Spanish Tile flyer.",
        home: `${DC}/iko-metals-spanish-tile/bronzed-oak-home.webp`,
        swatch: `${DC}/iko-metals-spanish-tile/bronzed-oak-swatch.webp`,
      },
      {
        name: "Cathedral Stone",
        slug: "cathedral-stone",
        chip: "#6f7472",
        note: "Mid grey with the stone-coat texture reading as weathered slate — the quietest color in the range on a big roof.",
        // No close-up swatch yet: the only one supplied is 164x114, which would
        // sit next to ~1450px siblings and look broken. The house photo stands
        // in until a full-size swatch exists.
        home: `${DC}/iko-metals-spanish-tile/cathedral-stone-home.webp`,
      },
      {
        name: "Woodland Pine",
        slug: "woodland-pine",
        chip: "#363b30",
        note: "Deep muted green. Non-glossy and low in chroma, which is the direction The Woodlands Standards push you anyway.",
        swatch: `${DC}/iko-metals-spanish-tile/woodland-pine-swatch.webp`,
      },
      {
        name: "Sienna Clay",
        slug: "sienna-clay",
        chip: "#7e4934",
        note: "The warmest and lightest terracotta — more orange in it, and it softens rather than shouts on a big roof.",
        swatch: `${DC}/iko-metals-spanish-tile/sienna-clay-swatch.webp`,
      },
      {
        name: "Cordova Clay",
        slug: "cordova-clay",
        chip: "#653727",
        note: "Red shot through with dark charcoal blotches, so it reads as aged clay from the street rather than a flat single color.",
        swatch: `${DC}/iko-metals-spanish-tile/cordova-clay-swatch.webp`,
      },
      {
        name: "Valencia Sand",
        slug: "valencia-sand",
        chip: "#8f6f4f",
        note: "Pale sand-tan — the lightest of the palette, and the one that throws the least heat back into the attic.",
        swatch: `${DC}/iko-metals-spanish-tile/valencia-sand-swatch.webp`,
      },
    ],
    moreColors:
      "All eight Spanish Tile colors. We bring physical samples regardless — IKO's own flyer notes the printed colors are digitally enhanced, so never pick a roof color off a screen.",
  },
];

export function studioLine(key: StudioLineKey): StudioLine {
  return STUDIO_LINES.find((l) => l.key === key)!;
}
