import type { DataCompleteness } from "./quality-gate";

export type ServiceTag = "replacement" | "repair" | "inspection" | "storm" | "insurance";

export interface ServiceBullet {
  /** Bolded lead-in, e.g. "Pipe boot failures". */
  lead?: string;
  /** Plain body text. */
  text?: string;
  /** Trusted authored markup (e.g. an internal link). Used instead of text. */
  html?: string;
}

export interface ServiceSection {
  heading: string;
  body?: string;
  bullets?: ServiceBullet[];
  /** Render bullets as an ordered list (process steps). */
  ordered?: boolean;
}

/** Real, generally-true Q&A. Feeds FAQPage JSON-LD. Never fabricate specifics. */
export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  /** Short, human title, e.g. "Roof replacement". */
  title: string;
  serviceTag: ServiceTag;
  /** Unique SEO <title>. */
  seoTitle: string;
  /** Unique meta description. */
  seoDescription: string;
  /** Hero subhead. */
  summary: string;
  sections: ServiceSection[];
  faqs?: ServiceFaq[];
  dataCompleteness: DataCompleteness;
}

export const SERVICES: Record<ServiceTag, Service> = {
  replacement: {
    slug: "roof-replacement",
    title: "Roof replacement",
    serviceTag: "replacement",
    seoTitle: "Roof replacement in The Woodlands + NW Houston",
    seoDescription:
      "Full roof replacement with GAF Timberline HDZ, tear-off to deck, synthetic underlayment, named project manager, and a forty-photo documentation packet.",
    summary:
      "GAF Timberline HDZ standard. Tear-off to deck, synthetic underlayment, Class-4 impact-resistant upgrade available. We put the exact price in writing before we leave the driveway.",
    sections: [
      {
        heading: "What a full replacement includes",
        bullets: [
          {
            text: 'Tear-off to deck. No "overlay" shortcuts — Texas heat and humidity is no climate for a two-layer roof.',
          },
          {
            text: "Synthetic underlayment (GAF Deck-Armor) plus peel-and-stick ice-and-water shield at valleys and penetrations.",
          },
          { text: "New drip edge, new pipe boots, new ridge vents where applicable." },
          {
            text: "GAF Timberline HDZ architectural shingle, nailed to manufacturer spec (6-nail pattern in high-wind zones).",
          },
          {
            text: "50-year non-prorated Golden Pledge manufacturer warranty (requires a GAF Master Elite installer — a certification we are in the process of earning).",
          },
          {
            text: "Forty-photo documentation packet at close — yours to keep, plus a copy for your insurance file.",
          },
        ],
      },
      {
        heading: "Options worth considering",
        bullets: [
          {
            html: '<strong>Class-4 impact-resistant upgrade</strong> — most Texas carriers offer a wind/hail premium discount for Class-4 shingles; the upgrade often pays back within a few years. See <a href="/blog">our Class-4 IR shingle breakdown</a>.',
          },
          {
            lead: "Ridge vent upgrade",
            text: "cuts attic temperatures and extends shingle life. If your current roof had turbines, we'll quote both.",
          },
          {
            lead: "Solar-ready deck prep",
            text: "if you're planning solar in the next few years, we can pre-flash key locations.",
          },
        ],
      },
      {
        heading: "What the process looks like",
        ordered: true,
        bullets: [
          { text: "Free inspection plus written estimate — the same day you call." },
          { text: "Material selection and color sample drop-off." },
          {
            text: "HOA architectural-review submittal — we handle the paperwork where your community requires it.",
          },
          { text: "Install day — usually one day, two for larger homes. Project manager on-site." },
          {
            text: "Final walk-through, magnet sweep of driveway and yard, documentation packet delivered.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "How long does a roof replacement take?",
        a: "Most single-family replacements are completed in one day. Larger or steep-slope homes can take two. Your project manager confirms the schedule before work starts.",
      },
      {
        q: "Do you handle the HOA approval?",
        a: "Yes. Where your community has an architectural review committee, we prepare and submit the shingle and color approval paperwork as part of the job.",
      },
      {
        q: "What warranty comes with a new roof?",
        a: "Replacements are built to qualify for GAF's Golden Pledge manufacturer warranty, which requires a Master Elite installer — a certification we are in the process of earning. We'll confirm the exact coverage in writing on your estimate.",
      },
    ],
    dataCompleteness: "complete",
  },

  repair: {
    slug: "roof-repair",
    title: "Roof repair",
    serviceTag: "repair",
    seoTitle: "Roof repair — same-day or next-day in NW Houston",
    seoDescription:
      "Leaks, lifted shingles, failed flashing, bad pipe boots. Same-day or next-day roof repair across The Woodlands, Spring, Tomball, Magnolia, Conroe, and Cypress.",
    summary:
      "Leaks, lifted shingles, failed flashing, bad pipe boots. Usually same-day or next-day. Written diagnosis before any cash changes hands.",
    sections: [
      {
        heading: "The repairs we see most",
        bullets: [
          {
            lead: "Pipe boot failures",
            text: "the rubber commonly cracks around the 7–10 year mark and is a frequent cause of mystery ceiling leaks.",
          },
          {
            lead: "Ridge-cap lift",
            text: "common after high-wind events. If only a few caps are lifted, a targeted repair is honest. If it's widespread, we'll tell you.",
          },
          {
            lead: "Flashing at wall step-ins",
            text: "especially where a roof meets a chimney or a second-story wall. Water takes the path of least resistance, and bad step flashing is often it.",
          },
          {
            lead: "Nail pops",
            text: "nails backing out push through the shingle above; every one is a potential leak.",
          },
          {
            lead: "Granule loss and blistering",
            text: "often a sign the roof is near end-of-life; we'll show you photos and let you decide.",
          },
        ],
      },
      {
        heading: 'When we say "just repair it"',
        body: "We're happy to repair. We won't upsell a replacement when a sound repair will give you several more good years. The forty-photo packet we leave shows the rest of the roof too, so you know what to watch.",
      },
      {
        heading: 'When we say "it\'s time to replace"',
        body: "If the roof is in its replacement window (roughly 20+ years on 3-tab, 25+ on architectural, or any age after a hail event with structural damage), a patch is throwing money at a lost cause. We'll show you why.",
      },
    ],
    faqs: [
      {
        q: "Can you repair my roof the same day?",
        a: "Most repairs are scheduled same-day or next-day depending on weather and the parts required. Active leaks get priority.",
      },
      {
        q: "Will you push me toward a full replacement?",
        a: "No. If a repair is the right call, we repair it and document the rest of the roof so you can plan ahead. We only recommend replacement when a patch genuinely won't hold.",
      },
    ],
    dataCompleteness: "complete",
  },

  inspection: {
    slug: "roof-inspection",
    title: "Free roof inspection",
    serviceTag: "inspection",
    seoTitle: "Free roof inspection — same day",
    seoDescription:
      "Free roof inspection with a forty-photo documentation packet and written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    summary:
      "Forty-photo packet. Written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    sections: [
      {
        heading: "What's in the forty-photo packet",
        bullets: [
          { text: "Every slope — north, south, east, west — at roof level." },
          {
            text: "Every valley, ridge, and penetration (pipe boots, vents, skylights, chimneys).",
          },
          {
            text: "Close-ups of any concerning finding (granule loss, hail impact, lift, nail pop, flashing).",
          },
          {
            text: "Attic photos where accessible — stains on decking, insulation moisture, ventilation issues.",
          },
          { text: "A plain-English written summary of condition plus estimated remaining life." },
        ],
      },
      {
        heading: "Who this is for",
        bullets: [
          {
            lead: "Homeowners",
            text: "curious about roof age, planning to sell, or after a storm.",
          },
          {
            lead: "Real estate agents",
            text: "pre-listing or during the option period. Fast turnaround.",
          },
          {
            lead: "Insurance claimants",
            text: "before an adjuster visit, so you know what to expect.",
          },
        ],
      },
      {
        heading: "What we don't do on an inspection call",
        bullets: [
          { text: "We don't give a verbal quote and leave. The estimate is written." },
          {
            text: "We don't pressure a contract. If you need a repair or replacement, we'll follow up — you can ignore us forever.",
          },
          { text: "We don't knock doors. This call happens because you booked it." },
        ],
      },
    ],
    faqs: [
      {
        q: "Is the inspection really free?",
        a: "Yes. The inspection and the written findings are free with no obligation. You only pay if you choose to hire us for repair or replacement work.",
      },
      {
        q: "How fast do I get the results?",
        a: "We deliver written findings within 24 hours of the inspection, including the photo packet.",
      },
    ],
    dataCompleteness: "complete",
  },

  storm: {
    slug: "storm-damage",
    title: "Storm damage",
    serviceTag: "storm",
    seoTitle: "Storm damage roofing — Houston hail + wind",
    seoDescription:
      "Hail, wind, and tree-impact roof damage documented with a forty-photo packet built for your insurance claim. Houston-area same-day response.",
    summary:
      "Hail, wind, fallen-limb impact. We document everything your adjuster will ask for, and then some.",
    sections: [
      {
        heading: "How to tell if your roof took a hit",
        bullets: [
          {
            text: "Gutters: fresh round dents on the downside of a gutter or on the aluminum gutter apron.",
          },
          { text: "Flashing: new dings on soft aluminum step flashing or on a turtle vent." },
          {
            text: "A/C unit: dings on the condenser coil fins are a strong hail-size proxy — photograph them.",
          },
          { text: "Shingles: granule loss pooled in gutters and downspouts beyond normal shed." },
          {
            text: "Ridge caps: lifted or torn at a single ridge plane — a high-wind exposure indicator.",
          },
        ],
      },
      {
        heading: "The claim-ready packet",
        body: "Insurance adjusters work fast, and documentation is what speeds up a claim. We bring:",
        bullets: [
          { text: "Forty photos minimum — every slope, every penetration, close-ups of damage." },
          { text: "Hail-size correlation photos (A/C coil, gutter aprons, soft metal)." },
          { text: "A written scope of loss aligned to Xactimate line items." },
          { text: "On-site attendance during your adjuster's visit if you'd like." },
        ],
      },
      {
        heading: "Things we won't touch",
        bullets: [
          {
            text: "Deductible waivers, discounts, or \"we'll eat it\" — that's insurance fraud, and we don't play.",
          },
          {
            html: 'Signing a contract at the door. Texas gives you 3 days to rescind any residential roof repair contract signed at your home — <a href="/legal/tcpa">§ 27.02</a>.',
          },
          {
            html: 'Acting as your public adjuster. We\'re the contractor; a PA is a separately-licensed role under <a href="/legal/tcpa">Tex. Ins. Code § 701</a>.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Should I file a claim for storm damage?",
        a: "Get a documented inspection first. A denied claim can be worse than no claim, so we tell you honestly whether the damage is significant enough to justify filing.",
      },
      {
        q: "Do you meet my insurance adjuster?",
        a: "Yes, we attend the adjuster's visit on request and bring our documentation so nothing is missed.",
      },
    ],
    dataCompleteness: "complete",
  },

  insurance: {
    slug: "insurance-claims",
    title: "Insurance claims",
    serviceTag: "insurance",
    seoTitle: "Insurance claim support for roof damage",
    seoDescription:
      "Process-literate roof insurance claim support: Xactimate-ready scopes, adjuster meet, named project manager. We're the contractor, not your public adjuster.",
    summary:
      "Process-literate claim support. Xactimate-ready scopes of loss. A named project manager who knows the process cold.",
    sections: [
      {
        heading: "What our claim support looks like",
        ordered: true,
        bullets: [
          {
            lead: "Pre-claim inspection",
            text: "before you open a claim, we'll tell you honestly whether there's enough damage to justify it. A denied claim is worse than no claim.",
          },
          {
            lead: "Documentation packet",
            text: "forty-plus photos, hail and wind indicators, and a written scope of loss.",
          },
          {
            lead: "Adjuster meet",
            text: "we show up on-site when the adjuster visits. You don't have to be there.",
          },
          {
            lead: "Supplemental items",
            text: "if the adjuster's scope misses code-required items (new decking, ice-and-water, drip edge), we document them and the carrier pays the supplement. This is normal.",
          },
          {
            lead: "Install and close",
            text: "once the insurance scope is agreed, we install and deliver the final documentation packet for your file.",
          },
        ],
      },
      {
        heading: "What we won't do",
        bullets: [
          {
            html: "We are not a public adjuster — that's a separately-licensed role under <a href=\"/legal/tcpa\">Tex. Ins. Code § 4102</a>. We're your contractor.",
          },
          {
            text: "We will not negotiate your claim in a way that crosses into public-adjuster territory. We document; you (or a licensed PA you hire separately) negotiate.",
          },
          {
            text: "We will not waive or absorb your deductible. That's insurance fraud, with criminal exposure for both of us.",
          },
        ],
      },
      {
        heading: "Carrier claim processes we know",
        body: "We're fluent in the claim processes and Xactimate preferences of the major Texas carriers, including State Farm, Allstate, USAA, Farmers, Liberty Mutual, Progressive, Nationwide, Travelers, Chubb, and Texas Farm Bureau.",
      },
    ],
    faqs: [
      {
        q: "Are you a public adjuster?",
        a: "No. We're your roofing contractor. A public adjuster is a separately-licensed role under Texas Insurance Code § 4102. We document the damage; a licensed PA you hire separately negotiates the claim.",
      },
      {
        q: "Can you waive my deductible?",
        a: "No. Waiving or absorbing a deductible is insurance fraud in Texas, with criminal exposure for both the homeowner and the contractor.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const SERVICE_TAGS = Object.keys(SERVICES) as ServiceTag[];
export const SERVICE_LIST = Object.values(SERVICES);
