import type { DataCompleteness } from "./quality-gate";
import type { ServiceAreaSlug } from "./service-areas";
import type { ServiceTag, ServiceSection, ServiceFaq } from "./services";

/**
 * Service-in-city pages (e.g. /the-woodlands/roof-replacement) — the pages that
 * target the money queries ("roof replacement The Woodlands"). One record per
 * (city, service) pair we can write DISTINCT local content for.
 *
 * HARD RULE: a record here must never be the generic service page with the city
 * name swapped in. Sections must be locally specific — covenants, local permits,
 * local storm history, local housing stock. The quality gate
 * (evaluateCityService) additionally requires local FAQs. Facts must be sourced
 * — see docs/research-facts.md.
 */
export interface CityService {
  citySlug: ServiceAreaSlug;
  serviceTag: ServiceTag;
  /** URL child segment, e.g. "roof-replacement" → /the-woodlands/roof-replacement */
  slug: string;
  /** Unique SEO <title> (brand appended by the layout). */
  seoTitle: string;
  /** Unique meta description, ≤160 chars. */
  seoDescription: string;
  /** H1 for the page. */
  title: string;
  /** Distinct hero subhead. */
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
  /** Quality gate — stays "draft" (noindex, out of sitemap) until real. */
  dataCompleteness: DataCompleteness;
}

/**
 * The Woodlands service pages. Local facts sourced in docs/research-facts.md:
 * Township 2024 Residential Development Standards (Sheet 2), Montgomery County
 * permitting FAQ + Texas statutes (Sheet 4), NWS/NOAA storm history (Sheet 3),
 * manufacturer specs + attributed cost data (Sheet 1).
 */
export const CITY_SERVICES: Record<string, CityService> = {
  "the-woodlands/roof-replacement": {
    citySlug: "the-woodlands",
    serviceTag: "replacement",
    slug: "roof-replacement",
    seoTitle: "Roof Replacement The Woodlands TX — RDRC-Compliant",
    seoDescription:
      "Roof replacement in The Woodlands: Township RDRC approval handled, tear-off to deck, Standards-compliant materials, written price before we leave the driveway.",
    title: "Roof replacement in The Woodlands",
    summary:
      "A Woodlands re-roof is two jobs: the roof itself, and the Township covenant approval that must come first. We do both — tear-off to deck, Standards-compliant materials, and the RDRC paperwork filed before a single shingle is ordered.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-09-after.webp",
      alt: "Drone view of a completed shingle roof replacement by Northvale Roofing",
    },
    // Each chip restates a fact already on this page (install time: FAQ;
    // 45-day clock: Standards/FAQ; written price: summary + costs section).
    glance: [
      { value: "1 day", label: "most installations finish in one" },
      { value: "45 days", label: "the RDRC's maximum clock — we file early" },
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
        heading: "Why replacing a roof works differently in The Woodlands",
        body: "Most of The Woodlands is unincorporated Montgomery County, and the county's own permitting FAQ is explicit: residential properties do not require a county permit for a roof. What governs your re-roof instead is the covenant layer — The Woodlands Township's 2024 Residential Development Standards require prior written approval from your village's Residential Design Review Committee (or designated Township staff) for all roof replacement. Skip that approval and you're exposed to covenant enforcement even though no county inspector will ever knock. The practical order of operations:",
        ordered: true,
        kind: "steps",
        bullets: [
          { text: "Free inspection and written estimate — same day you call." },
          {
            text: "Material and color selection from the Township's accepted list — we bring compliant samples to the driveway.",
          },
          {
            text: "RDRC application through the Township's Civic Access Portal — we prepare and file it, with product samples where required. No property survey is needed for a re-roof.",
          },
          {
            text: "Approval comes back (the Standards give committees a 45-day review window — most jobs clear far sooner, but we never order material before approval).",
          },
          { text: "Install — typically one day, two for larger or complex rooflines." },
          {
            text: "Final walk-through, magnet sweep, and your forty-photo documentation packet.",
          },
        ],
      },
      {
        heading: "What the Township Standards allow on your roof",
        kind: "cards",
        body: "The 2024 Residential Development Standards are specific about roofing: colors must be muted, without color pattern, and harmonize with the natural landscape. Acceptable materials include composition shingles, tile, slate, stone-coated or standing-seam metal, and cement-fiberboard — with all metal roofing required to be free of glossy finish. Within those rules there's more room than most homeowners expect:",
        bullets: [
          {
            lead: "Architectural asphalt shingle",
            text: "the dominant choice village-wide. We install IKO Dynasty in Standards-compliant muted colors as our standard architectural line.",
          },
          {
            lead: "Impact-resistant upgrades",
            text: "IKO Nordic carries UL 2218 Class 4, the highest impact rating, in the same muted palettes — worth pricing given this county's hail history and any insurance discount your carrier offers.",
          },
          {
            lead: "Standing-seam metal",
            text: "accepted by the Standards in non-glossy finishes; the Metal Roofing Alliance puts metal service life at 30–50+ years.",
          },
          {
            lead: "Tile and slate",
            text: "accepted materials, most common on higher-end homes in villages like Carlton Woods and Sterling Ridge.",
          },
        ],
      },
      {
        heading: "Tear-off to the deck — because code and climate both say so",
        body: "We replace roofs by removing everything down to the decking. The residential code (IRC R908.3) requires removing existing layers before new covering goes on, with narrow exceptions — and prohibits a roof-over where the deck is water-soaked or two layers already exist. In this climate the code is just common sense: Gulf Coast heat bakes a second layer from below, and you can't inspect or repair decking you never see. Tear-off is also when we replace what actually fails on Woodlands roofs — flashing, pipe boots, and ventilation sized to the ARMA 1-in-300 guideline, because a poorly-vented attic here can run decades of extra heat stress through your shingles.",
        photo: {
          src: "/work/work-02.webp",
          alt: "Northvale Roofing crew mid tear-off on a single-story home",
          caption:
            "Tear-off on a Northvale re-roof — decking exposed, inspected, and repaired before anything new goes on.",
        },
      },
      {
        heading: "When roofs come due, village by village",
        body: "The Woodlands built out village by village over five decades, so replacement waves arrive village by village too. Grogan's Mill (opened 1974) and Panther Creek (mid-1970s) are on their second or third roofs. Cochran's Crossing (1983) and Indian Springs (1984) cluster in the prime 25-to-40-year replacement band. Alden Bridge (1994) and College Park (designated 1995) are the busiest replacement territory in the community right now — thousands of builder-grade '90s roofs aging out together. Sterling Ridge (1999) is at the front edge of its first wave, and even Creekside Park (2007) is old enough that original components like pipe boots are failing. Our village pages cover each area's housing stock in detail.",
      },
      {
        heading: "What a replacement costs in this market",
        body: "Every roof is priced from its own measurements, pitch, material, and decking condition — which is why our estimate is written, itemized, and delivered before we leave your driveway. For orientation, attributed market data: Angi's 2026 figures put the national average roof replacement at $9,602, with most projects between $5,900 and $46,000 depending on size and material ($4–$11 per square foot); Modernize (2026) lists architectural shingle at roughly $4.11–$5.57 per square foot installed; and This Old House (2026) reports about $15,439 average for a 2,000-square-foot asphalt roof. Larger Woodlands homes with complex rooflines trend above national averages; metal runs roughly two to three times asphalt per the Metal Roofing Alliance. Those are market numbers, not our quote — the only number that matters is the one we put in writing for your specific roof.",
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in The Woodlands?",
        a: "No county permit — Montgomery County's permitting FAQ states residential properties don't require one for a roof (most of The Woodlands is unincorporated). What you DO need is prior written approval from your village's Residential Design Review Committee under the Township's 2024 Residential Development Standards. We prepare and file that application as part of every replacement.",
      },
      {
        q: "How long does Township approval take?",
        a: "The Standards give the committee up to 45 days to act on a completed application (no action within 45 days counts as disapproval, so completeness matters). Staff-approval and pre-approval paths move faster for eligible items. We file early, track the application, and schedule installation once approval is in hand.",
      },
      {
        q: "How much does a roof replacement cost in The Woodlands?",
        a: "It depends on size, pitch, material, and decking condition — so we put your exact price in writing before we leave the driveway. As attributed market context: Angi (2026) reports a $9,602 national average with most projects $5,900–$46,000, and Modernize (2026) lists architectural shingle at about $4.11–$5.57 per square foot installed. Larger Woodlands homes trend above average.",
      },
      {
        q: "What shingle colors will the RDRC approve?",
        a: "The Standards require muted shades without color pattern, harmonizing with the natural landscape. In practice that means weathered wood tones, grays, browns, and soft blacks. We bring physical samples from compliant color ranges and submit them with your application.",
      },
      {
        q: "Can I switch to a metal roof in The Woodlands?",
        a: "Yes — the Standards accept stone-coated and standing-seam metal, provided the finish is non-glossy and the color is muted. The RDRC reviews the specific product; we handle that submittal with manufacturer samples and quote metal alongside asphalt so you can compare real numbers.",
      },
      {
        q: "Do you replace decking when it's rotten?",
        a: "Yes, and the code requires it — a new roof can't go over a water-soaked or deteriorated deck (IRC R908.3). Tear-off is when we inspect every sheet; any replacement decking is documented in your forty-photo packet and priced transparently in the estimate.",
      },
      {
        q: "How long does the installation itself take?",
        a: "Most single-family replacements finish in one day; larger or steep, complex rooflines take two. Your named project manager confirms the schedule in writing before work starts, and the Township approval is already done by then.",
      },
      {
        q: "Is a Class 4 impact-resistant shingle worth it here?",
        a: "Montgomery County logs damaging hail nearly every year in the NOAA storm database, so if you're replacing anyway, pricing a UL 2218 Class 4 product is smart. TDI notes Class 4 coverings receive the highest premium credit where insurers offer roofing discounts — but each company sets its own amount, so ask your carrier what they'd credit before deciding.",
      },
    ],
    dataCompleteness: "complete",
  },

  "the-woodlands/roof-repair": {
    citySlug: "the-woodlands",
    serviceTag: "repair",
    slug: "roof-repair",
    seoTitle: "Roof Repair The Woodlands TX — Same-Day & Next-Day",
    seoDescription:
      "Roof repair in The Woodlands: leaks, pipe boots, flashing, wind damage. Same-day or next-day across all nine villages, with the Township permit rule handled.",
    title: "Roof repair in The Woodlands",
    summary:
      "Leaks, cracked pipe boots, lifted ridge caps, tired flashing — most Woodlands repairs are same-day or next-day, documented with photos, and handled with the Township's repair-permit rule covered.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-07.webp",
      alt: "Roofer hand-nailing shingles during installation — close-up detail",
    },
    // Each chip restates a fact already on this page (scheduling: summary +
    // FAQ; permit rule: covenant section; written advice + photos: FAQ).
    glance: [
      { value: "Same-day", label: "or next-day across all nine villages" },
      {
        value: "Permit filed",
        label: "the Township's roofing-repair rule, handled as part of the job",
      },
      { value: "In writing", label: "repair-or-replace advice, with the photos to prove it" },
    ],
    sections: [
      {
        heading: "The repairs Woodlands roofs actually need",
        kind: "cards",
        body: "Fifty years of village-by-village construction means the community's repair calls follow its roof ages. What we see most, street by street:",
        bullets: [
          {
            lead: "Pipe boot failures",
            text: "the top culprit in newer villages like Creekside Park and Sterling Ridge — neoprene collars degrade in UV and commonly crack within roughly 10–15 years, well before the shingles around them wear out. A mystery ceiling stain in a 2008-built home is this, more often than not.",
          },
          {
            lead: "Wind-lifted shingles and ridge caps",
            text: "southeast Texas averages 50–60 thunderstorm days a year per the National Weather Service, with downbursts capable of 60–100+ mph. IBHS research shows the sealant bond is what holds a shingle down — and that bond weakens with age, which is why the same gust damages a 20-year-old roof and leaves a 5-year-old roof alone.",
          },
          {
            lead: "Flashing at walls, chimneys and valleys",
            text: "the code's whole job for flashing is keeping water out of joints (IRC R903.2); on older Grogan's Mill and Panther Creek roofs we regularly find step flashing that's been painted over, reused through a prior re-roof, or was never right.",
          },
          {
            lead: "Debris and algae damage from the tree canopy",
            text: "the community's defining pines shed constantly; valleys and gutters load up, water backs under shingles, and shaded slopes grow the algae streaking common across the Gulf States. The Township covenants actually require owners to keep roofs clear of leaves, needles and branches.",
          },
          {
            lead: "Nail pops and granule loss",
            text: "backing nails puncture the shingle above; granule loss exposes asphalt to UV and accelerates aging (IBHS). Both are cheap to fix early and expensive to ignore.",
          },
        ],
      },
      {
        heading: "Yes — even repairs have a covenant rule here",
        body: "An oddity of The Woodlands worth knowing: while minor repair of existing improvements is generally exempt from Township approval, the 2024 Residential Development Standards carve out roofing — roofing repairs require a permit at the time of repair or replacement. It's paperwork, not a project-killer, and we handle the submittal as part of the job so your repair is covenant-clean. (No county permit applies — Montgomery County doesn't require one for residential roofs.)",
      },
      {
        heading: "Repair or replace? The honest math",
        body: "Our rule is simple: if a sound repair buys you years, we repair. If the roof is at end of life, patching it is throwing money away — and we'll show you the photos that prove it either way. The calendar matters here: InterNACHI puts three-tab shingles around 20 years and architectural around 30, and notes hot climates drastically shorten asphalt life. On a '90s Alden Bridge roof, a leak is often the roof telling you it's done; on a 2012 Creekside Park roof, the same leak is almost certainly a $400 boot, not a $15,000 roof. Attributed market context: Angi (2026) puts typical roof repairs at $400–$2,000.",
      },
      {
        heading: "Storm repairs and emergency response",
        body: "After wind or hail moves through Montgomery County — and NOAA's storm database logs damaging events here nearly every year — we prioritize active leaks: emergency tarping to stop the water, then a documented repair or a claim-ready assessment if the damage justifies involving your insurer. If a storm just hit, our storm-response page explains the first 48 hours; if you're weighing a claim, our insurance pages walk the Texas rules.",
      },
    ],
    faqs: [
      {
        q: "Can you repair my roof the same day in The Woodlands?",
        a: "Usually — most repairs across the nine villages are scheduled same-day or next-day depending on weather and parts, and active leaks get priority with emergency tarping when needed. Village location doesn't change response: Creekside Park to Grogan's Mill is all home territory.",
      },
      {
        q: "Do I need Township approval for a roof repair?",
        a: "The Standards exempt minor repairs generally but specifically require a permit for roofing repairs at the time of repair or replacement. We prepare that submittal for you — it's part of the job, not your homework. No county permit applies.",
      },
      {
        q: "My ceiling has a water stain but the roof looks fine. What is it?",
        a: "In homes built since the mid-2000s, the most common answer is a cracked pipe boot — the rubber commonly fails within 10–15 years, long before shingles do. Flashing details and nail pops are next. Our inspection finds it and documents it with photos before we quote anything.",
      },
      {
        q: "Will you tell me if it's not worth repairing?",
        a: "Yes, in writing, with photos. If the roof is in its replacement window — common on '80s and '90s roofs in Cochran's Crossing, Indian Springs, Alden Bridge and College Park — we'll say so and show why, and the repair-vs-replace decision stays yours.",
      },
    ],
    dataCompleteness: "complete",
  },

  "the-woodlands/roof-inspection": {
    citySlug: "the-woodlands",
    serviceTag: "inspection",
    slug: "roof-inspection",
    seoTitle: "Roof Inspection The Woodlands TX — Free, 40 Photos",
    seoDescription:
      "Free roof inspection in The Woodlands: forty-photo packet, written findings in 24 hours. Storm checks, buyer/seller inspections, and RDRC re-roof planning.",
    title: "Roof inspection in The Woodlands",
    summary:
      "A free, documented look at exactly where your roof stands — forty photos, written findings within 24 hours, no pressure. The starting point for storm checks, home sales, and Township-compliant re-roof planning.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-01.webp",
      alt: "Northvale Roofing inspector walking a steep two-story roof",
    },
    // Each chip restates a fact already on this page (free vs. paid average:
    // "Why free" section; forty photos + 24 hours: summary + coverage list).
    glance: [
      { value: "Free", label: "vs. a $250 national average for paid inspections (Angi, 2026)" },
      { value: "40 photos", label: "built around canopy, heat, and storm history" },
      { value: "24 hours", label: "to plain-English written findings" },
    ],
    sections: [
      {
        heading: "What a Woodlands inspection covers",
        body: "Roofs here carry this community's specific stresses — five decades of village build-out, heavy tree canopy, Gulf Coast heat and humidity, and a real storm history. Our forty-photo inspection is built around those realities:",
        bullets: [
          {
            text: "Every slope at roof level — north-facing and shaded slopes get extra attention, since they hold moisture and grow the algae streaking common to the Gulf States.",
          },
          {
            text: "Every penetration and detail: pipe boots (the early failure on 2000s-era homes), flashing, valleys, ridge caps and vents.",
          },
          {
            text: "Storm evidence: hail strikes on soft metals, granule loss patterns, wind creasing and lifted seals — checked against what actually moved through Montgomery County, which NOAA's database logs in detail.",
          },
          {
            text: "Debris load: valley and gutter buildup from the tree canopy the Township covenants require owners to keep off roofs.",
          },
          {
            text: "Attic where accessible: decking stains, moisture, and whether ventilation is anywhere near the 1-in-300 guideline — an under-vented attic can hit 140°F on a 90°F day per ARMA, quietly cooking shingles from below.",
          },
          {
            text: "A plain-English written summary with estimated remaining life, delivered within 24 hours.",
          },
        ],
      },
      {
        heading: "Inspections that answer a specific question",
        bullets: [
          {
            lead: "After a storm",
            text: "before you call your insurer, know whether the damage justifies a claim. We tell you honestly — a denied claim on your record is worse than no claim.",
          },
          {
            lead: "Buying or selling",
            text: "for sellers, a documented healthy roof removes a negotiation lever; for buyers, our packet turns 'roof looks old' into specifics you can price. Fast turnaround for option periods.",
          },
          {
            lead: "Planning a re-roof",
            text: "the inspection doubles as RDRC prep — condition documented, measurements taken, material options from the Township's accepted list scoped, so the covenant application is ready when you are.",
          },
          {
            lead: "Annual check",
            text: "cheap insurance on preserve-edge and heavily-treed lots in villages like Indian Springs and Creekside Park, where debris and shade age roofs faster than the calendar suggests.",
          },
        ],
      },
      {
        heading: "Why free, and what free actually gets you",
        body: "Market data (Angi, 2026) puts paid roof inspections at a $250 national average, with drone inspections running $150–$600 — and notes many contractors offer them free. Ours is free because it's how we earn replacement and repair work honestly: you get the full forty-photo packet and written findings whether or not you ever hire us. No verbal-quote-and-vanish, no pressure, no door-knocking — the inspection happens because you booked it.",
      },
    ],
    faqs: [
      {
        q: "Is a roof inspection in The Woodlands really free?",
        a: "Yes — inspection, forty-photo packet, and written findings, free with no obligation. Market rates for paid inspections average around $250 per Angi (2026); we offer ours free because documented honesty is how we win the work that matters.",
      },
      {
        q: "How fast can you inspect after a storm?",
        a: "Storm days are triaged: active leaks first, then documented inspections. Most storm inspections in The Woodlands happen same-day or next-day — and the packet we build is the same one your adjuster will want to see.",
      },
      {
        q: "Can the inspection support my Township re-roof application?",
        a: "Yes. The inspection documents condition and takes the measurements the estimate and the RDRC submittal both need; if you proceed, the covenant application through the Civic Access Portal is prepared from the same visit.",
      },
      {
        q: "Do you inspect for home purchases in The Woodlands?",
        a: "Yes — buyer and seller inspections across all nine villages, with fast turnaround for option periods. The forty-photo packet plus written remaining-life estimate gives both sides something concrete to negotiate from.",
      },
    ],
    dataCompleteness: "complete",
  },

  "the-woodlands/storm-damage": {
    citySlug: "the-woodlands",
    serviceTag: "storm",
    slug: "storm-damage",
    seoTitle: "Storm Damage Roof Repair The Woodlands — Hail & Wind",
    seoDescription:
      "Storm-damaged roof in The Woodlands? Hail and wind documentation built for Texas claims, emergency tarping, and honest guidance on whether to file.",
    title: "Storm damage roofing in The Woodlands",
    summary:
      "Hail, wind, and falling limbs are a matter of record here, not a maybe. We document storm damage to claim-ready standard, tarp what's urgent, and tell you honestly whether filing is worth it.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/work-03.webp",
      alt: "Home and landscaping protected with tarps during a Northvale Roofing re-roof",
    },
    // Each chip restates a fact already on this page (NOAA hail record:
    // storms section; tarp-first: after-a-storm step 1; packet: documentation).
    glance: [
      { value: "¾-inch+", label: "hail logged in Montgomery County nearly every year (NOAA)" },
      { value: "Tarp first", label: "active water stopped before anything else" },
      { value: "40+", label: "photos in every claim-ready packet" },
    ],
    sections: [
      {
        heading: "The storms this area actually sees",
        body: "You don't have to take a roofer's word for the risk — it's in the federal record. The National Weather Service puts southeast Texas at 50–60 thunderstorm days a year, about a third with severe weather. NOAA's Storm Events Database logs damaging hail (¾-inch and larger) in Montgomery County nearly every year — one-inch hail near Shenandoah as recently as June 2025 — plus estimated 75+ mph thunderstorm winds in the south county in May 2025. Hurricane Beryl (July 2024) drove a measured 69 mph gust at Conroe, well inland; the May 2024 derecho tore through the Houston metro with winds estimated near 100 mph in places (the recorded extremes were down toward Houston — Montgomery County's logged winds ran lower); and Harvey dropped 25.66 inches of rain on The Woodlands itself. Storms are the operating environment here — the question is whether your roof's next one finds a weak seal.",
      },
      {
        heading: "What hail and wind damage actually look like",
        bullets: [
          {
            text: "Hail: fresh dents in gutters, downspouts and gutter aprons; dings on A/C condenser fins (a useful size proxy — photograph them); dark 'bruises' on shingles where granules crushed into the mat.",
          },
          {
            text: "Wind: creased or folded shingle tabs, lifted ridge caps, torn shingles at roof edges and corners where uplift concentrates. IBHS research is blunt — the sealant bond is what fails, and it fails easier as roofs age.",
          },
          {
            text: "The compounding problem: IBHS testing shows repeated sub-severe hail (0.7–1.0 inch) plus normal weathering makes shingles behave like decade-older material. A roof can be storm-weakened without one dramatic 'totaled' moment.",
          },
          {
            text: "Falling limbs: puncture and crush damage — common on preserve-edge and heavily-treed lots in villages like Indian Springs, Grogan's Mill and Creekside Park.",
          },
        ],
      },
      {
        heading: "What to do — and what NOT to do — after a storm",
        ordered: true,
        kind: "steps",
        bullets: [
          { text: "Stop active water with emergency tarping (we do this first, questions later)." },
          {
            text: "Get a documented inspection BEFORE filing — a denied claim helps no one. We tell you plainly if the damage doesn't justify a claim.",
          },
          {
            html: "Know the law before anyone knocks: Texas made it illegal for contractors to pay, waive, or absorb your deductible (Tex. Ins. Code §707.002; Bus. & Com. Code §27.02) — TDI warns violators face fines and jail, and your insurer can require proof you paid it before releasing full claim funds. Anyone offering to 'eat the deductible' is proposing fraud with your name on it. See <a href=\"/services/insurance-claims\">our insurance claims guide</a>.",
          },
          {
            text: "Be wary of storm chasers: TDI's own guidance says it's against the law for out-of-town contractors to demand a down payment before starting after a disaster, recommends getting multiple bids, and warns against contracts that assign work 'for the value of insurance proceeds.'",
          },
          {
            text: "If you file: Texas prompt-payment law (Ins. Code Ch. 542) requires your insurer to acknowledge the claim within 15 days, decide within 15 business days of having what it needs, and pay within 5 business days of accepting — with extensions in declared catastrophes.",
          },
        ],
      },
      {
        heading: "Our claim-ready documentation",
        body: "Insurance decisions run on evidence. Every storm assessment we do in The Woodlands produces a forty-photo minimum packet — every slope, every penetration, close-ups of damage, soft-metal hail indicators — plus a written scope aligned to the line items adjusters work from. We'll attend the adjuster's inspection on request. And we stay on our side of the legal line: Texas law (Ins. Code §4102.163) prohibits a roofer from acting as your public adjuster, so we document and build; negotiation is yours or a licensed PA's.",
      },
    ],
    faqs: [
      {
        q: "How do I know if hail actually damaged my Woodlands roof?",
        a: "Ground-level tells: fresh dents in gutters and downspouts, dings on A/C fins, granules piling in gutters. On the roof it's bruised mats and crushed granules — which is exactly what our free, forty-photo inspection documents. NOAA logs damaging hail in Montgomery County nearly every year, so 'it was probably nothing' deserves a check.",
      },
      {
        q: "Should I file an insurance claim after every storm?",
        a: "No — file when documented damage justifies it. A denied claim is worse than no claim. We inspect first, show you the evidence, and tell you honestly which side of the line your roof is on before you call your carrier.",
      },
      {
        q: "A contractor offered to cover my deductible. Is that normal?",
        a: "It's illegal. Texas Insurance Code §707.002 requires policyholders to pay their deductible, and Bus. & Com. Code §27.02 makes waiving or absorbing it an offense — TDI warns of fines up to $2,000 and jail time, and insurers can demand proof of payment before releasing full funds. Treat the offer as the red flag it is.",
      },
      {
        q: "How fast will my insurance company respond to a storm claim?",
        a: "Texas prompt-payment law sets the clock: acknowledgment within 15 days of notice, a written accept/reject within 15 business days of receiving what they requested (extendable to 45 with written reasons), and payment within 5 business days of acceptance. In a declared catastrophe those deadlines extend by 15 days.",
      },
      {
        q: "Do you do emergency tarping in The Woodlands?",
        a: "Yes — active leaks get priority across all nine villages, storm days included. Tarping stabilizes the home first; documentation and repair-or-claim decisions come after the water stops.",
      },
    ],
    dataCompleteness: "complete",
  },

  "the-woodlands/insurance-claims": {
    citySlug: "the-woodlands",
    serviceTag: "insurance",
    slug: "insurance-claims",
    seoTitle: "Roof Insurance Claim Help The Woodlands — TX Rules",
    seoDescription:
      "Roof insurance claim support in The Woodlands: Texas deadlines, deductible law, ACV vs replacement cost, and claim-ready documentation from your contractor.",
    title: "Roof insurance claims in The Woodlands",
    summary:
      "Texas claim rules are specific — deadlines, deductible law, two-part payments. We're the contractor who documents to claim standard and knows the rules cold, so your claim runs on evidence instead of hope.",
    // Visual system (presentation only — every word above/below unchanged).
    // Photo is the real reopened-claim job from Projects (published record).
    heroPhoto: {
      src: "/projects/iko-roof-replacement-the-woodlands-tx.jpg",
      alt: "Aerial view of a completed IKO shingle roof replaced by Northvale Roofing on a Woodlands, TX home",
    },
    // Each chip restates a fact already on this page (15-day acknowledgment +
    // 60-day penalty line: deadlines section; two-part payment: first section).
    glance: [
      {
        value: "15 days",
        label: "for your insurer to acknowledge your claim (Tex. Ins. Code Ch. 542)",
      },
      {
        value: "60 days",
        label: "the delay line that triggers statutory interest plus attorney's fees",
      },
      {
        value: "2 checks",
        label: "how replacement-cost claims typically pay — depreciation follows proof",
      },
    ],
    sections: [
      {
        heading: "How a Texas roof claim actually pays",
        body: "The single most useful thing a Woodlands homeowner can know before filing: how your policy pays. Per the Texas Department of Insurance, replacement-cost policies pay to rebuild at current prices, while actual-cash-value policies deduct depreciation — TDI's own example shows a $10,000 roof paying just $4,000 at 20 years old under ACV, before your deductible. Replacement-cost claims typically pay in two parts: the first check is the depreciated value, and the recoverable depreciation follows once you show proof repairs were done. That's also why the deductible law has teeth — your insurer can require proof you paid your deductible (a canceled check, financing agreement, or receipt) before releasing that final money.",
      },
      {
        heading: "The deadlines your insurer must hit",
        body: "Texas prompt-payment law (Insurance Code Chapter 542) puts your claim on a clock:",
        ordered: true,
        kind: "steps",
        bullets: [
          {
            text: "Within 15 days of your notice: acknowledge the claim, start investigating, and request what they need (§542.055).",
          },
          {
            text: "Within 15 business days of receiving everything requested: accept or reject in writing (§542.056) — extendable once to 45 days with written reasons.",
          },
          { text: "Within 5 business days of accepting: pay (§542.057)." },
          {
            text: "Delay past 60 days after they have everything: statutory damages — interest plus attorney's fees (§542.058, §542.060).",
          },
          {
            text: "Declared weather catastrophe: all deadlines extend by 15 days (§542.059) — relevant after the kind of regional events this area actually sees.",
          },
        ],
      },
      {
        heading: "What we do — and the legal line we don't cross",
        kind: "cards",
        bullets: [
          {
            lead: "Pre-claim honesty",
            text: "we inspect and tell you whether the damage justifies filing at all. A denied claim on your record helps no one.",
          },
          {
            lead: "Claim-grade documentation",
            text: "forty-plus photos, hail and wind indicators on soft metals, and a written scope aligned to the Xactimate line items adjusters price from.",
          },
          {
            lead: "Adjuster meeting",
            text: "we attend your adjuster's inspection on request so the scope reflects what's actually on the roof.",
          },
          {
            lead: "Code and completeness items",
            text: "where the initial scope misses required work — decking replacement the code demands, drip edge, proper flashing — we document it for the carrier's review. Getting the scope complete is normal practice, not a trick.",
          },
          {
            html: "<strong>The line:</strong> Texas Insurance Code §4102.163 prohibits a contractor from acting as public adjuster on the same property — negotiating your claim's value is your role or a licensed PA's, never your roofer's. And per §707.002 and Bus. & Com. Code §27.02, we never waive, absorb, or offset a deductible. Both rules exist because of storm-chaser abuse; both protect you.",
          },
        ],
      },
      {
        heading: "Timing, deadlines, and Woodlands specifics",
        body: "Don't sit on storm damage: TDI advises telling your company as soon as possible and notes some policies carry one-year claim deadlines — the deadline is in your contract, so check it. Location details matter too: most of The Woodlands is Montgomery County but Creekside Park is Harris County, and getting the jurisdiction right keeps records clean when carriers cross-check storm data. One more caution from TDI worth repeating: talk to your company before cashing settlement checks — some carriers treat a signed check as final settlement.",
      },
    ],
    faqs: [
      {
        q: "Will my insurance pay for a full roof replacement in The Woodlands?",
        a: "It depends on your damage and your policy type. Replacement-cost policies pay current prices (in two parts — depreciated value first, recoverable depreciation after proof of repair); actual-cash-value policies deduct age-based depreciation, which on an older roof can be most of the roof's value per TDI's own examples. Our documentation establishes the damage; your policy sets the math.",
      },
      {
        q: "Are you a public adjuster?",
        a: "No, and legally we can't be — Texas Insurance Code §4102.163 prohibits a roofing contractor from acting as public adjuster on the same property. We're your contractor: we document, we build, we attend the adjuster meeting on request. Claim negotiation belongs to you or a licensed PA you hire separately.",
      },
      {
        q: "Can you help with my deductible?",
        a: "We can't waive, absorb, or rebate it — that's illegal in Texas (Ins. Code §707.002; Bus. & Com. Code §27.02), and your insurer can require proof you paid it before releasing recoverable depreciation. What we can do is document thoroughly and offer financing options for the out-of-pocket where available.",
      },
      {
        q: "How long do I have to file a roof claim in Texas?",
        a: "Check your policy — TDI notes some policies have one-year deadlines, and the deadline is contractual. The safer answer: promptly. Document the date of the storm (NOAA's database records Montgomery County events), get inspected, and if the evidence justifies filing, file while the trail is fresh.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const CITY_SERVICE_KEYS = Object.keys(CITY_SERVICES);

export function cityServicesForCity(citySlug: ServiceAreaSlug): CityService[] {
  return Object.values(CITY_SERVICES).filter((cs) => cs.citySlug === citySlug);
}
