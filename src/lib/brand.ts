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
  licenseNote: `Texas does not license residential roofing contractors. Northvale Roofing LLC is a ${
    businessInfo.certStatus || "GAF Master Elite applicant"
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
} as const;

export const SIGNATURE_PHRASES = [
  "Same day. In writing.",
  "A named project manager.",
  "Forty-photo packet.",
  "Under 60 seconds.",
  "Built for the next storm, not the last one.",
] as const;

export const COLORS = {
  navy: "#172f52",
  gold: "#d98a1f",
  ink: "#1f1f1f",
} as const;
