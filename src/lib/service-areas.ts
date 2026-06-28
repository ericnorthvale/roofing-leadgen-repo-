import type { DataCompleteness } from "./quality-gate";

export type ServiceAreaSlug =
  | "houston"
  | "spring"
  | "cypress"
  | "the-woodlands"
  | "kingwood"
  | "tomball"
  | "magnolia"
  | "conroe";

/** A real, completed local job. Only add entries that actually happened. */
export interface ServiceAreaProject {
  /** Short factual description — what was done, no invented numbers. */
  summary: string;
  /** Optional neighborhood the job was in. */
  neighborhood?: string;
  photo?: { src: string; alt: string };
}

/** A real customer testimonial. NEVER invent these (FTC violation + SEO risk). */
export interface ServiceAreaTestimonial {
  quote: string;
  author: string;
  /** Where it came from, e.g. "Google", so it can be verified. */
  source: string;
}

export interface ServiceArea {
  slug: ServiceAreaSlug;
  name: string;
  county: "Harris" | "Montgomery";
  /** Quick-reference named places (real). */
  landmarks: string[];
  /** Named neighborhoods used to prove genuine local presence (real). */
  neighborhoods: string[];
  /** Distinct hero subhead — named places, not "and surrounding areas". */
  intro: string;
  /** Factual local context (climate, housing stock, HOA density). No invented stats. */
  localContext: string;

  // --- Rich fields. Fill with REAL, researched/owner-provided data before
  //     flipping dataCompleteness to "complete". The quality gate requires these. ---
  /** True regional climate / storm pattern for this area. */
  climateNote?: string;
  /** True permitting / HOA / architectural-review notes for this area. */
  permitHoaNote?: string;
  /** Roof types commonly seen on local housing stock. */
  commonRoofTypes?: string[];

  // --- Real-world proof (recommended, not required to index). NEVER fabricate. ---
  projects?: ServiceAreaProject[];
  testimonials?: ServiceAreaTestimonial[];
  photos?: { src: string; alt: string }[];

  /**
   * Quality gate. Stays "draft" (→ noindex, excluded from sitemap) until a human
   * fills the rich fields with real content. See src/lib/quality-gate.ts.
   */
  dataCompleteness: DataCompleteness;
}

export const SERVICE_AREAS: Record<ServiceAreaSlug, ServiceArea> = {
  houston: {
    slug: "houston",
    name: "Houston",
    county: "Harris",
    landmarks: ["Memorial", "Spring Branch", "Champions", "Cypress-Fairbanks", "Heights"],
    neighborhoods: ["Memorial", "Spring Branch", "Champions", "Cypress-Fairbanks", "The Heights"],
    intro:
      "Serving Greater Houston from our Spring base. From mature inner-loop bungalows to sprawling suburban builds, every Houston roof has its own history.",
    localContext:
      "Greater Houston sits squarely in the Gulf Coast storm corridor: hurricane and tropical-system exposure, spring and early-summer hail, and relentless heat and humidity that age shingles faster than in drier climates.",
    dataCompleteness: "draft",
  },
  spring: {
    slug: "spring",
    name: "Spring",
    county: "Harris",
    landmarks: [
      "Klein",
      "Gleannloch Farms",
      "Old Town Spring",
      "Louetta corridor",
      "Champions Forest",
    ],
    neighborhoods: [
      "Klein",
      "Gleannloch Farms",
      "Old Town Spring",
      "Champions Forest",
      "Augusta Pines",
    ],
    intro: "Based off I-45 in Spring. Most jobs are within a short drive of home base.",
    localContext:
      "Spring sits in the hail-and-wind corridor north of Houston, where spring storms regularly bring large hail and straight-line winds. Housing ranges from established Klein-area subdivisions to newer master-planned communities like Gleannloch Farms.",
    dataCompleteness: "draft",
  },
  cypress: {
    slug: "cypress",
    name: "Cypress",
    county: "Harris",
    landmarks: ["Bridgeland", "Towne Lake", "Fairfield", "Cypress Creek Lakes", "Blackhorse Ranch"],
    neighborhoods: [
      "Bridgeland",
      "Towne Lake",
      "Fairfield",
      "Cypress Creek Lakes",
      "Blackhorse Ranch",
    ],
    intro:
      "Bridgeland and Towne Lake lead our Cypress work — master-planned communities with specific shingle and color approvals.",
    localContext:
      "Cypress is dominated by master-planned communities with strict architectural review committees that approve specific shingle lines and colors. Getting the ARC submittal right the first time is part of the job here.",
    dataCompleteness: "draft",
  },
  // The Woodlands — Phase 2 flagship. Facts below are sourced (NWS Houston/Galveston,
  // U.S. Census, The Woodlands Township Standards & RDRC pages). Marked "complete";
  // the quality gate still holds it noindex until real NAP is entered (auto-publishes
  // then). NEEDS OWNER: real local projects/testimonials/photos to strengthen it.
  // Verify the specific accepted-materials list against the official 2024 Residential
  // Development Standards PDF before treating it as exhaustive.
  "the-woodlands": {
    slug: "the-woodlands",
    name: "The Woodlands",
    county: "Montgomery",
    landmarks: [
      "Creekside Park",
      "Grogan's Mill",
      "Cochran's Crossing",
      "Sterling Ridge",
      "Alden Bridge",
      "Town Center",
    ],
    neighborhoods: [
      "Grogan's Mill",
      "Panther Creek",
      "Cochran's Crossing",
      "Indian Springs",
      "Alden Bridge",
      "College Park",
      "Sterling Ridge",
      "Carlton Woods",
      "Creekside Park",
    ],
    intro:
      "From Grogan's Mill to Creekside Park, we work The Woodlands village by village — and we know the Township's roofing Standards before we ever get on a ladder.",
    localContext:
      "The Woodlands is a master-planned community founded by George P. Mitchell and dedicated in 1974, mostly in Montgomery County north of Houston with Creekside Park extending into Harris County, and home to roughly 114,000 residents as of the 2020 census. It's built around named villages — Grogan's Mill (the original), Cochran's Crossing, Panther Creek, Alden Bridge, Sterling Ridge, and Creekside Park among them — and governed by The Woodlands Township through Restrictive Covenants and village Residential Design Review Committees that set roofing standards favoring muted, natural-harmonizing materials. The heavily wooded, humid-subtropical setting plus exposure to severe spring storms makes durable, Standards-compliant roofing a practical concern here.",
    climateNote:
      "The Woodlands sits in southeast Texas's humid-subtropical climate. The National Weather Service Houston/Galveston office reports the region averages roughly 50–60 thunderstorm days a year, with about a third producing severe weather — hail an inch or larger, or wind gusts above 58 mph — and local downbursts can drive winds from 60 to over 100 mph. The Gulf Coast location also exposes the area to tropical systems. Sustained heat, intense UV, and humidity dry out asphalt binder over time, driving granule loss and brittleness.",
    permitHoaNote:
      "Most of The Woodlands is unincorporated Montgomery County, which does not require a building permit for a residential roof replacement — reroof rules are driven instead by covenants. The Woodlands Township administers the community Standards (responsibility moved from the original associations to the Township in 2010), and each village has a Residential Design Review Committee. Re-roofing is exempt from the usual survey/application paperwork, but materials and colors must still comply with the published Standards, which favor muted, non-glossy roofing; the Township keeps an approved materials-and-color compliance list (Covenant Administration, 281-210-3973). We confirm your village's current requirements before ordering material.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the dominant material on local housing stock and permitted as composition shingle under Township Standards",
      "Standing-seam or stone-coated metal — accepted under Standards (must be non-glossy), chosen for longevity and storm/UV resistance",
      "Concrete/clay tile or slate — accepted on higher-end and custom homes, common in luxury villages like Carlton Woods",
    ],
    dataCompleteness: "complete",
  },
  kingwood: {
    slug: "kingwood",
    name: "Kingwood",
    county: "Harris",
    landmarks: ["Kings Point", "Bear Branch", "Elm Grove", "Kings Forest", "Trailwood"],
    neighborhoods: [
      "Kings Point",
      "Bear Branch",
      "Elm Grove",
      "Kings Forest",
      "Trailwood",
      "Greentree",
    ],
    intro:
      'Kingwood — the "Livable Forest" of far northeast Houston. Heavy tree cover makes roof condition a year-round concern.',
    localContext:
      "Kingwood's signature tree canopy is beautiful and brutal on roofs: overhanging limbs, constant leaf-and-debris load on valleys and gutters, and limb-strike risk in every wind event. Many of its villages date to earlier build eras and HOA approvals still apply.",
    dataCompleteness: "draft",
  },
  tomball: {
    slug: "tomball",
    name: "Tomball",
    county: "Harris",
    landmarks: [
      "Rose Hill",
      "Lakewood Crossing",
      "Willowcreek Ranch",
      "Vintage Oaks",
      "Downtown Tomball",
    ],
    neighborhoods: ["Rose Hill", "Lakewood Crossing", "Willowcreek Ranch", "Vintage Oaks"],
    intro:
      "We cover Tomball up FM 2920 from Spring — same-day response is rarely more than a short drive.",
    localContext:
      "Tomball has grown quickly with large new-build subdivisions. Builder-grade shingle roofs in these neighborhoods commonly need attention as they reach the end of their service life, and the area sees the same Gulf Coast hail and wind exposure as the rest of NW Houston.",
    dataCompleteness: "draft",
  },
  magnolia: {
    slug: "magnolia",
    name: "Magnolia",
    county: "Montgomery",
    landmarks: ["High Meadow Ranch", "Mostyn Manor", "FM 1488 corridor", "Magnolia Ridge"],
    neighborhoods: ["High Meadow Ranch", "Mostyn Manor", "Magnolia Ridge", "Audubon"],
    intro:
      "Magnolia homes are larger, more exposed, and harder-hit by open-country storms than most of NW Houston.",
    localContext:
      "Magnolia's larger, more exposed lots off the FM 1488 corridor catch the full force of supercell storms moving off Lake Conroe, making wind and hail damage a recurring concern for homeowners here.",
    dataCompleteness: "draft",
  },
  conroe: {
    slug: "conroe",
    name: "Conroe",
    county: "Montgomery",
    landmarks: ["Lake Conroe", "April Sound", "Bentwater", "Grand Central Park", "Woodforest"],
    neighborhoods: ["April Sound", "Bentwater", "Grand Central Park", "Woodforest"],
    intro: "Lake Conroe waterfront plus inland Conroe — wind exposure and humidity age roofs fast.",
    localContext:
      "Lake-adjacent roofs around Conroe see accelerated fastener corrosion and ridge-cap lift from sustained wind and humidity, while inland subdivisions face the same regional hail exposure as the rest of Montgomery County.",
    dataCompleteness: "draft",
  },
};

export const SERVICE_AREA_SLUGS = Object.keys(SERVICE_AREAS) as ServiceAreaSlug[];
