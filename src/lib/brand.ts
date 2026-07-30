import businessInfo from "../data/business-info.json";

// Brand IDENTITY stays in code (rarely changes). Operational FACTS — NAP, certs,
// experience, warranties, financing — live in src/data/business-info.json, which
// the owners edit in the /keystatic admin panel. This keeps NAP single-source and
// byte-identical everywhere while making it owner-editable without touching code.
// NEEDS OWNER CONFIRMATION: only state certifications actually held/applied for.
export const BRAND = {
  name: "Northvale Roofing",
  legalName: "Northvale Roofing LLC",
  domain: "northvaleroofing.com",
  tagline: "Same day. In writing.",
  promise: "Written estimate before we leave the driveway.",
  phoneDisplay: businessInfo.phoneDisplay,
  phoneE164: businessInfo.phoneE164,
  smsDisplay: businessInfo.smsDisplay || businessInfo.phoneDisplay,
  email: businessInfo.email,
  hoursSummary: businessInfo.hoursSummary,
  foundedYear: businessInfo.foundedYear,
  licenseNote: `Texas does not license residential roofing contractors. Northvale Roofing LLC is an ${
    businessInfo.certStatus || "IKO ROOFPRO applicant"
  }.`,
  addressLine1: businessInfo.addressLine1,
  city: businessInfo.city,
  region: businessInfo.region,
  postalCode: businessInfo.postalCode,
  country: "US",
  gbpPlaceId: "",
  // Owner-supplied facts (may be empty until provided; never fabricate).
  yearsExperience: businessInfo.yearsExperience,
  certStatus: businessInfo.certStatus,
  warranties: businessInfo.warranties,
  financing: businessInfo.financing,
  /** Owner's real profile URLs (GBP, Facebook, …) — feeds JSON-LD sameAs. */
  socialProfiles: (businessInfo as { socialProfiles?: string[] }).socialProfiles ?? [],
} as const;

// Owner-picked 2026-07-30 ("Option 4 — local and lasting"): value statements,
// deliberately intangible, all grounded in the owner's published About-page
// commitments (permanent local company, honest guidance, standing behind work).
export const SIGNATURE_PHRASES = [
  "Local, and staying local.",
  "Honest guidance.",
  "A named project manager.",
  "Roofs we stand behind.",
  "Built for the next storm, not the last one.",
] as const;

// Brand palette anchors (docs/brand-guidelines.md §3). `goldDeep` is the only
// gold allowed as body-size text/icons on light backgrounds (gold itself fails
// WCAG on white at 2.37:1); full tint ramps live in src/styles/globals.css.
export const COLORS = {
  navy: "#060E21",
  gold: "#C9A26C",
  goldDeep: "#956E37",
  cream: "#E8D5B0",
  ink: "#1d1e20",
} as const;
