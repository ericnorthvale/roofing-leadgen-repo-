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
  "the-woodlands": {
    slug: "the-woodlands",
    name: "The Woodlands",
    county: "Montgomery",
    landmarks: [
      "Creekside Park",
      "Grogan's Mill",
      "Panther Creek",
      "Alden Bridge",
      "Cochran's Crossing",
      "Sterling Ridge",
      "Indian Springs",
      "Town Center",
    ],
    neighborhoods: [
      "Creekside Park",
      "Grogan's Mill",
      "Panther Creek",
      "Alden Bridge",
      "Cochran's Crossing",
      "Sterling Ridge",
      "Indian Springs",
    ],
    intro:
      "Creekside Park to Grogan's Mill. We know the HOA shingle restrictions by village, and we show up when we say we'll show up.",
    localContext:
      "The Woodlands is a master-planned community of villages, each with its own architectural review committee and approved-shingle rules. A dense tree canopy means wind events routinely drop limbs and debris onto roofs, and many homes from the 2000s build-out are now reaching the typical replacement window for architectural shingles.",
    dataCompleteness: "draft",
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
