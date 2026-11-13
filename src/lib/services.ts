import type { DataCompleteness } from "./quality-gate";

export type ServiceTag =
  | "replacement"
  | "repair"
  | "inspection"
  | "storm"
  | "insurance"
  | "metal"
  | "tile"
  | "flat";

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
  /**
   * Trusted authored markup for the section body, used instead of `body` when
   * the paragraph needs an internal link. Only `body` existed before, so a
   * section could not link anywhere — which left the material pages with no
   * outbound links at all (audit, 2026-11-13).
   */
  html?: string;
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
    seoTitle: "Roof Replacement — NW Houston, TX",
    seoDescription:
      "Full roof replacement across NW Houston: tear-off to deck, synthetic underlayment, wind-rated architectural shingles, and a written price before we leave.",
    summary:
      "Tear-off to deck, a rebuilt roof system — decking to ridge vent — and the exact price in writing before we leave the driveway. Architectural shingle standard; Class-4 impact and metal options quoted side by side.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/completed-roof-red-brick-home-houston.webp",
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
        "A real Northvale replacement in The Woodlands — the same roof stripped to bare decking and completed, photographed from the same spot in the driveway.",
      beforeSrc: "/work/roof-tear-off-to-deck-the-woodlands-tx.webp",
      beforeAlt:
        "Red-brick home in The Woodlands, TX stripped to bare roof decking during tear-off, seen from the driveway",
      beforeCaption: "Tear-off to deck",
      afterSrc: "/work/completed-roof-replacement-the-woodlands-tx.webp",
      afterAlt:
        "The same home in The Woodlands, TX with its roof replacement completed, seen from the same spot",
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
            html: "<strong>Class 3 vs. Class 4 & insurance</strong> — Class 4 (Nordic) is the highest UL 2218 impact rating, but it's a lab classification, not a hail guarantee, and hail isn't covered by the shingle warranty. Its value is qualifying you for an insurance premium discount where your carrier offers one. See <a href=\"/blog/class-4-impact-resistant-shingles-texas/\">our Class-4 breakdown</a>.",
          },
          {
            lead: "Standing-seam metal",
            html: '30–50+ year service life per the Metal Roofing Alliance, concealed fasteners, 140-mph wind rating — at roughly two to three times the cost of asphalt. <a href="/services/metal-roofing">More on metal systems</a>. Not sure how big your roof is? <a href="/roof-size-calculator">Measure it free</a>.',
          },
        ],
      },
      {
        heading: "The system under the shingles",
        body: "Shingles are the visible 20% of a roof. Replacements fail or last on the other 80%:",
        kind: "cards",
        photo: {
          src: "/work/underlayment-and-starter-course-houston.webp",
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
    seoTitle: "Same-Day Roof Repair — NW Houston",
    seoDescription:
      "Leaks, lifted shingles, failed flashing, bad pipe boots. Same-day or next-day roof repair across The Woodlands, Spring, Tomball, Magnolia, Conroe, and Cypress.",
    summary:
      "Leaks, lifted shingles, failed flashing, bad pipe boots. Usually same-day or next-day. Written diagnosis before any cash changes hands.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/hand-nailing-shingles-houston.webp",
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
            html: 'the neoprene collar around plumbing vents degrades in UV and commonly cracks within roughly 10–15 years — one of the most common causes of roof leaks, and the usual culprit behind a mystery ceiling stain. <a href="/blog/why-roofs-leak-around-pipe-boots/">Here\'s why they fail</a>.',
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
          {
            lead: "The flat section nobody checked",
            html: 'plenty of shingled houses have a low-slope piece — an addition, a patio cover, the roof over a bay — and it is a different system with different failure points. It is frequently the real source of a leak that has been blamed on the shingles for years. See <a href="/services/flat-roofing">flat and low-slope roofing</a>.',
          },
        ],
      },
      {
        heading: "Emergency repairs and storm triage",
        html: 'Active leaks jump the queue. When storms move through — and the National Weather Service counts 50–60 thunderstorm days a year in southeast Texas — we run triage: emergency tarping first to stop the water, then a documented assessment of whether you are looking at a repair, a replacement, or an insurance claim. If a storm just hit, start with <a href="/storm-response">storm response</a>. For local detail, we have city pages for <a href="/the-woodlands/storm-damage">The Woodlands</a> and <a href="/conroe/storm-damage">Conroe</a> — the Conroe one matters because a re-roof inside those city limits is permitted work, which the rest of the county is not.',
      },
      {
        heading: 'When we say "just repair it"',
        html: 'We are happy to repair. We will not upsell a replacement when a sound repair will give you several more good years. <a href="/blog/repair-or-replace-your-roof/">The four questions that decide it</a> are written up separately. The forty-photo packet we leave shows the rest of the roof too, so you know what to watch. For market context, Angi (2026) puts typical roof repairs at $400-$2,000 — and our diagnosis and price come in writing before any work starts.',
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
    seoTitle: "Free Roof Inspection, Montgomery County",
    seoDescription:
      "Free roof inspection with a forty-photo documentation packet and written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    summary:
      "Forty-photo packet. Written findings within 24 hours. No obligation, no pressure, no door-knocking.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/roof-inspection-steep-two-story-houston.webp",
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
    seoTitle: "Storm Damage Roof Repair — Houston",
    seoDescription:
      "Hail, wind, and tree-impact roof damage documented with a forty-photo packet built for your insurance claim. Houston-area same-day response.",
    summary:
      "Hail, wind, fallen-limb impact. We document everything your adjuster will ask for, and then some.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/landscaping-tarped-during-re-roof-houston.webp",
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
      src: "/projects/iko-hail-claim-roof-replacement-the-woodlands-tx.webp",
      alt: "Aerial view of a completed IKO architectural shingle roof replacement on a large hip-and-valley home in The Woodlands, TX, after an approved hail claim",
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
        q: "My claim was denied. Is that final?",
        a: "Often not. A denial over how MUCH damage there is can go to appraisal — Texas Senate Bill 458 requires residential policies issued or renewed on or after 1 January 2026 to include an appraisal provision. A denial over whether it is covered at all is a different fight. We have reopened claims both ways; the full walkthrough is on our blog under 'Your roof claim was denied'.",
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

  /**
   * MATERIAL PAGES (metal / tile / flat), added 2026-11-13.
   *
   * The site described an asphalt-only company. The owner confirmed Northvale
   * installs and services all three of these, and Search Console shows the
   * demand with nothing to answer it: "metal roofing the woodlands" at position
   * 19-26, "clay tile roof replacement the woodlands" at 14, "flat roofing the
   * woodlands" at 32 — all ranking off incidental mentions.
   *
   * These are METRO-WIDE pages by design. Per docs/keyword-map.md rule 1, the
   * city-qualified versions of these queries belong to /<city>/* pages, so
   * nothing here is titled "The Woodlands".
   *
   * DELIBERATELY NO heroPhoto. Every work photo Northvale has is an asphalt
   * job; putting one on a metal or tile page would imply work that photo does
   * not show (Hard Rule #2). These pages run the classic header until real
   * photos of each exist.
   *
   * Capability claims here rest on the owner's confirmation (2026-11-13);
   * technical claims are sourced in docs/research-facts.md Sheet 11. No
   * Northvale-specific warranty, brand, crew or volume claim appears on any of
   * them, because none has been supplied.
   */
  metal: {
    slug: "metal-roofing",
    title: "Metal roofing",
    serviceTag: "metal",
    seoTitle: "Metal Roofing — NW Houston",
    seoDescription:
      "Standing seam, exposed-fastener panel and metal shingle across NW Houston — plus the hail-dent insurance trap specific to metal roofs in Texas.",
    summary:
      "Standing seam, exposed-fastener panel, and metal shingle. Installed, repaired, and documented — including the one insurance question every Texas metal roof owner should ask before a storm.",
    glance: [
      { value: "3 systems", label: "standing seam, exposed fastener, metal shingle" },
      { value: "HO-145", label: "the cosmetic-damage endorsement to check on your policy" },
      { value: "In writing", label: "scope and price before any work starts" },
    ],
    sections: [
      {
        heading: "The three systems, and where each one belongs",
        kind: "cards",
        bullets: [
          {
            lead: "Standing seam",
            text: "panels joined by raised vertical seams, with the fasteners hidden underneath. Nothing penetrates the weather surface, which is why it is the system specified when the roof has to last and look deliberate. It is the most expensive of the three and the least forgiving of a sloppy install — the seams and clips have to allow the panel to move as it heats.",
          },
          {
            lead: "Exposed-fastener panel (R-panel, 5V)",
            text: "screwed through the face of the panel with a rubber-washered fastener. Far cheaper and faster, and genuinely the right answer on a shop, barn or detached garage. The washers are the maintenance item: they sit in full sun and they are what you will eventually be re-tightening or replacing, not the panel.",
          },
          {
            lead: "Metal shingle and stone-coated steel",
            text: "pressed panels that read as shake or tile from the street while weighing a fraction of either. The usual reason to choose it is a covenant or design-review committee that will not approve a standing-seam profile.",
          },
        ],
      },
      {
        heading: "The hail question nobody tells metal roof owners about",
        html: 'Hail does something different to metal than it does to asphalt. Asphalt fractures and sheds granules — visible, measurable damage. Metal usually dents. The roof keeps water out perfectly well, and it looks hailed-on. That gap is where Texas metal roof claims get fought. The Texas Department of Insurance adopted an optional cosmetic-damage endorsement decades ago — HO-145 on homeowners forms, TDP-022 on dwelling forms — and carriers have since filed their own variations. Where one applies, damage that is cosmetic rather than a breach of the roof can be excluded, usually in exchange for a premium credit. It is worth knowing which side of that line your policy sits on BEFORE a storm, not after. Our <a href="/services/insurance-claims">insurance claim support</a> page covers the Texas rules that apply once a claim is open, and <a href="/services/storm-damage">storm damage</a> covers what to do in the first 48 hours.',
      },
      {
        heading: "What we do about it",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "Read your declarations page with you and find whether a cosmetic-damage endorsement is attached. It will be named on the schedule of endorsements, not buried in the body.",
          },
          {
            text: "Document a baseline. Our forty-photo packet on a metal roof is worth more than on asphalt, because it establishes what the panels looked like before the storm.",
          },
          {
            text: "After a storm, photograph denting against a straightedge and in raking light, where dents actually read. Flat midday photos hide them.",
          },
          {
            text: "Tell you honestly whether what we are looking at is cosmetic, a breach, or a fastener problem — and whether filing is worth your deductible.",
          },
        ],
      },
      {
        heading: "IKO Metals DECRA Spanish Tile — the line we carry",
        html: "IKO launched <strong>IKO Metals</strong> in September 2026, bringing DECRA stone-coated steel into its North American range — which matters here because we already standardize on IKO. Spanish Tile is the barrel profile: the shape of an old-world clay tile pressed into stone-coated steel, fastened direct to deck. Per IKO's own product flyer it carries a Lifetime Limited Warranty, wind warranty coverage up to 120 mph, and a nominal installed weight of 1.6 lbs per square foot — against the weight of real clay, which is the usual reason a tile roof can't simply be replaced like for like. IKO also states the product meets Texas Department of Insurance requirements. Eight colors; see it in the <a href=\"/roof-design-center\">Roof Design Center</a>.",
      },
      {
        heading: "Why a Class 4 rating is worth asking your insurer about",
        html: "Spanish Tile is rated <strong>UL 2218 Class 4</strong> for impact and <strong>ASTM E108 Class A</strong> for fire, with UL 580 Class 90 wind uplift. The Class 4 part connects directly to the endorsement question above: the Texas Department of Insurance's cosmetic-damage endorsement is offered in exchange for a premium credit on an impact-resistant roof, and Class 4 is the rating that credit is generally written against. Worth being precise about what that rating is, though — IKO says it plainly in the flyer, and so will we: <em>the impact rating is solely for potential insurance premium reductions and is not a performance guarantee</em>. It is a laboratory classification, not a promise that hail will not dent your roof. Whether a credit is actually available is between you and your carrier; we will give you the documentation to ask.",
      },
      {
        heading: "What metal costs, honestly",
        html: 'Metal costs more than asphalt — meaningfully more for standing seam, modestly more for exposed-fastener panel. Published market figures vary too widely by panel, gauge and roof complexity for any national average to mean much on your specific house, so we do not quote one. What we will do is measure your roof and put both paths in writing side by side, asphalt and metal, so you are comparing real numbers on your own roof instead of ranges from an article. If asphalt turns out to be the right answer, that is a <a href="/services/roof-replacement">roof replacement</a> like any other.',
      },
    ],
    faqs: [
      {
        q: "Is a metal roof worth it in the Houston heat?",
        a: "Metal reflects more solar energy than dark asphalt, and the attic underneath usually runs cooler — but how much cooler depends on the color, the coating and, more than anything, your attic ventilation and insulation. Anyone who quotes you a specific percentage off your power bill without looking in your attic is guessing.",
      },
      {
        q: "Will hail wreck a metal roof?",
        a: "Usually it dents it rather than breaches it. The roof keeps working. The problem is an insurance one, not a weather one — see the cosmetic-damage endorsement above, which can exclude exactly that kind of damage.",
      },
      {
        q: "Is a metal roof loud in the rain?",
        a: "Far less than people expect. The noise everyone remembers is metal over open purlins on a barn. Over solid decking with underlayment and an insulated attic beneath, the difference from asphalt is small.",
      },
      {
        q: "Can you put metal over my existing shingles?",
        a: "Sometimes it is physically possible, and we will usually still recommend a tear-off. Going over the top hides the decking, and the decking is the thing you most want eyes on — it is where rot and prior leaks show up.",
      },
      {
        q: "Will my HOA or design-review committee approve metal?",
        a: "It depends on the covenant and the profile. Standing seam is the one most often restricted; metal shingle and stone-coated steel clear review more easily because they read as a conventional roof from the street. In The Woodlands this runs through the RDRC — we have written up that process separately.",
      },
    ],
    dataCompleteness: "complete",
  },

  tile: {
    slug: "tile-roofing",
    title: "Tile roofing",
    serviceTag: "tile",
    seoTitle: "Tile Roof Repair & Underlayment",
    seoDescription:
      "Your tile is probably fine — the felt underneath it isn't. Underlayment replacement, broken and discontinued tile matching, honest tile repair near Houston.",
    summary:
      "Most leaking tile roofs do not need new tile. They need the underlayment replaced underneath the tile that is already there — and that is a very different job, and a very different price.",
    glance: [
      { value: "40–50 yr", label: "typical clay or concrete tile service life" },
      { value: "20–25 yr", label: "typical felt underlayment life — the mismatch that leaks" },
      { value: "Relay", label: "your existing tile goes back on, not into a dumpster" },
    ],
    sections: [
      {
        heading: "Your tile is almost certainly fine. The felt under it isn't.",
        html: 'This is the single most useful thing to understand about a tile roof, and it is the reason tile quotes vary so wildly. The tile is not the waterproofing. The tile is a rain screen and a wear surface — it breaks up the water and takes the sun. The actual waterproof layer is the underlayment underneath it. Clay and concrete tile routinely last four to five decades and often far longer; the felt beneath it does not, and in this climate it goes sooner, because heat is what ages it. So a tile roof that starts leaking at twenty-odd years old is usually not a tile problem at all. Anybody who looks at a leaking tile roof and immediately quotes you a full tile replacement is either not looking properly or is selling you the expensive version of a cheaper job. Finding out which you have starts with a <a href="/services/roof-inspection">free roof inspection</a>.',
      },
      {
        heading: "Lift and relay — what the job actually is",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "The tile comes off in sections and is stacked on the roof, not thrown in a dumpster. Sound tile is reused; we count breakage as we go and tell you the number.",
          },
          {
            text: "The old underlayment comes off down to the deck, and the deck gets inspected properly — this is the one time in forty years anyone will see it.",
          },
          {
            text: "Any rotted or delaminated decking is replaced. Tile hides deck damage for years, so there is usually some.",
          },
          {
            text: "New underlayment goes down, along with the flashings, valley metal and penetration details, which is where tile roofs leak far more often than in the field.",
          },
          { text: "Your tile goes back on, with replacement tile blended in where pieces broke." },
        ],
      },
      {
        heading: "Broken tile, and tile you cannot buy any more",
        html: 'Individual cracked or slipped tiles are a repair, not a project — the common causes are foot traffic from someone servicing an HVAC unit or a satellite dish, and limbs coming down. The complication is matching. Tile profiles and colour blends get discontinued, and a patch in the wrong profile is visible from the street forever. Where a profile is still made we match it. Where it is not, the options are salvage stock, pulling tile from an inconspicuous elevation (a rear slope, under a dormer) to patch the visible one and putting the mismatched tile where nobody looks, or accepting a near-match. We will tell you which of those we are proposing and show you where it lands before we do it. Broken-tile work is scheduled the same way as any other <a href="/services/roof-repair">roof repair</a>.',
      },
      {
        heading: "When a tile roof genuinely does need replacing",
        body: "It happens, and we will say so. Widespread tile breakage rather than a handful of pieces; spalling or delamination across concrete tile that has absorbed water through a failed surface; or a structural problem, since tile is heavy and a frame that was marginal to begin with can sag. In those cases the tile really is the problem. That is a much bigger conversation than an underlayment job, and it deserves photographs and a written explanation rather than a verdict shouted down from a ladder.",
      },
    ],
    faqs: [
      {
        q: "My tile roof is leaking. Do I need a whole new roof?",
        a: "Usually not. On most leaking tile roofs the tile is still serviceable and the underlayment beneath it has aged out — the fix is to lift the tile, replace the underlayment and flashings, and relay the same tile. We will show you photos of what is actually failing before recommending anything.",
      },
      {
        q: "How long does the underlayment under tile last?",
        a: "Far less time than the tile. Tile commonly runs four to five decades or more; conventional felt underlayment is generally considered a twenty-to-twenty-five-year component, and heat shortens that. That mismatch is normal and expected — it is why underlayment replacement is a routine part of owning a tile roof rather than a sign something went wrong.",
      },
      {
        q: "Can you match my tile if some are broken?",
        a: "Often yes. If the profile is still manufactured we match it directly. If it has been discontinued we look for salvage stock, or relocate tile from a hidden elevation to the visible one and put the near-match where it will not be seen. We show you the plan before we commit to it.",
      },
      {
        q: "Will walking on my tile roof break it?",
        a: "Some, if it is done carelessly — which is exactly why so much tile breakage traces back to a cable or HVAC tech rather than to weather. Tile is walked in specific places. We count what breaks during our own work and replace it.",
      },
      {
        q: "Is tile too heavy for my house?",
        a: "If the house was built with tile on it, no — the framing was designed for it. The question only matters when somebody wants to put tile on a house that was built for asphalt, which is a structural question for an engineer, not a roofer.",
      },
    ],
    dataCompleteness: "complete",
  },

  flat: {
    slug: "flat-roofing",
    title: "Flat & low-slope roofing",
    serviceTag: "flat",
    seoTitle: "Flat & Low-Slope Roofing — Houston",
    seoDescription:
      "TPO, PVC and modified bitumen for low-slope residential sections and commercial buildings near Houston. Where flat roofs actually fail: drainage and details.",
    summary:
      "TPO, PVC and modified bitumen — on commercial buildings, and on the flat additions, patio covers and porch roofs that shingle contractors tend to avoid.",
    glance: [
      { value: "TPO · PVC", label: "plus modified bitumen for detail-heavy sections" },
      { value: "Drainage", label: "standing water is what ends a flat roof early" },
      { value: "Any size", label: "commercial buildings and small residential flat sections" },
    ],
    sections: [
      {
        heading: "The membranes, and what separates them",
        kind: "cards",
        bullets: [
          {
            lead: "TPO",
            text: "a single-ply sheet, hot-air welded at the seams, usually white. It is the default on commercial low-slope for good reasons: the welded seam is strong, and a reflective surface on a flat roof in this climate is worth real money in cooling load.",
          },
          {
            lead: "PVC",
            text: "also single-ply and hot-air welded, with better resistance to grease and chemical exposure. It is what belongs over a restaurant kitchen exhaust, where TPO will not have a good time.",
          },
          {
            lead: "Modified bitumen",
            text: "asphalt-based sheet in layers, torch- or self-adhered. More forgiving around complicated detail work and penetrations, and often the right answer on a small residential flat section where a single-ply sheet would be mostly seams anyway.",
          },
        ],
      },
      {
        heading: "Flat roofs do not fail in the field. They fail at the edges.",
        body: "A membrane in the middle of a flat roof is rarely the problem. The failures are at terminations, penetrations and drains: where the membrane turns up a parapet, where it wraps a pipe or a curb, where it meets the scupper. That is where the labour and the judgement go, and it is where a cheap bid gets cheap. When we price a low-slope job, the detail work is the line item worth reading.",
      },
      {
        heading: "Standing water is the thing to fix",
        body: 'A "flat" roof is never actually flat — it is pitched slightly, so water leaves. When it stops leaving you get ponding, and ponding is what turns a roof that had years left into one that does not. It drives UV and freeze-thaw cycling into the same spot, loads the structure, and finds every seam. If we see ponding we will tell you where it is coming from — a clogged or undersized drain, a sagging deck, insulation installed without the taper it needed — because replacing the membrane without fixing the drainage just buys you the same failure again on a newer roof.',
      },
      {
        heading: "The residential flat section nobody wants to touch",
        html: 'Plenty of otherwise conventional houses have a flat piece: an addition, a porch or patio cover, a section behind a parapet, the roof over a bay. They leak more often than the main roof because they are low-slope details built by shingle crews, and they are awkward to price, so a lot of roofers would rather not. We will. It is the same membrane work as a commercial roof on a much smaller scale, and it is frequently the actual source of a leak that has been blamed on the shingles for years. If you have a leak and nobody has found it yet, that is what our <a href="/services/roof-inspection">free inspection</a> and <a href="/services/roof-repair">repair</a> work is for.',
      },
    ],
    faqs: [
      {
        q: "How long does a flat roof last?",
        a: "It depends more on drainage and detail quality than on which membrane you pick. A well-detailed single-ply roof that drains properly will outlive a better membrane that ponds. If someone gives you a lifespan without looking at where your water goes, they are quoting a brochure.",
      },
      {
        q: "Why does my flat roof hold water after it rains?",
        a: "Something has changed the slope or blocked the path out — most often a clogged drain or scupper, a sagging deck, or tapered insulation that was never installed to the right fall. It is worth fixing on its own merits, because ponding shortens the life of whatever membrane is under it.",
      },
      {
        q: "Can you do a small flat section on an otherwise shingled house?",
        a: "Yes, and it is a common call. Flat additions, patio covers and porch roofs are frequently the real source of a leak that has been blamed on the main roof. We handle the low-slope section as its own system and tie it into the shingles properly at the transition.",
      },
      {
        q: "Do you work on commercial buildings?",
        a: "Yes. Same membranes, same detailing discipline, larger scale — and the same written scope and photo documentation we do on residential work.",
      },
      {
        q: "Can a flat roof be repaired, or does it have to be replaced?",
        a: "Single-ply membranes repair well when the problem is local — a puncture, a failed seam, a bad penetration detail. What does not repair well is a membrane that has aged out across the whole roof or one sitting in permanent standing water. We will document which of those you have.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const SERVICE_TAGS = Object.keys(SERVICES) as ServiceTag[];
export const SERVICE_LIST = Object.values(SERVICES);
