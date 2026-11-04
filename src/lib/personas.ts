export type PersonaSlug = "homeowner" | "agent" | "insurance" | "storm" | "hoa" | "inspector";

export interface Persona {
  slug: PersonaSlug;
  /** URL path for their landing page, e.g. /for-homeowners */
  path: string;
  label: string;
  /** What they want in 14 words or fewer. Rendered on the page. */
  promise: string;
  /**
   * Meta description. Separate from `promise`, which is capped at 14 words for
   * the page and left these landing pages with 69-87 character snippets —
   * about half the space Google gives, and thin enough that it wrote its own
   * from the page instead. Drawn from each page's own bullets; never a claim
   * the page does not make.
   */
  seoDescription: string;
  /** Primary call-to-action label for this persona. */
  ctaLabel: string;
  /** Tone direction from docs/brand-voice.md. */
  tone: string;
}

export const PERSONAS: Record<PersonaSlug, Persona> = {
  homeowner: {
    slug: "homeowner",
    seoDescription:
      "Same-day roof inspection in The Woodlands and North Houston, a written estimate before we leave your driveway, and a forty-photo packet at close.",
    path: "/for-homeowners",
    label: "Homeowners",
    promise: "Same-day inspection, written estimate, honest conversation about your roof.",
    ctaLabel: "Book my inspection",
    tone: "Neighborly-expert. Explain-without-condescending. Teach, don't sell.",
  },
  agent: {
    slug: "agent",
    seoDescription:
      "Same-day roof inspection for your listing, usually within 4 hours — a plain-English written finding you can forward to the buyer during the option period.",
    path: "/for-agents",
    label: "Real estate agents",
    promise: "Same-day roof inspection for your listing — before the option period burns.",
    ctaLabel: "Book a listing inspection",
    tone: "Peer-professional. Crisp. Time-saving.",
  },
  insurance: {
    slug: "insurance",
    seoDescription:
      "Xactimate-aligned scopes of loss, code-required supplements documented with photos, a named project manager on every claim. Contractor of record, not a PA.",
    path: "/for-insurance-partners",
    label: "Insurance partners",
    promise: "Documentation-heavy claim support. Named project manager. Fast close.",
    ctaLabel: "Open a claim file with us",
    tone: "Dry-professional. Process-literate. Documentation-heavy.",
  },
  storm: {
    slug: "storm",
    seoDescription:
      "Storm today? Free same-day roof inspection, documented for your insurance claim, with no pressure to sign. Serving The Woodlands and North Houston.",
    path: "/storm-response",
    label: "Storm-impacted homeowners",
    promise: "We're already dialing. Free inspection booked the same day you call.",
    ctaLabel: "Book storm inspection",
    tone: "Urgent-calm. Reassurance + clear next step.",
  },
  hoa: {
    slug: "hoa",
    seoDescription:
      "Multi-property and multi-phase pricing for community roof programs, ARC-compliant shingle and color submittals, board-ready per-home scope and photos.",
    path: "/for-hoa",
    label: "HOA property managers",
    promise: "Multi-property pricing, ARC-approved shingle lists, board-ready documentation.",
    ctaLabel: "Request HOA pricing",
    tone: "Board-friendly. Liability-and-aesthetic language.",
  },
  inspector: {
    slug: "inspector",
    seoDescription:
      "Peer-level roof documentation that keeps your report the source of truth. No quid-pro-quo referral fees — TREC rules are specific and we respect them.",
    path: "/for-inspectors",
    label: "Home inspectors",
    promise:
      "Peer-level reports. We close the loop with the buyer without stepping on your findings.",
    ctaLabel: "Join our inspector network",
    tone: "Peer-professional. Referral partnership, reputation framing.",
  },
};

export const PERSONA_SLUGS = Object.keys(PERSONAS) as PersonaSlug[];

/** URL slugs for the public /for-[persona] dynamic route. */
export const PUBLIC_PERSONA_SLUGS = [
  "homeowners",
  "agents",
  "insurance-partners",
  "hoa",
  "inspectors",
] as const;

export type PublicPersonaSlug = (typeof PUBLIC_PERSONA_SLUGS)[number];

export const PUBLIC_PERSONA_MAP: Record<PublicPersonaSlug, PersonaSlug> = {
  homeowners: "homeowner",
  agents: "agent",
  "insurance-partners": "insurance",
  hoa: "hoa",
  inspectors: "inspector",
};
