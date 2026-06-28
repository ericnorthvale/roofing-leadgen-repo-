/**
 * Curated, NON-COMPETITIVE external resources for homeowner education and
 * authority. Manufacturers, building-science orgs, government/consumer guidance,
 * and trusted explainers — never competing roofers. Linked (not embedded) so
 * mobile performance and the perf budget are unaffected. Single source so the
 * same vetted links are reused across service + area pages without drift.
 */
export interface ResourceLink {
  label: string;
  href: string;
  description: string;
  /** Short source name shown as a tag, e.g. "GAF", "IBHS". */
  source: string;
}

export const RESOURCES = {
  replacement: [
    {
      label: "GAF Timberline HDZ shingles",
      href: "https://www.gaf.com/en-us/roofing-products/residential-roofing-products/shingles/timberline/timberline-hdz",
      description: "Manufacturer specs for the architectural shingle we install as standard.",
      source: "GAF",
    },
    {
      label: "GAF homeowner warranties",
      href: "https://www.gaf.com/en-us/for-homeowners/warranties",
      description: "How manufacturer system warranties (incl. Golden Pledge) actually work.",
      source: "GAF",
    },
    {
      label: "ENERGY STAR roof products",
      href: "https://www.energystar.gov/products/building_products/roof_products",
      description: "Federal guidance on reflective roofing and energy efficiency.",
      source: "ENERGY STAR",
    },
  ],
  storm: [
    {
      label: "FORTIFIED Roof standard",
      href: "https://fortifiedhome.org/roof/",
      description: "Building-science research on roofs engineered to survive severe storms.",
      source: "IBHS",
    },
    {
      label: "NWS Houston/Galveston",
      href: "https://www.weather.gov/hgx/",
      description: "Official local forecasts, watches, and severe-weather warnings.",
      source: "NOAA / NWS",
    },
    {
      label: "Storm damage & insurance tips",
      href: "https://www.tdi.texas.gov/tips/storm-damage-and-insurance.html",
      description: "State consumer guidance on filing weather-related roof claims.",
      source: "Texas Dept. of Insurance",
    },
  ],
  insurance: [
    {
      label: "Storm damage & insurance tips",
      href: "https://www.tdi.texas.gov/tips/storm-damage-and-insurance.html",
      description: "What Texas homeowners should know before and during a roof claim.",
      source: "Texas Dept. of Insurance",
    },
    {
      label: "Help with an insurance claim",
      href: "https://www.tdi.texas.gov/consumer/storms/index.html",
      description: "Official consumer help center for disputed or delayed claims.",
      source: "Texas Dept. of Insurance",
    },
  ],
  inspection: [
    {
      label: "How a roof works",
      href: "https://www.thisoldhouse.com/roofing",
      description: "Plain-English explainers on roofing systems and maintenance.",
      source: "This Old House",
    },
  ],
  woodlands: [
    {
      label: "NWS Houston/Galveston",
      href: "https://www.weather.gov/hgx/",
      description: "Local severe-weather outlook for Montgomery and Harris counties.",
      source: "NOAA / NWS",
    },
    {
      label: "FORTIFIED Roof standard",
      href: "https://fortifiedhome.org/roof/",
      description: "Storm-resilient roofing research relevant to Gulf Coast homes.",
      source: "IBHS",
    },
  ],
} satisfies Record<string, ResourceLink[]>;
