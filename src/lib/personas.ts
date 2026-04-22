export type PersonaSlug =
  | "homeowner"
  | "agent"
  | "insurance"
  | "storm"
  | "hoa"
  | "inspector";

export interface Persona {
  slug: PersonaSlug;
  /** URL path for their landing page, e.g. /for-homeowners */
  path: string;
  label: string;
  /** What they want in 14 words or fewer. */
  promise: string;
  /** Primary call-to-action label for this persona. */
  ctaLabel: string;
  /** Tone direction from docs/brand-voice.md. */
  tone: string;
}

export const PERSONAS: Record<PersonaSlug, Persona> = {
  homeowner: {
    slug: "homeowner",
    path: "/for-homeowners",
    label: "Homeowners",
    promise: "Same-day inspection, written estimate, honest conversation about your roof.",
    ctaLabel: "Book my inspection",
    tone: "Neighborly-expert. Explain-without-condescending. Teach, don't sell.",
  },
  agent: {
    slug: "agent",
    path: "/for-agents",
    label: "Real estate agents",
    promise: "Same-day roof inspection for your listing — before the option period burns.",
    ctaLabel: "Book a listing inspection",
    tone: "Peer-professional. Crisp. Time-saving.",
  },
  insurance: {
    slug: "insurance",
    path: "/for-insurance-partners",
    label: "Insurance partners",
    promise: "Documentation-heavy claim support. Named project manager. Fast close.",
    ctaLabel: "Open a claim file with us",
    tone: "Dry-professional. Process-literate. Documentation-heavy.",
  },
  storm: {
    slug: "storm",
    path: "/storm-response",
    label: "Storm-impacted homeowners",
    promise: "We're already dialing. Free inspection booked the same day you call.",
    ctaLabel: "Book storm inspection",
    tone: "Urgent-calm. Reassurance + clear next step.",
  },
  hoa: {
    slug: "hoa",
    path: "/for-hoa",
    label: "HOA property managers",
    promise: "Multi-property pricing, ARC-approved shingle lists, board-ready documentation.",
    ctaLabel: "Request HOA pricing",
    tone: "Board-friendly. Liability-and-aesthetic language.",
  },
  inspector: {
    slug: "inspector",
    path: "/for-inspectors",
    label: "Home inspectors",
    promise: "Peer-level reports. We close the loop with the buyer without stepping on your findings.",
    ctaLabel: "Join our inspector network",
    tone: "Peer-professional. Referral partnership, reputation framing.",
  },
};

export const PERSONA_SLUGS = Object.keys(PERSONAS) as PersonaSlug[];
