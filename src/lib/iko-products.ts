/**
 * IKO product line — the single source of truth for every IKO fact on the site.
 *
 * Northvale standardized its installed shingle line on IKO (IKO-only site). The
 * homepage materials section, the warranty page, and the Roof Design Center all
 * read from this file so specs/warranty/colors never drift.
 *
 * EVERY value here traces to iko.com and is logged in docs/research-facts.md
 * (Sheet 1B). Rules that must not be broken:
 *   - Hail is NOT covered by the IKO limited warranty; the impact rating exists
 *     only to help homeowners seek an insurance-premium discount. Always publish
 *     that hedge (`IMPACT_INSURANCE_HEDGE`).
 *   - Never claim "extended Iron Clad / up to 25 years" or a ROOFPRO tier —
 *     those require a confirmed Select+ ROOFPRO membership Northvale does not yet
 *     hold. Cert status is "IKO ROOFPRO applicant" until confirmed.
 */

export type ShingleClass = "Class 3" | "Class 4";

export interface IkoShingle {
  /** Product name, e.g. "IKO Dynasty". */
  name: string;
  /** URL slug used in the Design Center, e.g. "dynasty". */
  slug: "dynasty" | "nordic";
  /** One-line positioning written for SE-Texas homeowners (editorial, not IKO copy). */
  tagline: string;
  /** UL 2218 impact rating. */
  impactClass: ShingleClass;
  /** Human impact label, e.g. "UL 2218 Class 3". */
  impactLabel: string;
  /** High-wind limited warranty, e.g. "130 mph". */
  windWarrantyMph: number;
  /** Fire rating label. */
  fireClass: string;
  /** Product warranty headline. */
  limitedWarranty: string;
  /** Iron Clad full/non-prorated period in years. */
  ironCladYears: number;
  /** Algae-resistance limited warranty in years. */
  algaeYears: number;
  /** Whether the shingle is polymer-modified (SBS). */
  polymerModified: boolean;
  /** Northvale's own editorial "best for" guidance (opinion, allowed). */
  bestFor: string;
  /** Published color names for this line (from iko.com). */
  colors: string[];
}

/** The mandatory hedge whenever an impact class is mentioned. Sourced. */
export const IMPACT_INSURANCE_HEDGE =
  "IKO's impact rating is a UL 2218 lab classification, not a guarantee against hail — hail damage isn't covered by the shingle warranty. Its purpose is to help you qualify for an insurance premium discount where your carrier offers one.";

export const IKO_DYNASTY: IkoShingle = {
  name: "IKO Dynasty",
  slug: "dynasty",
  tagline:
    "The architectural shingle we install as standard — a wide ArmourZone nailing band built for Gulf-Coast wind.",
  impactClass: "Class 3",
  impactLabel: "UL 2218 Class 3",
  windWarrantyMph: 130,
  fireClass: "Class A (ASTM E108/UL 790)",
  limitedWarranty: "Limited Lifetime",
  ironCladYears: 15,
  algaeYears: 10,
  polymerModified: false,
  bestFor:
    "Most Woodlands-area homes: a premium architectural shingle with a 130-mph wind warranty and 15-year non-prorated Iron Clad coverage, in more colors than any other IKO line.",
  // docs/research-facts.md Sheet 1B — https://www.iko.com/na/product/dynasty/
  colors: [
    "Olde Style Weatherwood",
    "Granite Black",
    "Cornerstone Weatherwood",
    "Atlantic Blue",
    "Glacier",
    "Shadow Brown",
    "Summit Grey",
    "Biscayne",
    "Monaco Red",
    "Frostone Grey",
    "Emerald Green",
    "Driftshake",
    "Brownstone",
    "Sentinel Slate",
    "Blackstone",
  ],
};

export const IKO_NORDIC: IkoShingle = {
  name: "IKO Nordic",
  slug: "nordic",
  tagline:
    "The impact-resistant upgrade — polymer-modified asphalt that flexes like a shock absorber and carries the highest UL 2218 hail rating.",
  impactClass: "Class 4",
  impactLabel: "FM 4473 / UL 2218 Class 4",
  windWarrantyMph: 130,
  fireClass: "Class A (ASTM E108/UL 790)",
  limitedWarranty: "Limited Lifetime",
  ironCladYears: 15,
  algaeYears: 10,
  polymerModified: true,
  bestFor:
    "Hail-exposed Montgomery County roofs and homeowners chasing an insurance discount: Class 4 is the highest impact rating, and the SBS-modified mat resists cracking in temperature swings.",
  // docs/research-facts.md Sheet 1B — https://www.iko.com/na/product/nordic/
  colors: [
    "Olde Style Weatherwood",
    "Granite Black",
    "Shadow Brown",
    "Summit Grey",
    "Glacier",
    "Driftshake",
  ],
};

export const IKO_SHINGLES: IkoShingle[] = [IKO_DYNASTY, IKO_NORDIC];

/**
 * A complete IKO roofing system, part-by-part. Real IKO product names only
 * (docs/research-facts.md Sheet 1B). `product` lists the IKO options; `role`
 * is plain-language education. Feeds the Design Center roof-system diagram and
 * the "what a complete IKO system includes" copy.
 */
export interface IkoSystemPart {
  key: string;
  label: string;
  /** IKO product option(s) for this part. */
  product: string;
  /** Why it matters, in plain language. */
  role: string;
}

export const IKO_SYSTEM_PARTS: IkoSystemPart[] = [
  {
    key: "shingles",
    label: "Shingles",
    product: "IKO Dynasty or IKO Nordic",
    role: "The visible, weather-facing layer — sheds water and takes the wind and UV.",
  },
  {
    key: "starter",
    label: "Starter shingles",
    product: "IKO Leading Edge Plus",
    role: "Seals the eaves and rakes — the wind-driven edges where uplift starts — so the first course can't peel.",
  },
  {
    key: "hip-ridge",
    label: "Hip & ridge cap",
    product: "IKO Hip & Ridge 12 / Ultra HP",
    role: "Purpose-made caps that cover the roof's peaks and hips instead of cut-up field shingles that crack.",
  },
  {
    key: "underlayment",
    label: "Synthetic underlayment",
    product: "IKO RoofGard-Cool Grey / Stormtite",
    role: "A tear-resistant second layer over the whole deck — lighter, tougher, and more water-resistant than felt.",
  },
  {
    key: "ice-water",
    label: "Ice & water protector",
    product: "IKO ArmourGard / GoldShield / StormShield",
    role: "A self-adhering, self-sealing membrane in valleys and around penetrations, where leaks start most.",
  },
  {
    key: "ventilation",
    label: "Ridge ventilation",
    product: "Balanced intake + exhaust",
    role: "Lets hot Gulf-Coast attic air out so the deck stays cooler and the shingles live out their rated life.",
  },
];

/**
 * IKO warranty coverage in homeowner-plain language. Only coverage that is true
 * for the products Northvale installs today (no ROOFPRO-tier extended coverage
 * until enrollment is confirmed — see docs/research-facts.md Sheet 1B).
 */
export const IKO_WARRANTY = {
  limitedLifetime:
    "A Limited Lifetime product warranty against manufacturing defects on IKO Dynasty and Nordic, registered to you when we close the job.",
  ironClad:
    "IKO's Iron Clad Protection Period — the first 15 years are full, non-prorated coverage for manufacturing defects (no depreciation math in the years a defect is most likely to show).",
  wind: "A 130-mph limited high-wind warranty on Dynasty and Nordic when installed to IKO's application requirements.",
  algae:
    "A 10-year limited algae-resistance warranty against the blue-green streaking that Gulf-Coast humidity causes.",
  transfer:
    "The IKO warranty is conditionally transferable to a new owner — the exact transfer window varies by product and by the warranty in effect when the roof was installed.",
} as const;
