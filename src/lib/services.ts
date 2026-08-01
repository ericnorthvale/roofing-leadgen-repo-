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
  /**
   * Visual treatment for the section (owner-approved service-page system,
   * 2026-08-01). Purely presentational — the same text renders either way,
   * so tagging a section never changes what crawlers read.
   * - "steps": ordered bullets as a numbered gold timeline
   * - "cards": lead/text bullets as a card grid
   * - undefined: classic prose (default)
   */
  kind?: "steps" | "cards";
  /** Optional REAL photo inset rendered after the section (never stock). */
  photo?: { src: string; alt: string; caption?: string };
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
  /**
   * Optional REAL photo for the page-header backdrop (owner-approved
   * service-page visual system, 2026-08-01). Never stock (Hard Rule #2);
   * alt must not claim a location that isn't confirmed.
   */
  heroPhoto?: { src: string; alt: string };
  /**
   * "At a glance" chips under the header CTAs. Each must restate a TRUE fact
   * already made on this page (or sourced in docs/research-facts.md) — the
   * chips are a summary surface, never a place for new claims.
   */
  glance?: { value: string; label: string }[];
  /** Optional real before/during/after pair for the page's proof band. */
  beforeAfter?: {
    intro?: string;
    beforeSrc: string;
    beforeAlt: string;
    beforeCaption: string;
    afterSrc: string;
    afterAlt: string;
    afterCaption: string;
  };
  dataCompleteness: DataCompleteness;
}

/**
 * Metro-wide service guides. These pages target the non-city-qualified queries
 * ("roof replacement", "roof repair near me" via NW Houston framing); the
 * city-qualified money queries belong to city-services.ts pages — keep titles
 * and content from cannibalizing them (see docs/keyword-map.md).
 *
 * Facts sourced in docs/research-facts.md (IKO line = Sheet 1B). Costs are
 * attributed market data. Warranty claims are certification-honest: we register
 * the IKO Limited Lifetime + 15-year Iron Clad + 130-mph wind coverage that any
 * installer can register, and never claim ROOFPRO-tier extended coverage until
 * Northvale's enrollment is confirmed (see Sheet 1B).
 */
export const SERVICES: Record<ServiceTag, Service> = {
  replacement: {
    slug: "roof-replacement",
    title: "Roof replacement",
    serviceTag: "replacement",
    seoTitle: "Roof Replacement — NW Houston & Montgomery County",
    seoDescription:
      "Full roof replacement across NW Houston: tear-off to deck, synthetic underlayment, wind-rated architectural shingles, and a written price before we leave.",
    summary:
      "Tear-off to deck, a rebuilt roof system — decking to ridge vent — and the exact price in writing before we leave the driveway. Architectural shingle standard; Class-4 impact and metal options quoted side by side.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-04.webp",
      alt: "Completed roof replacement in dark architectural shingle on a red-brick Houston-area home",
    },
    // Each chip restates a fact already on this page (install time: process
    // step + FAQ; forty-photo packet: includes list; written price: summary).
    glance: [
      { value: "1 day", label: "most installations finish in one — larger homes take two" },
      { value: "40 photos", label: "the documentation packet you keep at close" },
      { value: "In writing", label: "your exact price before we leave the driveway" },
    ],
    beforeAfter: {
      intro:
        "A real Northvale replacement — the same roof mid-installation and completed, by drone.",
      beforeSrc: "/work/work-08-during.webp",
      beforeAlt:
        "Northvale Roofing crew installing synthetic underlayment during this roof replacement — drone view",
      beforeCaption: "During installation",
      afterSrc: "/work/work-09-after.webp",
      afterAlt: "The same roof completed — drone view of the finished shingle roof replacement",
      afterCaption: "Completed",
    },
    sections: [
      {
        heading: "What a full replacement includes",
        bullets: [
          {
            text: 'Tear-off to deck — the residential code (IRC R908.3) requires removing existing coverings before new roofing goes on, and prohibits covering a water-soaked deck or stacking a third layer. In Texas heat, an overlay bakes from below anyway. We don\'t do "roof-overs."',
          },
          {
            text: "Decking inspection and replacement where needed. Rotted or delaminated sheathing can't stay under a new roof; every replaced sheet is photographed and itemized.",
          },
          {
            text: "Synthetic underlayment (higher tear strength and water resistance than old asphalt felt) plus self-adhering ice-and-water membrane at valleys and penetrations — the self-sealing layer at exactly the details that leak.",
          },
          {
            text: "New drip edge at eaves and rakes (a code requirement — IRC R905.2.8.5), new pipe boots, new flashing where it's aged, and ridge ventilation sized to the job.",
          },
          {
            text: "IKO architectural shingles nailed through the reinforced ArmourZone to manufacturer spec — six-nail patterns where wind exposure calls for it.",
          },
          {
            text: "IKO manufacturer warranty registered on every install: a Limited Lifetime product warranty, the 15-year non-prorated Iron Clad Protection period, a 130-mph limited high-wind warranty, and a 10-year algae-resistance warranty — coverage any installer can register, with no special certification required.",
          },
          {
            text: "Forty-photo documentation packet at close — yours to keep, plus a copy for your insurance file.",
          },
        ],
      },
      {
        heading: "Materials we install",
        body: "We standardize on IKO and put your options side by side in writing:",
        kind: "cards",
        bullets: [
          {
            lead: "IKO Dynasty (standard)",
            text: "our default architectural shingle — the reinforced ArmourZone nailing band, a 130-mph limited wind warranty, Limited Lifetime coverage, 15-year Iron Clad Protection, a 10-year algae warranty, and Class A fire, in more colors than any other IKO line.",
          },
          {
            lead: "IKO Nordic (Class 4 upgrade)",
            text: "IKO's highest-performing line — polymer-modified (SBS) asphalt that flexes for the highest hail rating, UL 2218 Class 4, with the same 130-mph wind, Limited Lifetime, and Iron Clad coverage as Dynasty.",
          },
          {
            html: "<strong>Class 3 vs. Class 4 & insurance</strong> — Class 4 (Nordic) is the highest UL 2218 impact rating, but it's a lab classification, not a hail guarantee, and hail isn't covered by the shingle warranty. Its value is qualifying you for an insurance premium discount where your carrier offers one. See <a href=\"/blog/class-4-impact-resistant-shingles-texas\">our Class-4 breakdown</a>.",
          },
          {
            lead: "Standing-seam metal",
            text: "30–50+ year service life per the Metal Roofing Alliance, concealed fasteners, 140-mph wind rating — at roughly two to three times the cost of asphalt.",
          },
        ],
      },
      {
        heading: "The system under the shingles",
        body: "Shingles are the visible 20% of a roof. Replacements fail or last on the other 80%:",
        kind: "cards",
        photo: {
          src: "/work/work-05.webp",
          alt: "Synthetic underlayment and starter course installed at a roof edge — install detail",
          caption: "The system under the shingles — a real Northvale install",
        },
        bullets: [
          {
            lead: "Ventilation",
            text: "ARMA reports a poorly-vented attic can hit 140°F on a 90°F day — heat that cooks shingles from below. We size intake and exhaust to the 1-in-300 net-free-area guideline with balanced soffit intake and ridge exhaust.",
          },
          {
            lead: "Flashing",
            text: "the code's job for flashing is keeping water out of every roof and wall joint (IRC R903.2). Step flashing, chimney details, and wall step-ins get rebuilt, not reused, when they're aged.",
          },
          {
            lead: "Valleys and penetrations",
            text: "ice-and-water membrane under the vulnerable details, because that's where nearly every leak we chase started.",
          },
          {
            lead: "Solar-ready prep",
            text: "planning panels in the next few years? We pre-flash key locations while the roof is open.",
          },
        ],
      },
      {
        heading: "What the process looks like",
        ordered: true,
        kind: "steps",
        bullets: [
          { text: "Free inspection plus written estimate — the same day you call." },
          { text: "Material selection and color sample drop-off." },
          {
            html: 'HOA / architectural-review submittal — we prepare and file the paperwork where your community requires it. (In The Woodlands, Township approval is mandatory for every re-roof — <a href="/the-woodlands/roof-replacement">our Woodlands replacement guide</a> covers that process.)',
          },
          { text: "Install day — usually one day, two for larger homes. Project manager on-site." },
          {
            text: "Final walk-through, magnet sweep of driveway and yard, documentation packet delivered.",
          },
        ],
      },
      {
        heading: "Permits and approvals, by jurisdiction",
        body: "Permit rules here are patchwork, and we handle whichever applies: unincorporated Montgomery County requires no county permit for a residential re-roof (the county's own FAQ says so) — covenant approval is what governs communities like The Woodlands. Incorporated cities differ: Shenandoah runs a full roofing-permit program with wind-load, nailing, and color rules; the City of Houston requires re-roof permits. Wherever your home sits, the paperwork is our job, not yours.",
      },
      {
        heading: "What a replacement costs",
        body: "Your price depends on size, pitch, material, decking condition, and roof complexity — which is why we measure, then put an exact figure in writing before leaving. For market orientation, attributed data: Angi (2026) reports a $9,602 national average with most projects between $5,900 and $46,000 ($4–$11 per square foot); Modernize (2026) lists architectural shingle at roughly $4.11–$5.57 per square foot installed; This Old House (2026) reports about $15,439 for an average 2,000-square-foot asphalt roof. Metal runs roughly two to three times asphalt (Metal Roofing Alliance). Those are market numbers — your written estimate is the real one.",
      },
    ],
    faqs: [
      {
        q: "How long does a roof replacement take?",
        a: "Most single-family replacements are completed in one day. Larger or steep-slope homes can take two. Your project manager confirms the schedule before work starts.",
      },
      {
        q: "How much does a new roof cost?",
        a: "It's a measured, per-home number — we put yours in writing before we leave the driveway. As market context: Angi (2026) reports a national average of $9,602 with most projects $5,900–$46,000; Modernize (2026) puts architectural shingle at about $4.11–$5.57 per square foot installed.",
      },
      {
        q: "Can you install new shingles over my old ones?",
        a: "We don't do overlays. The code (IRC R908.3) requires tear-off in most cases and prohibits roofing over soaked decks or two existing layers — and in this climate a second layer traps heat that shortens the new roof's life. Tear-off also lets us actually inspect and fix the deck.",
      },
      {
        q: "What warranty comes with a new roof?",
        a: "Every IKO install registers a Limited Lifetime product warranty, the 15-year non-prorated Iron Clad Protection period, a 130-mph limited high-wind warranty, and a 10-year algae-resistance warranty — coverage any installer can legitimately register. IKO's longer, extended Iron Clad coverage is only available through higher ROOFPRO membership tiers, which we're in the process of earning as an IKO ROOFPRO applicant — we'll never sell coverage we can't register, and your estimate states your exact warranty in writing.",
      },
      {
        q: "Do you handle the HOA approval?",
        a: "Yes. Where your community has an architectural review committee, we prepare and submit the shingle and color approval paperwork as part of the job — including The Woodlands Township's mandatory RDRC process.",
      },
      {
        q: "Do I need a permit to replace my roof?",
        a: "Depends on jurisdiction: unincorporated Montgomery County requires no county permit for residential re-roofs, while cities like Shenandoah and Houston run permit programs. Whichever applies to your address, we handle it.",
      },
      {
        q: "What happens if you find rotten decking?",
        a: "It gets replaced — the code prohibits roofing over a deteriorated deck, and we wouldn't anyway. Replacement sheets are priced transparently in the estimate and photographed in your documentation packet.",
      },
      {
        q: "Are impact-resistant shingles worth the upgrade?",
        a: "In a county with nearly annual damaging hail on the NOAA record, often yes: UL 2218 Class 4 is the highest impact rating, and TDI notes Class 4 roofs receive the highest premium credit where insurers offer discounts — each company sets its own amount, so ask your carrier what they'd credit. We quote it side by side with standard product.",
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
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-07.webp",
      alt: "Roofer hand-nailing shingles during installation — close-up detail",
    },
    // Each chip restates a fact already on this page (scheduling: summary +
    // FAQ; repair range: Angi 2026 in body + FAQ; written diagnosis: summary).
    glance: [
      { value: "Same-day", label: "or next-day for most repairs" },
      { value: "$400–$2,000", label: "typical repair range nationally (Angi, 2026)" },
      { value: "In writing", label: "diagnosis and price before any work starts" },
    ],
    sections: [
      {
        heading: "The repairs we see most",
        kind: "cards",
        bullets: [
          {
            lead: "Pipe boot failures",
            html: 'the neoprene collar around plumbing vents degrades in UV and commonly cracks within roughly 10–15 years — one of the most common causes of roof leaks, and the usual culprit behind a mystery ceiling stain. <a href="/blog/why-roofs-leak-around-pipe-boots">Here\'s why they fail</a>.',
          },
          {
            lead: "Ridge-cap lift and wind-creased shingles",
            text: "common after high-wind events — IBHS research shows the sealant bond between shingles is what fails in wind, and it weakens as roofs age. If only a few caps lifted, a targeted repair is honest. If creasing is widespread, we'll tell you.",
          },
          {
            lead: "Flashing at wall step-ins and chimneys",
            text: "the code's entire purpose for flashing is keeping water out of roof joints (IRC R903.2). Water takes the path of least resistance, and aged step flashing is often it.",
          },
          {
            lead: "Valley problems",
            text: "debris-packed valleys hold moisture against shingles and channel water under edges — especially under this area's pine canopy, where valleys load up fast.",
          },
          {
            lead: "Nail pops",
            text: "nails backing out push through the shingle above; every one is a potential leak, and each is minutes to fix once found.",
          },
          {
            lead: "Granule loss and blistering",
            text: "granules are the shingle's UV armor — IBHS research shows exposed asphalt embrittles and ages faster. Heavy loss usually signals a roof near end-of-life; we'll show you photos and let you decide.",
          },
        ],
      },
      {
        heading: "Emergency repairs and storm triage",
        body: "Active leaks jump the queue. When storms move through — and the National Weather Service counts 50–60 thunderstorm days a year in southeast Texas — we run triage: emergency tarping first to stop the water, then a documented assessment of whether you're looking at a repair, a replacement, or an insurance claim. If a storm just hit, start with our storm-response page; if the damage looks claim-worthy, our storm damage and insurance claims guides walk the Texas rules.",
      },
      {
        heading: 'When we say "just repair it"',
        body: "We're happy to repair. We won't upsell a replacement when a sound repair will give you several more good years. The forty-photo packet we leave shows the rest of the roof too, so you know what to watch. For market context, Angi (2026) puts typical roof repairs at $400–$2,000 — and our diagnosis and price come in writing before any work starts.",
      },
      {
        heading: 'When we say "it\'s time to replace"',
        body: "If the roof is in its replacement window (InterNACHI puts 3-tab shingles around 20 years and architectural around 30 — less in hot climates like ours), or any age after a storm with structural damage, a patch is throwing money at a lost cause. We'll show you why, in photos, and quote both paths if it's genuinely close.",
      },
    ],
    faqs: [
      {
        q: "Can you repair my roof the same day?",
        a: "Most repairs are scheduled same-day or next-day depending on weather and the parts required. Active leaks get priority, with emergency tarping when needed.",
      },
      {
        q: "How much do roof repairs cost?",
        a: "Most common repairs — boots, flashing details, a handful of shingles — are modest jobs; Angi (2026) puts typical roof repairs at $400–$2,000 nationally. You get a written diagnosis and exact price before we start.",
      },
      {
        q: "Will you push me toward a full replacement?",
        a: "No. If a repair is the right call, we repair it and document the rest of the roof so you can plan ahead. We only recommend replacement when a patch genuinely won't hold.",
      },
      {
        q: "My ceiling is stained but I can't find a leak. Can you?",
        a: "That's the classic pipe-boot or flashing signature — small failures that drip along rafters before showing up feet away from the source. Our inspection traces it and documents the fix with photos.",
      },
      {
        q: "Can insurance cover a repair?",
        a: "If a covered peril (wind, hail, falling limbs) caused the damage, potentially — but for small repairs, filing may not make sense against your deductible. We document honestly and tell you which side of that line you're on before you decide.",
      },
    ],
    dataCompleteness: "complete",
  },

  inspection: {
    slug: "roof-inspection",
    title: "Free roof inspection",
    serviceTag: "inspection",
    seoTitle: "Free same-day roof inspection — Montgomery County",
    seoDescription:
      "Free roof inspection with a forty-photo documentation packet and written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    summary:
      "Forty-photo packet. Written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-01.webp",
      alt: "Northvale Roofing inspector walking a steep two-story roof",
    },
    // Each chip restates a fact already on this page (free + no obligation:
    // summary + "Why free?"; forty photos: packet section; 24 hours: summary).
    glance: [
      { value: "Free", label: "the inspection and written findings — no obligation" },
      { value: "40 photos", label: "the documentation packet you keep either way" },
      { value: "24 hours", label: "written findings after the inspection" },
    ],
    sections: [
      {
        heading: "What's in the forty-photo packet",
        bullets: [
          { text: "Every slope — north, south, east, west — at roof level." },
          {
            text: "Every valley, ridge, and penetration (pipe boots, vents, skylights, chimneys).",
          },
          {
            text: "Close-ups of any concerning finding: granule loss, hail bruising, wind creasing, lifted seals, nail pops, flashing gaps.",
          },
          {
            text: "Attic photos where accessible — decking stains, insulation moisture, and whether ventilation is anywhere near the 1-in-300 guideline (an under-vented attic can hit 140°F on a 90°F day per ARMA).",
          },
          { text: "A plain-English written summary of condition plus estimated remaining life." },
        ],
      },
      {
        heading: "What the findings actually mean",
        body: "An inspection is only useful if it turns photos into decisions:",
        kind: "cards",
        bullets: [
          {
            lead: "Granule loss",
            text: "the shingle's UV armor wearing off — IBHS research shows exposed asphalt embrittles faster. Light loss is aging; heavy or patterned loss is a countdown.",
          },
          {
            lead: "Hail evidence",
            text: "bruised mats and crushed granules on the roof, dents on gutters and A/C fins at ground level. IBHS testing shows even repeated small hail quietly ages shingles — which is why post-storm checks matter even without visible carnage.",
          },
          {
            lead: "Wind evidence",
            text: "creased tabs and broken sealant bonds — the failure IBHS identifies as wind's actual mechanism. Often invisible from the ground.",
          },
          {
            lead: "Component wear",
            text: "cracked pipe boots (commonly within 10–15 years), rusted or lifted flashing, nail pops — the cheap-to-fix-now list.",
          },
        ],
      },
      {
        heading: "Who this is for",
        kind: "cards",
        bullets: [
          {
            lead: "Homeowners",
            text: "curious about roof age, planning ahead, or checking after a storm.",
          },
          {
            lead: "Sellers and their agents",
            text: "a documented healthy roof removes a negotiation lever before listing; if there's an issue, you control the fix instead of the buyer's inspector controlling the narrative.",
          },
          {
            lead: "Buyers",
            text: "turn 'roof looks old' into specifics with a remaining-life estimate — fast turnaround for option periods.",
          },
          {
            lead: "Insurance claimants",
            text: "know whether damage justifies a claim before you file. A denied claim is worse than no claim.",
          },
          {
            lead: "Annual-checkup owners",
            text: "especially on heavily-treed lots, where debris and shade age roofs faster than the calendar.",
          },
        ],
      },
      {
        heading: "What we don't do on an inspection call",
        bullets: [
          {
            text: "We don't give a verbal quote and leave. The findings and any estimate are written.",
          },
          {
            text: "We don't pressure a contract. If you need a repair or replacement, we'll follow up — you can ignore us forever.",
          },
          { text: "We don't knock doors. This call happens because you booked it." },
        ],
      },
      {
        heading: "Why free?",
        body: "Market data (Angi, 2026) puts paid roof inspections at a $250 national average — $75–$200 for physical inspections, $150–$600 for drone work — and notes many contractors offer them free. Ours is free because documented honesty is how we earn the work that matters: you keep the full packet and findings whether or not you ever hire us.",
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
      {
        q: "What happens if you find problems?",
        a: "You get photos, a plain-English explanation, and a written price for the fix — repair or replacement, honestly recommended. What you do with it is entirely up to you; we don't do pressure.",
      },
      {
        q: "Should I get an inspection before selling my home?",
        a: "It's one of the highest-leverage moves a seller can make: a documented roof condition either removes a buyer negotiation lever or lets you fix an issue on your terms. Agents get fast turnaround for listings and option periods.",
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
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-03.webp",
      alt: "Home and landscaping protected with tarps during a Northvale Roofing re-roof",
    },
    // Each chip restates a fact already on this page (NWS storm-day count:
    // first section; same-day tarping: FAQ; forty-photo packet: claim section).
    glance: [
      { value: "50–60", label: "thunderstorm days a year in southeast Texas (NWS)" },
      { value: "Same-day", label: "tarping priority for active leaks, conditions allowing" },
      { value: "40+", label: "photos in the claim-ready packet" },
    ],
    sections: [
      {
        heading: "The storms this region actually gets",
        body: "The risk here isn't hypothetical — it's federal record. NWS counts 50–60 thunderstorm days a year in southeast Texas, about a third severe, with downbursts of 60 to 100+ mph. NOAA's Storm Events Database logs damaging hail in Montgomery County nearly every year. Hurricane Beryl (2024) pushed a measured 69-mph gust to Conroe, well inland; the May 2024 derecho crossed the metro with winds estimated near 100 mph in places; Harvey dropped over 25 inches of rain on The Woodlands. Roofs here are systems designed against a certainty, not a maybe.",
      },
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
          {
            text: "And the quiet damage: IBHS testing shows repeated sub-severe hail plus normal weathering makes shingles behave like decade-older material — storm-weakened without one dramatic event. A documented inspection settles it.",
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
          {
            html: 'And the clock works for you: Texas prompt-payment law (Ins. Code Ch. 542) requires your insurer to acknowledge a claim within 15 days, decide within 15 business days of having what it needs, and pay within 5 business days of accepting. Details in <a href="/services/insurance-claims">our insurance claims guide</a>.',
          },
        ],
      },
      {
        heading: "Things we won't touch",
        bullets: [
          {
            text: 'Deductible games. Texas law (Ins. Code §707.002; Bus. & Com. Code §27.02) requires you to pay your deductible and makes it an offense for a contractor to pay, waive, or absorb it — TDI warns of fines and jail. Anyone offering to "eat it" is proposing fraud with your name attached.',
          },
          {
            text: "Pressure signings at the door. It's against the law for out-of-town contractors to demand a down payment before starting work after a disaster. TDI's storm guidance adds: get multiple bids, and never sign a contract that assigns work \"for the value of insurance proceeds.\" We leave written estimates and let you decide on your schedule.",
          },
          {
            text: "Acting as your public adjuster. Texas Insurance Code §4102.163 prohibits a roofing contractor from adjusting the same property's claim. We're the contractor: we document and build; you (or a licensed PA you hire separately) negotiate.",
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
      {
        q: "How fast can you tarp an active leak?",
        a: "Active leaks get priority — same-day whenever conditions allow. Tarping stabilizes the home first; assessment and repair-or-claim decisions come after the water stops.",
      },
      {
        q: "A roofer knocked on my door after the storm. Red flags?",
        a: "TDI's checklist: demands for down payments before work (illegal for out-of-town contractors after a disaster), offers to cover your deductible (illegal, full stop), and contracts assigning work 'for the value of insurance proceeds.' A legitimate roofer leaves a written estimate and gives you room to decide.",
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
    // Visual system (presentation only — every word above/below unchanged).
    // Photo is the real reopened-claim job from Projects (published record).
    heroPhoto: {
      src: "/projects/iko-roof-replacement-the-woodlands-tx.jpg",
      alt: "Aerial view of a completed IKO shingle roof replaced by Northvale Roofing on a Woodlands, TX home",
    },
    // Each chip restates the Ch. 542 deadlines already detailed on this page.
    glance: [
      {
        value: "15 days",
        label: "for your insurer to acknowledge the claim (Tex. Ins. Code Ch. 542)",
      },
      { value: "15 biz days", label: "to accept or reject once it has what it requested" },
      { value: "5 biz days", label: "to pay after accepting" },
    ],
    sections: [
      {
        heading: "How roof claims actually pay in Texas",
        body: "Before filing, know your policy type — it changes everything. Per the Texas Department of Insurance: replacement-cost policies pay to rebuild at current prices, while actual-cash-value policies deduct depreciation — TDI's own example shows a $10,000 roof paying $8,500 at 5 years old, $7,000 at 10, and just $4,000 at 20, before your deductible. Replacement-cost claims typically pay in two parts: a first check at depreciated value, then the recoverable depreciation after you show proof repairs were completed. And your insurer can require proof you paid your deductible before releasing that final amount — one more reason the deductible law matters.",
      },
      {
        heading: "What our claim support looks like",
        ordered: true,
        kind: "steps",
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
            lead: "Scope completeness",
            text: "if the initial scope misses code-required items — decking the code won't let us roof over, drip edge, proper flashing — we document them for the carrier's review. Getting the scope complete and correct is normal practice.",
          },
          {
            lead: "Install and close",
            text: "once the insurance scope is agreed, we install and deliver the final documentation packet for your file — the proof-of-repairs that releases recoverable depreciation.",
          },
        ],
      },
      {
        heading: "The deadlines your insurer must hit",
        body: "Texas prompt-payment law (Insurance Code Chapter 542) puts real clocks on your claim: acknowledgment and investigation started within 15 days of notice (§542.055); a written accept-or-reject within 15 business days of receiving everything requested, extendable once to 45 days with written reasons (§542.056); payment within 5 business days of acceptance (§542.057). Delay past 60 days triggers statutory interest plus attorney's fees (§542.058, §542.060), and declared weather catastrophes extend deadlines by 15 days (§542.059). TDI also advises filing promptly — some policies carry one-year claim deadlines, so check your contract — and talking to your company before cashing settlement checks, since some carriers treat a signed check as final settlement.",
      },
      {
        heading: "What we won't do",
        bullets: [
          {
            text: "We are not a public adjuster, and legally can't be on our own jobs — Texas Insurance Code §4102.163 prohibits a roofing contractor from acting as public adjuster on the same property. We're your contractor.",
          },
          {
            text: "We will not negotiate your claim's value. We document; you (or a licensed PA you hire separately) negotiate.",
          },
          {
            text: "We will not waive or absorb your deductible. Texas law (Ins. Code §707.002; Bus. & Com. Code §27.02) requires you to pay it and makes contractor deductible games a crime — with your insurer entitled to demand proof of payment.",
          },
        ],
      },
      {
        heading: "Carrier claim processes we know",
        // NEEDS DATA: confirm with owner which carriers he has actually worked
        // claims with, then name those (4-5 max) — see TASKS_FOR_ERIC.md.
        body: "We build every scope of loss in Xactimate — the same estimating platform the major Texas carriers use — with photo documentation keyed to the line items an adjuster has to approve. Whoever your carrier is, your claim file arrives in the format their desk reviewer expects.",
      },
    ],
    faqs: [
      {
        q: "Are you a public adjuster?",
        a: "No. We're your roofing contractor. A public adjuster is a separately-licensed role, and Texas Insurance Code §4102.163 prohibits a roofer from adjusting a claim on the same property. We document the damage; a licensed PA you hire separately negotiates the claim.",
      },
      {
        q: "Can you waive my deductible?",
        a: "No. Texas Insurance Code §707.002 requires policyholders to pay their deductible, and Business & Commerce Code §27.02 makes waiving or absorbing it an offense — TDI warns of fines up to $2,000 and jail time. Insurers can also require proof of payment before releasing recoverable depreciation.",
      },
      {
        q: "Why did my insurance check come in two parts?",
        a: "That's normal for replacement-cost policies: the first check is the depreciated (actual cash) value, and the recoverable depreciation follows once you show proof the repairs were completed. Our final documentation packet is built to be exactly that proof.",
      },
      {
        q: "How long can my insurer take to decide my claim?",
        a: "Texas prompt-payment law: acknowledge within 15 days of notice, accept or reject within 15 business days of receiving everything requested (one 45-day extension with written reasons), pay within 5 business days of accepting — with 15-day extensions in declared catastrophes and statutory penalties past 60 days.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const SERVICE_TAGS = Object.keys(SERVICES) as ServiceTag[];
export const SERVICE_LIST = Object.values(SERVICES);
