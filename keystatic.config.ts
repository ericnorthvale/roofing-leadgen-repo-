import { config, fields, collection, singleton } from "@keystatic/core";

/**
 * Keystatic admin config — the visual panel at /keystatic.
 *
 * Storage: GitHub in production (edits commit via the Keystatic GitHub App →
 * Vercel preview/deploy); local filesystem in dev. Access to /keystatic is gated
 * by Google Workspace SSO in src/middleware.ts (see docs/setup-admin-panel.md).
 *
 * Scope (lean, per plan): the things the owners actually edit — Business Info
 * (NAP/cert/experience/warranties/financing) and Reviews (REAL only). City &
 * service SEO pages stay Claude-crafted. Blog/photos can be added later.
 */
// GitHub storage in production (edits commit via the Keystatic GitHub App →
// Vercel preview/deploy); local filesystem in dev so day-to-day development
// never writes to the repo.
//
// ONE-TIME SETUP: Keystatic's GitHub App is created by a guided wizard that only
// appears when storage is GitHub mode. Set PUBLIC_KEYSTATIC_GITHUB_SETUP=true in
// .env and run `pnpm dev`, then open /keystatic — the wizard creates the App and
// writes KEYSTATIC_GITHUB_CLIENT_ID/SECRET, KEYSTATIC_SECRET, and
// PUBLIC_KEYSTATIC_GITHUB_APP_SLUG into your .env. Copy those into Vercel and
// remove the flag. See docs/setup-admin-panel.md.
const keystaticGithubMode =
  import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_GITHUB_SETUP === "true";

export default config({
  storage: keystaticGithubMode
    ? { kind: "github", repo: "ericnorthvale/roofing-leadgen-repo-" }
    : { kind: "local" },
  ui: {
    brand: { name: "Northvale Roofing" },
    navigation: {
      Business: ["businessInfo"],
      Customers: ["reviews"],
    },
  },
  singletons: {
    businessInfo: singleton({
      label: "Business Info (NAP, certs, experience)",
      path: "src/data/business-info",
      format: { data: "json" },
      schema: {
        phoneDisplay: fields.text({
          label: "Phone (display)",
          description: 'How the phone shows on the site, e.g. "(281) 555-1234"',
        }),
        phoneE164: fields.text({
          label: "Phone (dialable)",
          description: "Same number in +1 format, e.g. +12815551234",
        }),
        smsDisplay: fields.text({ label: "Text/SMS number (display)" }),
        email: fields.text({ label: "Email" }),
        addressLine1: fields.text({ label: "Street address" }),
        city: fields.text({ label: "City" }),
        region: fields.text({ label: "State", defaultValue: "TX" }),
        postalCode: fields.text({ label: "ZIP" }),
        hoursSummary: fields.text({ label: "Business hours" }),
        foundedYear: fields.integer({ label: "Founded year" }),
        yearsExperience: fields.text({
          label: "Operator/crew experience",
          description:
            "TRUE claim only, e.g. 'Crews with 20+ years across Houston'. Leave blank if unsure.",
          multiline: true,
        }),
        certStatus: fields.text({
          label: "Certification status",
          description:
            "Only certs actually held or applied for, e.g. 'GAF Master Elite applicant'. Never claim a cert you don't hold.",
          multiline: true,
        }),
        warranties: fields.text({ label: "Warranties offered", multiline: true }),
        financing: fields.text({ label: "Financing offered", multiline: true }),
      },
    }),
  },
  collections: {
    reviews: collection({
      label: "Reviews (REAL only)",
      path: "src/content/reviews/*",
      slugField: "author",
      format: { data: "json" },
      entryLayout: "form",
      schema: {
        author: fields.slug({
          name: {
            label: "Customer name",
            description:
              "Use a REAL review only. Inventing reviews is illegal (FTC) and an SEO risk.",
          },
        }),
        source: fields.select({
          label: "Source",
          options: [
            { label: "Google", value: "google" },
            { label: "Facebook", value: "facebook" },
            { label: "BBB", value: "bbb" },
            { label: "Direct", value: "direct" },
          ],
          defaultValue: "google",
        }),
        rating: fields.integer({
          label: "Rating (1–5)",
          validation: { min: 1, max: 5 },
          defaultValue: 5,
        }),
        relativeTime: fields.text({ label: "When", description: 'e.g. "2 weeks ago"' }),
        text: fields.text({ label: "Review text", multiline: true }),
        serviceTag: fields.text({ label: "Service tag (optional)" }),
        cityTag: fields.text({
          label: "City slug (optional)",
          description: "e.g. the-woodlands, spring",
        }),
      },
    }),
  },
});
