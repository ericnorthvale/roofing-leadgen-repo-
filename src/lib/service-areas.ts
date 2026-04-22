export type ServiceAreaSlug =
  | "the-woodlands"
  | "spring"
  | "tomball"
  | "magnolia"
  | "conroe"
  | "cypress";

export interface ServiceArea {
  slug: ServiceAreaSlug;
  name: string;
  county: "Harris" | "Montgomery";
  /** Neighborhoods, HOAs, and landmarks used to prove local presence in copy. */
  landmarks: string[];
  /** Short intro copy (hero subhead). Keep specific — named places, not "surrounding areas". */
  intro: string;
  /** Reason to serve (storm exposure, roof age, HOA density). Used in body copy. */
  storyHook: string;
}

export const SERVICE_AREAS: Record<ServiceAreaSlug, ServiceArea> = {
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
      "The Pavilion",
    ],
    intro:
      "Creekside Park to Grogan's Mill. We know the HOA shingle restrictions by village, and we show up when we say we'll show up.",
    storyHook:
      "The Woodlands' tree canopy drops impact debris during every storm cycle; most 2005–2010 build-era roofs are inside their replacement window right now.",
  },
  spring: {
    slug: "spring",
    name: "Spring",
    county: "Harris",
    landmarks: ["Klein", "Gleannloch Farms", "Old Town Spring", "Louetta Road corridor", "Champions Forest"],
    intro: "Based off I-45 in Spring. Most jobs are within a 20-minute drive.",
    storyHook:
      "Spring took a direct path in several 2024–2025 hailstorm tracks; a significant share of homes still have unopened claim evidence on the roof.",
  },
  tomball: {
    slug: "tomball",
    name: "Tomball",
    county: "Harris",
    landmarks: ["Rose Hill", "Lakewood Crossing", "Willowcreek Ranch", "Vintage Oaks", "Downtown Tomball"],
    intro: "We cover Tomball on the way up FM 2920 from Spring — same-day response is rarely more than a short drive.",
    storyHook:
      "Tomball has large new-build subdivisions where builder-grade 3-tab shingles are already showing granule loss at the 10-year mark.",
  },
  magnolia: {
    slug: "magnolia",
    name: "Magnolia",
    county: "Montgomery",
    landmarks: ["High Meadow Ranch", "Mostyn Manor", "FM 1488 corridor", "Magnolia Ridge"],
    intro: "Magnolia homes are larger, more exposed, and more hail-hit than almost any other NW Houston sub-market.",
    storyHook:
      "Open-lot Magnolia properties take the full brunt of supercell tracks coming off Lake Conroe — insurance-claim volume here is outsized.",
  },
  conroe: {
    slug: "conroe",
    name: "Conroe",
    county: "Montgomery",
    landmarks: ["Lake Conroe", "April Sound", "Bentwater", "Grand Central Park", "Woodforest"],
    intro: "Lake Conroe waterfront plus inland Conroe — wind exposure and humidity age roofs fast.",
    storyHook:
      "Lake-adjacent roofs see accelerated fastener corrosion and ridge-cap lift; many Bentwater and April Sound roofs are now in their second or third replacement cycle.",
  },
  cypress: {
    slug: "cypress",
    name: "Cypress",
    county: "Harris",
    landmarks: ["Bridgeland", "Towne Lake", "Fairfield", "Cypress Creek Lakes", "Blackhorse Ranch"],
    intro: "Bridgeland and Towne Lake lead our Cypress work — master-planned HOAs with very specific shingle and color approvals.",
    storyHook:
      "Cypress master-planned communities have strict architectural review; we keep the approved-shingle list on file for Bridgeland, Towne Lake, and Fairfield.",
  },
};

export const SERVICE_AREA_SLUGS = Object.keys(SERVICE_AREAS) as ServiceAreaSlug[];
