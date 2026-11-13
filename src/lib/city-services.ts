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
    seoTitle: "Roof Replacement in The Woodlands, TX",
    seoDescription:
      "Roof replacement in The Woodlands: Township RDRC approval handled, tear-off to deck, Standards-compliant materials, written price before we leave the driveway.",
    title: "Roof replacement in The Woodlands",
    summary:
      "A Woodlands re-roof is two jobs: the roof itself, and the Township covenant approval that must come first. We do both — tear-off to deck, Standards-compliant materials, and the RDRC paperwork filed before a single shingle is ordered.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/completed-shingle-roof-replacement-houston.webp",
      alt: "Drone view of a completed shingle roof replacement by Northvale Roofing on a Houston-area home",
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
          src: "/work/roof-tear-off-single-story-home-houston.webp",
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
        html: 'Every roof is priced from its own measurements, pitch, material, and decking condition — which is why our estimate is written, itemized, and delivered before we leave your driveway. For orientation, attributed market data: Angi\'s 2026 figures put the national average roof replacement at $9,602, with most projects between $5,900 and $46,000 depending on size and material ($4–$11 per square foot); Modernize (2026) lists architectural shingle at roughly $4.11–$5.57 per square foot installed; and This Old House (2026) reports about $15,439 average for a 2,000-square-foot asphalt roof. Larger Woodlands homes with complex rooflines trend above national averages; metal runs roughly two to three times asphalt per the Metal Roofing Alliance. Those are market numbers, not our quote — the only number that matters is the one we put in writing for your specific roof. Comparing us against other bids? <a href="/blog/what-should-a-roofing-estimate-include/">What a roofing estimate should include</a> is the line-by-line checklist that makes three quotes actually comparable, and <a href="/blog/how-to-pay-for-a-new-roof-texas/">how people pay for a new roof</a> covers the funding routes.',
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
    seoTitle: "Roof Repair in The Woodlands, TX",
    seoDescription:
      "Roof repair in The Woodlands: leaks, pipe boots, flashing, wind damage. Same-day or next-day across all nine villages, with the Township permit rule handled.",
    title: "Roof repair in The Woodlands",
    summary:
      "Leaks, cracked pipe boots, lifted ridge caps, tired flashing — most Woodlands repairs are same-day or next-day, documented with photos, and handled with the Township's repair-permit rule covered.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/hand-nailing-shingles-houston.webp",
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
    seoTitle: "Free Roof Inspection in The Woodlands",
    seoDescription:
      "Free roof inspection in The Woodlands: forty-photo packet, written findings in 24 hours. Storm checks, buyer/seller inspections, and RDRC re-roof planning.",
    title: "Roof inspection in The Woodlands",
    summary:
      "A free, documented look at exactly where your roof stands — forty photos, written findings within 24 hours, no pressure. The starting point for storm checks, home sales, and Township-compliant re-roof planning.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/roof-inspection-steep-two-story-houston.webp",
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
    seoTitle: "Storm & Hail Roof Damage, The Woodlands",
    seoDescription:
      "Storm-damaged roof in The Woodlands? Hail and wind documentation built for Texas claims, emergency tarping, and honest guidance on whether to file.",
    title: "Storm damage roofing in The Woodlands",
    summary:
      "Hail, wind, and falling limbs are a matter of record here, not a maybe. We document storm damage to claim-ready standard, tarp what's urgent, and tell you honestly whether filing is worth it.",
    // Visual system (presentation only — every word above/below unchanged).
    heroPhoto: {
      src: "/work/landscaping-tarped-during-re-roof-houston.webp",
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
    seoTitle: "Roof Insurance Claims in The Woodlands",
    seoDescription:
      "Roof insurance claim support in The Woodlands: Texas deadlines, deductible law, ACV vs replacement cost, and claim-ready documentation from your contractor.",
    title: "Roof insurance claims in The Woodlands",
    summary:
      "Texas claim rules are specific — deadlines, deductible law, two-part payments. We're the contractor who documents to claim standard and knows the rules cold, so your claim runs on evidence instead of hope.",
    // Visual system (presentation only — every word above/below unchanged).
    // Photo is the real reopened-claim job from Projects (published record).
    heroPhoto: {
      src: "/projects/iko-hail-claim-roof-replacement-the-woodlands-tx.webp",
      alt: "Aerial view of a completed IKO architectural shingle roof replacement on a large hip-and-valley home in The Woodlands, TX, after an approved hail claim",
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
        html: "The single most useful thing a Woodlands homeowner can know before filing: how your policy pays. Per the Texas Department of Insurance, replacement-cost policies pay to rebuild at current prices, while actual-cash-value policies deduct depreciation — TDI's own example shows a $10,000 roof paying just $4,000 at 20 years old under ACV, before your deductible. Replacement-cost claims typically pay in two parts: the first check is the depreciated value, and the recoverable depreciation follows once you show proof repairs were done. That's also why the deductible law has teeth — your insurer can require proof you paid your deductible (a canceled check, financing agreement, or receipt) before releasing that final money. If your first check has already landed and looks nowhere near enough, <a href=\"/blog/insurance-wont-cover-entire-roof/\">we have drawn that split to scale</a> — it is usually the sequence rather than a short payment.",
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
  /**
   * CONROE (added 2026-11-13). Search Console: "hail or wind storm roof damage
   * repair conroe tx insurance claim" is the single biggest local query on the
   * site — 19 impressions at position 3.4 — and it was ranking off the /conroe
   * hub page with no spoke behind it at all.
   *
   * These are NOT the Woodlands pages with the city swapped (Hard Rule #1).
   * Conroe differs in two ways that drive the whole content: it is an
   * INCORPORATED CITY with a building department, so a re-roof inside the
   * limits is permitted work — the opposite of unincorporated Montgomery
   * County — and Lake Conroe gives waterfront roofs open-water wind exposure
   * inland lots do not have. Facts sourced in research-facts Sheet 14.
   */
  "conroe/storm-damage": {
    citySlug: "conroe",
    serviceTag: "storm",
    slug: "storm-damage",
    seoTitle: "Storm & Hail Roof Damage, Conroe TX",
    seoDescription:
      "Hail and wind roof damage in Conroe — documented for your claim, with the city permit pulled if you are inside the limits. Lake Conroe roofs included.",
    title: "Storm and hail roof damage in Conroe",
    summary:
      "Same-day inspection, a forty-photo packet built for your claim, and the City of Conroe permit pulled if your address sits inside the limits. Free emergency tarping if it is leaking now.",
    glance: [
      { value: "Same-day", label: "inspection after a storm, free" },
      { value: "40 photos", label: "documented before anything is touched" },
      { value: "Permit", label: "pulled and managed inside Conroe city limits" },
    ],
    sections: [
      {
        heading: "Conroe is three different storm markets",
        html: "What a storm does to a roof here depends on which Conroe you live in. On <strong>Lake Conroe</strong> — April Sound, Bentwater and the other waterfront communities — wind arrives off open water with nothing to break it, so damage concentrates at edges, rakes and ridge caps rather than in the field. In the <strong>newer master-planned neighborhoods</strong> around I-45 and the Grand Parkway, like Grand Central Park, roofs are builder-grade and close in age, so a hail event tends to hit a whole street at the same stage of life. Across <strong>older inland Conroe</strong> — Graystone Hills, Longmire, the neighborhoods near downtown — roofs are of every era, and a storm a ten-year-old roof shrugs off will finish a twenty-five-year-old one. We inspect for what your part of Conroe actually suffers from, not a generic hail checklist.",
      },
      {
        heading: "The permit question, which Conroe gets backwards from everywhere else",
        html: "Almost everywhere else we work is unincorporated Montgomery County, where a residential re-roof needs no county permit. <strong>Conroe is the exception.</strong> Inside the city limits the City of Conroe requires a building permit for a re-roof, administered by its Building Inspections &amp; Permits Department, with applications running through the city OpenGov portal. We pull and manage it as part of the job. The catch is that plenty of homes with a Conroe mailing address are not inside the city limits at all — they are unincorporated county, where there is no re-roof permit and your HOA governs instead. Confirming which jurisdiction your address sits in is the first thing we do, because a storm job that starts on the wrong assumption stalls.",
      },
      {
        heading: "What we document, and why the order matters",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "Photograph the roof before anything is touched — including before an emergency tarp goes on. Once a tarp is down, what your adjuster needs to see is underneath it.",
          },
          {
            text: "Work the slopes by exposure. On a lakefront roof that means edges, rakes and ridge first; inland it means the windward slopes and the soft metals that show hail earliest.",
          },
          {
            text: "Record hail strike size and density per slope rather than one verdict for the whole roof. Carriers scope by slope.",
          },
          {
            text: "Note the collateral — gutters, screens, vents, soft metals. It is often what establishes that hail of a given size actually fell at your address.",
          },
          {
            text: "Hand you the packet whether or not you file. It is yours either way, and it is the baseline if a later storm raises the question again.",
          },
        ],
      },
      {
        heading: "If your roof is leaking right now",
        html: 'Emergency tarping and temporary dry-in are free, with no commitment to use us for the repair — <a href="/storm-response">storm response</a> covers how that works and when a tarp is not the right answer. Active leaks jump the queue ahead of scheduled inspections.',
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to replace a storm-damaged roof in Conroe?",
        a: "Inside the City of Conroe limits, yes — the city requires a building permit for a re-roof and we pull and manage it. If your Conroe-addressed home is actually in unincorporated Montgomery County there is no county re-roof permit, and your HOA or community architectural review governs instead. We confirm which applies before work is scheduled.",
      },
      {
        q: "Does a Lake Conroe waterfront roof get damaged differently?",
        a: "Yes. Open-water wind hits edges, rakes and ridge caps harder than on a sheltered inland lot, so waterfront storm damage concentrates at the perimeter rather than mid-slope. Lake humidity also keeps roofs damp, accelerating algae streaking and sealant and fastener wear — so a waterfront roof can be nearer the end of its life than its age suggests when a storm arrives.",
      },
      {
        q: "How soon can you inspect after a storm?",
        a: "Same day in most cases, and active leaks jump the queue. We do not door-knock after storms, so you will not find a crew on your porch — you call us, or you do not.",
      },
      {
        q: "Do I have to file a claim to get the inspection?",
        a: "No. The inspection and the forty-photo packet are free and yours regardless. If what we find is not worth filing against your deductible we will say so — that is a common and perfectly good outcome.",
      },
    ],
    dataCompleteness: "complete",
  },

  "conroe/insurance-claims": {
    citySlug: "conroe",
    serviceTag: "insurance",
    slug: "insurance-claims",
    seoTitle: "Roof Insurance Claims in Conroe, TX",
    seoDescription:
      "Roof insurance claim help in Conroe — documentation your adjuster can scope from, the Texas rules that apply, and the city permit handled if you need one.",
    title: "Roof insurance claims in Conroe",
    summary:
      "We document the damage, meet your adjuster on the roof, and handle the City of Conroe permit if your address needs one. We are not a public adjuster, and we will not touch your deductible.",
    glance: [
      { value: "On the roof", label: "we meet your adjuster — you need not be there" },
      { value: "Per slope", label: "scoped the way carriers actually scope" },
      { value: "2026 rule", label: "appraisal provision now required on Texas policies" },
    ],
    sections: [
      {
        heading: "What a Conroe claim runs into that others do not",
        html: "Two things shape a roof claim here. First, if your home is inside the City of Conroe limits the replacement is <strong>permitted work</strong> — the city requires a building permit for a re-roof, which the rest of unincorporated Montgomery County does not. That is a step in the schedule and a document in the file, and we handle it. Second, <strong>Lake Conroe waterfront roofs age differently</strong>: open-water wind and lake humidity work on edges, sealant and fasteners faster than on a sheltered inland lot. That matters in a claim, because a carrier looking at a waterfront roof will often reach for wear and tear as the explanation. Documentation that separates storm damage from ordinary ageing is the whole game on those addresses.",
      },
      {
        heading: "What appraisal can and cannot fix",
        html: 'If your claim is denied or underpaid, the first question is which kind of disagreement you are in. A dispute about <strong>how much</strong> is what the appraisal provision is for — and Texas Senate Bill 458 now requires residential property policies issued or renewed on or after 1 January 2026 to include one. A dispute about <strong>whether it is covered at all</strong> is a different fight: the Insurance Code describes appraisal as a process solely to determine the amount of loss. We have reopened denied claims both ways — once through a reinspection with the adjuster on the roof, once through appraisal. <a href="/blog/roof-claim-denied-texas-appraisal/">The full walkthrough is here</a>.',
      },
      {
        heading: "The Texas rules that apply to your claim",
        kind: "cards",
        bullets: [
          {
            lead: "Your insurer is on a clock",
            text: "acknowledge within 15 days of notice, accept or reject within 15 business days of receiving everything requested (one 45-day extension with written reasons), pay within 5 business days of accepting — with extensions in a declared catastrophe and penalties past 60 days.",
          },
          {
            lead: "We are not a public adjuster",
            text: "Texas Insurance Code §4102.163 prohibits a roofer from adjusting a claim on the same property. We document; a separately licensed public adjuster, if you hire one, negotiates.",
          },
          {
            lead: "Nobody can touch your deductible",
            text: "§707.002 requires you to pay it, and Business & Commerce Code §27.02 makes it an offence for a contractor to waive, rebate or absorb it. An offer to 'eat' it is not a discount.",
          },
          {
            lead: "Two checks is normal",
            html: 'replacement-cost policies pay actual cash value first and release the recoverable depreciation once you prove the work was done. Our closeout packet is built to be that proof — and if the first one looked alarmingly small, <a href="/blog/insurance-wont-cover-entire-roof/">here is where the rest of the money is</a>.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Does the City of Conroe permit affect my claim?",
        a: "It affects the job, not the coverage. Inside the city limits a re-roof is permitted work, so there is a permit to pull and an inspection to pass — we handle both, and they become part of the closeout documentation. If your Conroe-addressed home is in unincorporated Montgomery County there is no county re-roof permit and the HOA governs instead.",
      },
      {
        q: "My carrier says my Lake Conroe roof is just worn out. Is that the end of it?",
        a: "Not necessarily, but it is a coverage dispute rather than an amount dispute, which changes what comes next. Waterfront roofs genuinely do age faster — open-water wind and lake humidity see to that — so the work is documenting what is storm damage as distinct from ordinary ageing, slope by slope. Texas courts have held that appraisers may apportion damage between hail and wear and tear, because that question goes to the amount of loss.",
      },
      {
        q: "Will you meet my adjuster?",
        a: "Yes, on the roof, and you do not need to be there. One Woodlands claim we took on had already been denied because the previous contractor missed the adjuster meeting entirely — nobody was there to point the damage out. We re-inspected, met the adjuster, and it was approved for a full replacement.",
      },
      {
        q: "Should I file at all?",
        a: "Sometimes no. If the damage is modest against your deductible, filing can cost more than it returns. We document first and tell you honestly which side of that line you are on before you commit to anything.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Spring — our home base. Local facts sourced in docs/research-facts.md:
   * Harris County OCE permit FAQ (Sheet 5, which resolves Sheet 4 UNVERIFIED
   * #1 for the no-general-re-roof-permit point), Spring neighbourhood build
   * eras (Sheet 5), Harvey rainfall totals and regional storm record
   * (Sheet 3), attributed cost data (Sheet 1).
   *
   * This page carries BOTH the "what does it cost" and the "is my roof due"
   * intents, because in Spring they are the same conversation: the Klein and
   * Champions housing stock is old enough that most callers are asking when,
   * not whether. Splitting them would have produced two thin pages competing
   * for one query family.
   */
  "spring/roof-replacement": {
    citySlug: "spring",
    serviceTag: "replacement",
    slug: "roof-replacement",
    seoTitle: "Roof Replacement in Spring, TX — Cost & When It's Due",
    seoDescription:
      "Roof replacement in Spring, TX from a company based here. What it costs, how to tell your Klein or Champions roof is due, and who approves it. Written price.",
    title: "Roof replacement in Spring, TX",
    summary:
      "Spring is home base — off I-45 near Klein, Gleannloch Farms and Champions Forest. We are a short drive from most of these roofs, and we already know which subdivisions are coming due. Tear-off to deck, HOA submittal handled, written price before we leave the driveway.",
    // A genuinely local photo: this is a real Northvale job IN Spring, so the
    // alt can name the city honestly (Hard Rule #2).
    heroPhoto: {
      src: "/projects/iko-insurance-claim-roof-replacement-spring-tx.webp",
      alt: "Aerial view of a completed charcoal IKO architectural shingle roof replacement by Northvale Roofing on a two-story Spring, TX home",
    },
    glance: [
      { value: "Home base", label: "we are based in Spring, not driving in" },
      { value: "1 day", label: "most installations finish in one" },
      { value: "In writing", label: "your exact price before we leave the driveway" },
    ],
    sections: [
      {
        heading: "Why so many Spring roofs are due at once",
        html: 'Spring was not built in one go, and that is the whole story of roofing here. <strong>Klein and Champions Forest</strong> went up largely through the 1970s and \'80s, which puts those original and first-replacement roofs well into — or past — the life an asphalt shingle gets in this climate. <strong>Gleannloch Farms, Augusta Pines and Harmony</strong> are 1990s-through-2010s master-planned builds, so their builder-grade roofs are aging out in waves, street by street, rather than one house at a time. <strong>Old Town Spring</strong> anchors the historic railroad district with housing stock of every era. The practical effect: if three neighbours have replaced recently, that is not a coincidence or a sales pitch — it is a subdivision reaching the same birthday together. What it does not tell you is whether <em>your</em> roof is due, which is what <a href="/blog/repair-or-replace-your-roof/">the repair-or-replace questions</a> actually settle.',
      },
      {
        heading: "How to tell your roof is genuinely due",
        kind: "cards",
        bullets: [
          {
            lead: "Age against this climate, not the wrapper",
            text: "Sustained heat, intense UV and humidity dry out the asphalt binder, so a Houston-area roof rarely reaches the number printed on the packaging. Past about twenty years, a repair is often money spent on a roof you will replace anyway.",
          },
          {
            lead: "Granules in the gutters and bare patches",
            html: 'Granules are the shingle\'s UV armour. General thinning across a whole slope is a roof getting old; a coin-sized bare patch with a dent in it is <a href="/blog/what-hail-damage-looks-like-on-a-roof/">hail damage</a>, and those are different conversations with different people paying.',
          },
          {
            lead: "Field failure rather than detail failure",
            text: "A cracked pipe boot or failed step flashing is a repair. Widespread cracking, curling, brittleness or wind creasing across whole slopes is a field failure — no amount of patching catches up, because the material itself is finished.",
          },
          {
            lead: "What the decking looks like underneath",
            text: "Nobody can answer this from the ground. A roof can look serviceable and sit on plywood that has been quietly rotting around a long-term leak. It is also why a replacement quote that never mentions decking is incomplete.",
          },
          {
            lead: "A roof that aged faster than it should have",
            html: 'Often the attic, not the shingles. A poorly ventilated attic cooks the roof from underneath — <a href="/blog/attic-ventilation-texas-roof-lifespan/">ventilation is why Texas roofs die early</a>, and replacing shingles without fixing it buys you the same early failure again.',
          },
        ],
      },
      {
        heading: "What it costs, and what actually moves the number",
        html: 'We are not going to invent a Spring average, because the honest answer is that square footage, pitch, layers to tear off and decking condition move the price more than your zip code does. For market context rather than our quote, Angi (2026) puts the national average roof replacement around <strong>$9,602</strong>, across a full span of roughly $5,900 to $46,000 — <a href="/blog/roof-replacement-cost-the-woodlands/">what a replacement costs here</a> breaks the drivers down with the sources attached. Two things matter more than the headline figure. First, <strong>decking is the variable nobody can price from the driveway</strong>, so an honest estimate gives you the per-sheet price up front instead of surprising you with it on day two. Second, a quote is only comparable to another quote if both list the same work — <a href="/blog/what-should-a-roofing-estimate-include/">what a roofing estimate should include</a> is the checklist we would want you to hold us to as well. If paying for it in one go is the obstacle, <a href="/financing">financing options</a> sets out the routes without us pretending to be your lender.',
      },
      {
        heading: "Who approves it in Spring — usually not the county",
        html: "Most of Spring is unincorporated Harris County, and the county's Office of the County Engineer permits septic systems, driveway culverts and floodplain work rather than running a general residential building-permit programme. In practice that means a straightforward re-roof here is typically governed by your <strong>HOA or deed restrictions</strong>, not a county building permit. Plenty of Spring subdivisions — Gleannloch Farms and Augusta Pines among them — do have architectural guidelines on shingle colour, and we prepare that submittal as part of the job. Two caveats we take seriously rather than gloss over: northern Spring extends into <strong>Montgomery County</strong>, and a few incorporated pockets follow different rules entirely. We confirm your specific address before assuming anything, because a job that starts on the wrong jurisdiction stalls.",
      },
      {
        heading: "What a Northvale replacement actually involves",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "A free documented inspection first — every slope photographed, the attic checked, written findings within 24 hours. If the roof has life left, that is what the report says.",
          },
          {
            text: "A written price before we leave the driveway, including the per-sheet decking rate, so nothing about the number changes once the work starts.",
          },
          {
            text: "Your HOA submittal prepared and filed with compliant colour samples, before material is ordered rather than after.",
          },
          {
            text: "Tear-off to bare deck. We do not roof over an existing layer — it hides the decking, which is the one thing worth seeing.",
          },
          {
            text: "Decking inspected and any rotted sheets replaced at the quoted rate, photographed before they are covered.",
          },
          {
            text: "The full system installed — underlayment, valleys, flashing, ventilation, edge detail — and the site magnet-swept before we leave. Most installations finish in a day.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Spring?",
        a: "For most Spring homes — which sit in unincorporated Harris County — there is no county building permit for a re-roof. The county's permitting focuses on septic, driveways and floodplain work rather than residential roofs, so your HOA or deed restrictions usually govern instead, and we handle that paperwork. Because northern Spring reaches into Montgomery County and a few areas are incorporated, we confirm your exact address first rather than assuming.",
      },
      {
        q: "My Klein or Champions Forest roof is original. Is it time?",
        a: "Quite possibly. Much of Klein and Champions Forest was built in the 1970s and '80s, so a lot of those roofs are at or past the end of architectural-shingle life for this climate. But age alone does not settle it — we document the actual condition with photos and give you an honest remaining-life estimate. If it has years left, we will tell you that and you can plan for it rather than be ambushed by it.",
      },
      {
        q: "How much does a new roof cost in Spring?",
        a: "Honestly, not something anyone can quote from a zip code. Square footage, pitch, how many layers come off and what the decking looks like underneath move the price far more than which part of Spring you live in. For national context, Angi (2026) puts the average replacement around $9,602 with a span of roughly $5,900 to $46,000. We measure, photograph and give you a written price — including the per-sheet decking rate — before we leave your driveway.",
      },
      {
        q: "Will my HOA need to approve the shingle colour?",
        a: "In most of the master-planned Spring communities, yes. Gleannloch Farms, Augusta Pines and others have architectural guidelines covering shingle colour, and getting the submittal right the first time avoids an expensive re-do. We bring compliant colour samples, file the paperwork for you, and do not order material until it clears.",
      },
      {
        q: "Are you actually based in Spring, or just advertising here?",
        a: "Based here, off I-45 near Klein. It matters in two practical ways: we are usually a short drive from the job rather than dispatching across the metro, and we already know the covenant expectations street to street. It also means we are not going anywhere after the storm season ends.",
      },
      {
        q: "Can you work with my insurance if the roof was storm-damaged?",
        a: "Yes, and it is worth establishing before you commit to paying out of pocket. If a covered peril caused the damage, your policy may cover a replacement you would otherwise fund yourself. We document the damage properly, meet your adjuster on the roof, and tell you honestly whether what we found is worth filing against your deductible.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Cypress / Cy-Fair. The anchor fact is primary and genuinely local: NCEI's
   * Storm Events entries for the 16 May 2024 Houston derecho include an
   * estimated ~104 mph gust AT CYPRESS — the highest in the Harris County
   * entries for that day (Sheet 3). That is a storm record for this address,
   * not a regional generality, which is exactly what keeps this page from
   * being the storm page with a city name swapped in.
   *
   * Jurisdiction + MUD/ARC facts: Sheet 5. Wind mechanics: Sheet 3 (IBHS /
   * IIBEC). Do NOT extend the 104 mph figure to any other city.
   */
  "cypress/storm-damage": {
    citySlug: "cypress",
    serviceTag: "storm",
    slug: "storm-damage",
    seoTitle: "Storm & Hail Roof Damage in Cypress, TX (Cy-Fair)",
    seoDescription:
      "Hail and wind roof damage in Cypress, TX — documented for your claim, ARC submittal handled for Bridgeland, Towne Lake and Fairfield. Free emergency tarping.",
    title: "Storm and hail roof damage in Cypress",
    summary:
      "The 2024 derecho was clocked at an estimated 104 mph here — the hardest-hit point in Harris County's storm record that day. We inspect same-day, document every slope for your claim, and handle the architectural-review submittal your community will require before the repair.",
    // We hold no confirmed Cypress photo, so this real Northvale job carries a
    // location-NEUTRAL alt rather than claiming an address we cannot stand
    // behind (Hard Rule #2). Swap for a Cypress job photo when we have one.
    heroPhoto: {
      src: "/work/completed-roof-two-story-oak-houston.webp",
      alt: "Completed Northvale Roofing shingle roof on a two-story Houston-area home framed by oak branches",
    },
    glance: [
      { value: "104 mph", label: "estimated gust at Cypress, 2024 derecho (NCEI)" },
      { value: "Same-day", label: "inspection after a storm, free" },
      { value: "ARC filed", label: "your community's submittal handled, not left to you" },
    ],
    sections: [
      {
        heading: "Cypress has the storm record to prove it",
        html: "This is not a general Gulf Coast warning. When the <strong>16 May 2024 derecho</strong> crossed the Houston metro, NOAA's National Centers for Environmental Information logged an estimated <strong>104 mph gust at Cypress</strong> — the highest of the Harris County entries for that event, against roughly 92 mph at Englewood and 71 mph measured in Houston. More than a million customers lost power across the metro. A gust in that range is hurricane-force wind arriving without a hurricane's warning, and it is the kind of event that strips ridge caps, peels perimeter courses and breaks sealant bonds across whole elevations. If your roof came through 2024 and has not been looked at since, it is worth knowing what it is carrying.",
      },
      {
        heading: "Why Cypress roofs fail at the edges",
        html: 'Cy-Fair is open country by roofing standards. The master-planned communities — <strong>Bridgeland, Towne Lake, Fairfield, Cypress Creek Lakes, Blackhorse Ranch</strong> — are newer, laid out wide, and built around a lot of man-made water. There is very little upwind to break a gust before it reaches your roof. That matters because wind does not attack the middle of a roof; it attacks the perimeter, where uplift is strongest. Research from the Insurance Institute for Business &amp; Home Safety finds that what actually fails in wind is the <strong>sealant bond between shingle courses</strong>, and that bond weakens as a roof ages. So on a Cypress roof we start at the eaves, rakes and ridge rather than the field — and we look hard for <a href="/blog/tropical-storm-roof-damage-texas/">creasing, the damage almost everybody misses</a>, because a creased shingle that stayed on the roof is one that leaves in the next storm.',
      },
      {
        heading: "The part that catches Cypress homeowners out: the ARC",
        html: "Cypress is unincorporated Harris County, sitting inside the City of Houston's extraterritorial jurisdiction rather than its city limits — so there is <strong>no city building permit</strong> for a re-roof here. What governs instead is your community's architectural-review committee, and in master-planned Cypress those are strict. Nearly every neighbourhood here was built on Municipal Utility District land with an ARC that approves specific shingle lines and specific colours. After a storm this trips people up badly: the claim gets approved, the homeowner wants the work done immediately, and the submittal has not been filed. We prepare and file the ARC paperwork with compliant colour samples as part of the job, and we confirm your community's current requirements before material is ordered — not after it arrives in the wrong colour.",
      },
      {
        heading: "What we document, and why the order matters",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "Photograph the roof before anything is touched — including before an emergency tarp goes on. Once a tarp is down, what your adjuster needs to see is underneath it.",
          },
          {
            text: "Start at the perimeter. On these open Cypress lots the eaves, rakes, ridge caps and corners are where uplift concentrates, so that is where the evidence is.",
          },
          {
            text: "Hand-check the seal on edge and ridge courses. A broken bond and a crease are wind damage even when nothing is missing — and nothing missing is what makes homeowners assume they were fine.",
          },
          {
            text: "Record hail strike size and density slope by slope rather than one verdict for the whole roof. Carriers scope by slope, so your documentation has to line up with their paperwork.",
          },
          {
            text: "Photograph the collateral — gutters, screens, vents, soft metals. It is often what establishes that hail of a given size actually fell at your address rather than three miles away.",
          },
          {
            text: "Hand you the packet whether or not you file. It is yours either way, and a documented 'no damage' is the baseline for the next storm.",
          },
        ],
      },
      {
        heading: "If your roof is leaking right now",
        html: 'Emergency tarping and temporary dry-in are free, with no obligation to use us for the repair — <a href="/storm-response">storm response</a> covers how that works and when a tarp is not the right answer. Active leaks jump the queue ahead of scheduled inspections. And if what you are looking at is round and scattered rather than lifted at the edges, <a href="/blog/what-hail-damage-looks-like-on-a-roof/">what hail damage actually looks like</a> will tell you which storm you are dealing with.',
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to repair storm damage in Cypress?",
        a: "No city building permit, no. Cypress is unincorporated Harris County inside Houston's extraterritorial jurisdiction rather than its city limits, so there is typically no city re-roof permit. What you do need is your community's architectural-review approval — and in Bridgeland, Towne Lake, Fairfield and the rest, those committees are strict about shingle line and colour. We file that submittal for you.",
      },
      {
        q: "Was Cypress really hit harder than the rest of Houston in 2024?",
        a: "In that particular event, by the official record, yes. NCEI's Storm Events entries for the 16 May 2024 derecho include an estimated 104 mph gust at Cypress, the highest of the Harris County entries for that day. That does not mean every Cypress roof was damaged — but it does mean a roof here that has not been inspected since 2024 is worth a look.",
      },
      {
        q: "My shingles are all still there. Can I still have wind damage?",
        a: "Yes, and this is the single most common misconception we meet. What fails in wind is the factory sealant bond between courses, not usually the nails. A shingle can be lifted, have its bond broken, and drop back down looking almost normal — with a permanent crease across it. It is still on your roof and it is still damaged, and it will be the first thing to leave in the next storm.",
      },
      {
        q: "Will my Bridgeland or Towne Lake ARC approve the replacement shingle?",
        a: "That is exactly what the submittal decides, and it is the step most often got wrong after a storm. We bring IKO colour samples that fit your community's approved palette, file the paperwork for you, and do not order material before it clears review — so the claim timeline and the approval timeline do not collide.",
      },
      {
        q: "How soon can you inspect after a storm?",
        a: "Same day in most cases, and active leaks jump the queue. We do not door-knock after storms, so you will not find one of our crews on your porch — you call us, or you do not.",
      },
      {
        q: "Do I have to file a claim to get the inspection?",
        a: "No. The inspection and the photo packet are free and yours regardless. If what we find will not clear your deductible, we will say so — that is a common and perfectly good outcome, and filing a claim you cannot win is not free.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Houston — the permit page. Deliberately NOT a general "roofing Houston"
   * page: that head term is unwinnable against national aggregators, while
   * "do I need a permit to replace my roof in Houston" is a real, local,
   * high-intent question almost nobody answers properly. Facts: Houston
   * Permitting Center Residential Roofing Permit (Sheet 16), jurisdiction
   * split (Sheet 5).
   */
  "houston/roof-replacement": {
    citySlug: "houston",
    serviceTag: "replacement",
    slug: "roof-replacement",
    seoTitle: "Roof Replacement in Houston — Permits, Code & Cost",
    seoDescription:
      "Roof replacement inside Houston city limits needs a permit, and we pull it. What the permit is for, what it covers, and why your address decides everything.",
    title: "Roof replacement in Houston",
    summary:
      "Inside the city limits a re-roof is permitted work, and that permit exists to confirm your new roof meets current wind-resistance code. We pull it, manage the inspection, and tell you first whether your address is even in the city — because a great many Houston-addressed homes are not.",
    glance: [
      { value: "Permit pulled", label: "and the inspection managed, inside city limits" },
      { value: "6 months", label: "how long a Houston roofing permit stays valid" },
      {
        value: "First check",
        label: "city limits or unincorporated county — it changes everything",
      },
    ],
    sections: [
      {
        heading: "The first question is not about your roof. It is about your address.",
        html: 'Greater Houston is two different regulatory worlds sharing one mailing address, and almost every roofing problem we untangle here starts with someone assuming they are in the wrong one. <strong>Inside the City of Houston limits</strong>, replacing a roof is permitted work through the Houston Permitting Center. <strong>In unincorporated Harris County</strong> — which surrounds the city on every side and covers a huge share of "Houston" addresses — there is no general residential building permit for a re-roof at all, and your deed restrictions or HOA govern instead. A Houston mailing address, a Houston zip code and a Houston school district tell you nothing definitive about which applies. We confirm the jurisdiction before we quote, because a job that starts on the wrong assumption either stalls at inspection or skips a permit it legally needed.',
      },
      {
        heading: "What the permit is actually for — and it is not revenue",
        html: "This is the part worth understanding, because it changes how you read a cheap bid. The permit exists to confirm the new roof meets <strong>current wind-resistance code</strong>. Houston builds to the 2021 International Residential Code, adopted effective 1 January 2024, and the fastening and edge-detail requirements in it are not optional opinions — they are what keeps the roof on in a named storm. The city issues a <strong>Residential Roofing Permit</strong> for a re-roof or overlay on a house, applied for with its Residential Re-Roofing Only Worksheet. The permit is valid for <strong>six months</strong>, requires an inspection and cannot be renewed, so it is not something to pull and sit on. Re-roofs also go through structural and floodplain review — unsurprising in this city. Plans are generally not required for a straightforward re-roof, though replacing rafters or joists changes that.",
      },
      {
        heading: "Why a roofer who skips the permit is telling you something",
        html: 'A permit costs a little money and some scheduling. Skipping it saves a contractor both, and it is invisible to you until it is not — at resale, at a future claim, or when the city finds out. More to the point: a roofer avoiding an inspection is a roofer who would rather nobody looked at the work. We pull it and manage the inspection as part of the job, and the permit number goes in your file with the rest of the paperwork. If a bid you are comparing is silent on permits, that is a question worth asking before price — <a href="/blog/what-should-a-roofing-estimate-include/">what a roofing estimate should include</a> has the rest of the list.',
      },
      {
        heading: "Houston has no typical roof, and that is the pricing problem",
        html: 'Most cities we work in have a recognisable housing stock. Houston does not. Inside the Loop there are early and mid-century bungalows with steep simple roofs, small footprints and decades of layered repairs. Further out there are sprawling suburban builds with complex rooflines, multiple valleys and far more penetrations to flash. Those two jobs share a name and almost nothing else, which is exactly why a per-square-foot number from the internet is useless here. What moves your price is square footage, pitch, how many layers come off, the number of valleys and penetrations, and what the decking looks like once it is bare. For market context rather than our quote, <a href="/blog/roof-replacement-cost-the-woodlands/">national cost data is here with sources attached</a>, and <a href="/roof-size-calculator">the roof size calculator</a> will get you the squares in a couple of minutes.',
      },
      {
        heading: "Full Gulf Coast exposure, with nothing in the way",
        html: 'Houston carries the whole regional threat list — tropical systems and hurricanes, spring and early-summer hail, and the 60-to-100-mph thunderstorm downbursts the National Weather Service documents across south-east Texas — plus relentless heat, UV and humidity that shorten asphalt shingle life and feed algae streaking. The May 2024 derecho put an estimated 100 mph through parts of the metro. That exposure is the reason the wind-resistance code exists, and the reason we specify to it rather than to the minimum. If a storm is what brought you here, start with <a href="/services/storm-damage">storm damage</a>, or <a href="/blog/what-hail-damage-looks-like-on-a-roof/">what hail damage actually looks like</a> if you are trying to work out whether you have any.',
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Houston?",
        a: "Inside the City of Houston limits, yes — the city issues a Residential Roofing Permit for a re-roof, applied for with its Residential Re-Roofing Only Worksheet, and we pull and manage it. If your Houston-addressed home is actually in unincorporated Harris County, there is no general county building permit for a re-roof and your deed restrictions or HOA govern instead. Confirming which applies to your address is the first thing we do.",
      },
      {
        q: "How long is a Houston roofing permit good for?",
        a: "Six months, with an inspection required and no renewal available. That is why we do not pull it until the job is genuinely scheduled — a permit that expires unused has to be started again.",
      },
      {
        q: "What is the permit actually checking?",
        a: "Principally that the new roof meets current wind-resistance code. Houston builds to the 2021 International Residential Code, adopted effective 1 January 2024. Re-roofs also go through structural and floodplain review. It is not a formality in a coastal wind zone — it is the difference between a roof that stays on and one that does not.",
      },
      {
        q: "My neighbour's roofer did not pull a permit. Does it matter?",
        a: "It can, in three places: at resale when a buyer's inspector asks, at a future insurance claim, and if the city finds out. The more useful way to read it, though, is as information about the contractor. Someone avoiding an inspection would rather nobody looked at the work closely.",
      },
      {
        q: "Can you tell me if I am inside the city limits?",
        a: "Yes, and we check before quoting rather than assuming. It is genuinely not obvious — plenty of homes with a Houston address, zip code and school district sit in unincorporated Harris County, and a few areas belong to other incorporated cities entirely.",
      },
      {
        q: "Do you work across all of Houston?",
        a: "We are based in Spring, north of the city off I-45, and work the north and north-west metro as our core area. Tell us the address and we will say plainly whether you are in our patch rather than driving an hour to quote a job we would struggle to service well.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Kingwood — the tree page. Kingwood's jurisdiction story is the same as
   * Houston's (annexed into the city in 1996), so leaning on permits here
   * would have produced a near-duplicate of /houston/roof-replacement. The
   * genuinely distinct thing about roofing in Kingwood is the canopy, so the
   * page is REPAIR and the canopy is the whole argument. Facts: Sheet 5
   * (annexation, Livable Forest) + Sheet 16 (Beryl/Imelda tree damage,
   * canopy loss, pine beetle), all attributed.
   */
  "kingwood/roof-repair": {
    citySlug: "kingwood",
    serviceTag: "repair",
    slug: "roof-repair",
    seoTitle: "Roof Repair in Kingwood, TX — Tree & Storm Damage",
    seoDescription:
      "Roof repair in Kingwood, where the trees are the main threat. Limb strikes, debris-packed valleys, shaded-slope algae — and what a canopy roof needs.",
    title: "Roof repair in Kingwood",
    summary:
      "Kingwood calls itself the Livable Forest and the roofs pay for it. Here the biggest threat to a roof is not hail — it is what is growing over it. Limb strikes, needle-packed valleys, permanently shaded slopes and the occasional whole pine coming down.",
    glance: [
      { value: "The canopy", label: "the main threat to a Kingwood roof, not hail" },
      { value: "Valleys first", label: "where debris load does its damage here" },
      { value: "Free", label: "documented inspection, with the photos yours either way" },
    ],
    sections: [
      {
        heading: "In Kingwood the trees are the weather",
        html: "Most of our service area worries about hail. Kingwood's roofs have a more constant adversary growing directly above them. This is a master-planned community built deliberately into dense pine and hardwood forest — the Livable Forest is not marketing, it is the design brief — and that canopy changes what goes wrong with a roof and in what order. Storms here are not primarily an impact event. They are a <em>debris</em> event. When Hurricane Beryl came through in 2024, regional tree damage was severe enough that a local replanting nonprofit, Trees for Kingwood, has been working to restore canopy lost to storms, disease and drought over decades; local news documented trees coming down onto Kingwood homes during both Beryl and, earlier, Imelda. Drought-weakened pines are the particular worry, because pine bark beetles move into stressed trees and a dead pine is a very different object falling than a live one.",
      },
      {
        heading: "What we actually find on a Kingwood roof",
        kind: "cards",
        bullets: [
          {
            lead: "Limb strikes, usually not where you'd look",
            text: "A branch does not have to puncture to matter. A limb that scrapes across a slope removes granules in a line and ages that strip of roof years in one afternoon. The damage reads as a scuff rather than a hole, which is why it gets missed from the ground.",
          },
          {
            lead: "Valleys packed with needles",
            text: "Valleys already carry the most water on a roof. Fill them with pine needles and leaf litter and they hold that water instead of moving it, backing it up under the shingle edges. This is the single most common repair we do under heavy canopy, and it is maintenance rather than failure.",
          },
          {
            lead: "Gutters that stopped being gutters",
            text: "A gutter packed solid with needles is a planter. Water overshoots the fascia, runs behind the gutter, and rots the board and the deck edge — damage that starts outside the roof and works inward.",
          },
          {
            lead: "Algae on the slopes that never see sun",
            html: 'Heavy shade keeps a roof damp, and damp is what <em>Gloeocapsa magma</em> wants. North-facing and tree-shaded slopes streak black here far faster than the sunny sides — <a href="/blog/black-streaks-on-roof-algae/">what that is, and what you must never do about it</a>.',
          },
          {
            lead: "Whole trees, occasionally",
            html: 'The rare one, and the one that is not a repair conversation. A pine through the roof is a structural job and an insurance job on the same day — start with <a href="/storm-response">emergency tarping</a>, which is free and carries no obligation.',
          },
        ],
      },
      {
        heading: "Repairs here are a maintenance rhythm, not an emergency",
        html: 'The useful mental shift for a canopy roof: most of what it needs is removal rather than replacement. Clear the valleys, clear the gutters, cut back what overhangs, and a Kingwood roof will reach a normal lifespan. Leave the debris and the same roof fails early for reasons that have nothing to do with the shingles. Extension guidance on home maintenance is consistent about this — trim overhanging branches, keep gutters clear — and in this community it is not generic advice, it is the main thing. If what you are weighing is whether the roof has gone past repairing, <a href="/blog/repair-or-replace-your-roof/">the four questions that settle it</a> are here.',
      },
      {
        heading: "The jurisdiction wrinkle people forget",
        html: 'Kingwood was annexed into the City of Houston at the end of 1996, so despite feeling like its own town it sits inside the city limits — which means City of Houston permitting applies. For a repair that is usually irrelevant. It matters the moment a repair becomes a replacement, because that is permitted work: <a href="/houston/roof-replacement">roof replacement in Houston</a> covers the permit, what it checks and why. Worth knowing before a contractor tells you no permit is needed because "this is Kingwood".',
      },
    ],
    faqs: [
      {
        q: "A branch hit my roof but nothing is leaking. Does it need looking at?",
        a: "Usually yes, and quickly. A limb strike frequently removes granules or fractures the shingle mat without breaking the surface, so there is nothing to see and nothing to leak — yet. That spot is now the weakest part of your roof, and it fails in the next storm rather than this one. We photograph it so you have a dated record either way.",
      },
      {
        q: "How often should a Kingwood roof be cleared?",
        a: "More often than roofs elsewhere, and the honest answer depends on what is overhanging. A heavily shaded lot under mature pines can pack its valleys and gutters in a single season; an open corner lot may go years. We tell you what yours actually needs rather than selling a schedule.",
      },
      {
        q: "Will my insurance cover a tree falling on my roof?",
        a: "Usually yes — a falling tree or limb is a covered peril under most policies, unlike ordinary wear. What matters is documenting the event properly before anything is moved or tarped. We photograph first, tarp second, and the packet is yours whether or not you file.",
      },
      {
        q: "Should I just cut the trees down?",
        a: "No, and we would not advise it. The canopy is why people live here, and a healthy tree is not the problem. What is worth doing is having an arborist look at dead or beetle-stressed pines and anything directly overhanging the roof. We will point out what is leaning over your roof; we are not qualified to tell you which tree is sick, and we will not pretend to be.",
      },
      {
        q: "Do I need a permit for a roof repair in Kingwood?",
        a: "Kingwood was annexed into the City of Houston in 1996, so City of Houston rules apply here. A minor repair generally is not permitted work, but a full replacement is — and plenty of people are surprised by that because Kingwood does not feel like Houston. We confirm what applies before any work is scheduled.",
      },
      {
        q: "Is algae on my shaded slope damaging the roof?",
        a: "The staining itself is mostly cosmetic, but the conditions causing it are not harmless, and the cleaning method matters enormously. Never let anyone pressure-wash an asphalt roof — it strips granules and will shorten the roof's life far more than the algae would.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Tomball — deliberately an INSPECTION page, not another permit page.
   * Tomball is incorporated and does require a roofing permit, but Houston
   * already owns the permit argument on this site; repeating it here would
   * have produced the duplication the uniqueness gate exists to catch. The
   * distinct thing about Tomball is that one small city contains two
   * completely different housing stocks. Facts: Sheet 5 + Sheet 16.
   */
  "tomball/roof-inspection": {
    citySlug: "tomball",
    serviceTag: "inspection",
    slug: "roof-inspection",
    seoTitle: "Roof Inspection in Tomball, TX — Free, 40 Photos",
    seoDescription:
      "Free documented roof inspection in Tomball. Historic Old Town or a new-build on the fringe, the roof tells a different story — and we check for both.",
    title: "Roof inspection in Tomball",
    summary:
      "Tomball is two housing markets inside one small city, and a roof inspection means something different in each. Forty photographs, the attic opened, written findings within 24 hours — and the report says what we found whether or not it sells us any work.",
    glance: [
      { value: "40 photos", label: "every slope, every penetration, labelled" },
      { value: "24 hours", label: "written findings in your inbox" },
      { value: "Two markets", label: "historic Old Town and the new-build fringe" },
    ],
    sections: [
      {
        heading: "One small city, two completely different roofs",
        html: "Tomball is unusual among the places we work: it packs two housing stocks with almost nothing in common into a few square miles. <strong>Historic Old Town</strong> is the original railroad and German-heritage district, with older houses, steeper and simpler roof geometry, decades of accumulated repairs by different hands, and framing that predates any modern code. <strong>The master-planned fringe</strong> — Amira, Rosehill Reserve and the newer developments pushing out into the surrounding unincorporated land — is builder-grade and new, where whole streets were roofed in the same month with the same material by the same crew. An inspection in Old Town is archaeology: establishing what was done, when, and by whom. An inspection on the fringe is quality control: checking whether what the builder's roofer did in a hurry was done properly. Same service, genuinely different job.",
      },
      {
        heading: "What we check on an older Tomball roof",
        kind: "cards",
        bullets: [
          {
            lead: "Layers, and how many",
            text: "Older houses accumulate roofs. Two or three layers changes the tear-off cost, loads the structure, and hides decking nobody has seen in thirty years. We establish this early because it changes every number that follows.",
          },
          {
            lead: "Previous repairs, and whether they were any good",
            text: "A long-lived roof carries a history of patches. Some are sound. Some are caulk over a problem. Telling them apart is most of the value of inspecting an older house.",
          },
          {
            lead: "Flashing at everything that was added later",
            text: "Chimneys, additions, porch tie-ins. On older homes the leak is usually where two eras of construction meet, not in the field of the roof.",
          },
          {
            lead: "What the framing and decking are doing",
            text: "Opening the attic matters more on an older house than anywhere else. Daylight, staining, sag and soft decking tell a story the shingles do not.",
          },
        ],
      },
      {
        heading: "And what we check on a new one",
        kind: "cards",
        bullets: [
          {
            lead: "Whether the builder's roofer rushed it",
            text: "Nail placement, starter course, ridge detail, valley method. Production roofing is fast by design, and fast is where shortcuts live. Most of it is fine. The parts that are not tend to be consistent across the street.",
          },
          {
            lead: "Ventilation that was sized to pass, not to work",
            html: 'A new roof over an under-vented attic fails early and the warranty may not care. We measure against the 1-in-300 benchmark — <a href="/blog/attic-ventilation-texas-roof-lifespan/">why that matters so much in this climate</a>.',
          },
          {
            lead: "Pipe boots, already",
            html: 'The one component that reliably fails long before the shingles around it — <a href="/blog/why-roofs-leak-around-pipe-boots/">and why the ceiling stain shows up nowhere near the hole</a>.',
          },
          {
            lead: "Whether your warranty is what you think it is",
            html: 'New-build roofs come with warranty paperwork most owners have never read. <a href="/warranty">How the tiers actually work</a> is worth ten minutes before you need to rely on it.',
          },
        ],
      },
      {
        heading: "Buying or selling in a market moving this fast",
        html: "Tomball is growing quickly, which means a lot of these inspections are transactional rather than maintenance. A general home inspection gives the roof a paragraph; a roof-specific inspection tells you what the next decade costs. For a buyer in an option period, a 24-hour written report with labelled photographs either clears the roof or produces a concrete repair number to negotiate against — far stronger than \"the roof looks older\". For a seller, a clean pre-listing roof report removes the scariest unknown from a buyer's inspection response before it becomes a price reduction. We are happy to be the second opinion on someone else's report, and we will tell you if we think they got it right.",
      },
      {
        heading: "If the inspection turns into work, Tomball has a step most of our area does not",
        html: 'Worth knowing before you plan around it. Tomball is an <strong>incorporated city with its own building department</strong>, and it requires a permit for residential roofing — currently a $50 residential roofing permit, applied for through the city\'s SmartGov online portal, with the Building Division on James Street. That is a genuine difference from most of our service area, where unincorporated county addresses need no re-roof permit at all. The catch is the same one as everywhere: a Tomball mailing address does not guarantee a Tomball city address, because the city is ringed by unincorporated Harris County where the county rule applies instead. We confirm which you are before scheduling, and we pull the permit when it is needed. The <a href="/blog/montgomery-county-roofing-permit-guide/">permit guide</a> covers how this varies across the region.',
      },
    ],
    faqs: [
      {
        q: "Is the inspection really free?",
        a: "Yes, and the forty-photo packet with written findings is yours whether you hire us or not. The honest reason it is free: an inspection is how we earn the work when work is warranted, and the documentation is how we prove it is. You are welcome to take the report and get other bids with it.",
      },
      {
        q: "My house is in Old Town and nobody knows when the roof was done. Can you tell?",
        a: "Usually, within a few years. Layer count, material type, the style of the flashing and the condition of the components date a roof reasonably well, and the attic adds a lot. We will give you a range and say how confident we are rather than inventing a date.",
      },
      {
        q: "My house is three years old. Is an inspection premature?",
        a: "Not at all, and it is often the most useful time. Builder roofs are installed fast, and the things that go wrong — nail placement, ventilation sizing, flashing detail — are cheap to fix at three years and expensive at fifteen. If we find nothing, that is a documented baseline for every future storm claim.",
      },
      {
        q: "Do you check the attic?",
        a: "Always. A roof inspection that never opens the attic hatch is half an inspection. Daylight at penetrations, water staining, decking condition and ventilation are all things you simply cannot see from on top.",
      },
      {
        q: "Will I need a permit if I go ahead with a replacement?",
        a: "Inside the Tomball city limits, yes — the city requires a residential roofing permit through its SmartGov portal, and we handle it. If your Tomball-addressed home is in the surrounding unincorporated Harris County, there is typically no re-roof permit and deed restrictions govern instead. We confirm which applies to your address first.",
      },
      {
        q: "Can you look at another roofer's inspection report?",
        a: "Yes, and we are glad to. Bring it. If they got it right we will say so — that is useful information for you and costs us nothing but an hour.",
      },
    ],
    dataCompleteness: "complete",
  },

  /**
   * Magnolia — the acreage page. Nothing else on this site addresses a roof
   * on a one-acre-plus wooded homesite, which brings genuinely different
   * problems: bigger and more complex roofs, site access and staging,
   * no city inspector, and metal as a realistic choice rather than an
   * upgrade. Facts: Sheet 5 (rural southern Montgomery County, named
   * communities, jurisdiction) + Sheet 1 (materials).
   */
  "magnolia/roof-replacement": {
    citySlug: "magnolia",
    serviceTag: "replacement",
    slug: "roof-replacement",
    seoTitle: "Roof Replacement in Magnolia, TX — Acreage & Custom",
    seoDescription:
      "Roof replacement on Magnolia acreage. Bigger roofs, wooded lots, long drives and no county permit — what changes when the house sits on its own land.",
    title: "Roof replacement in Magnolia",
    summary:
      "Magnolia is acreage country — one-acre-plus wooded homesites in High Meadow Ranch, Mostyn Manor, Sendera Ranch and Magnolia Reserve. Bigger, more complicated roofs on lots a truck has to get down. That changes the job, the material conversation and the schedule.",
    glance: [
      { value: "Acreage", label: "one-acre-plus wooded lots, not subdivision roofs" },
      { value: "No permit", label: "unincorporated southern Montgomery County" },
      { value: "Metal priced", label: "a real option here, not just an upsell" },
    ],
    sections: [
      {
        heading: "An acreage roof is not a subdivision roof",
        html: "Almost everything else we replace sits on a quarter-acre with a driveway, a street and a neighbour twenty feet away. Magnolia mostly does not. Southern Montgomery County here is rural and wooded — gated acreage communities like <strong>High Meadow Ranch and High Meadow Estates</strong> with one-acre-plus homesites, <strong>Sendera Ranch</strong> on one-to-five-acre tracts with bridle trails, <strong>Mostyn Manor</strong>, <strong>Magnolia Reserve</strong> and the newer <strong>Audubon</strong> development. The houses are custom more often than builder-spec, which means roofs with more planes, more valleys, dormers, porches and outbuildings that nobody counted in the original estimate. The practical consequence is that a per-square-foot figure from a subdivision job misprices an acreage roof badly, usually downward, and the gap turns up as a change order. We measure the whole property, including the detached garage and the barn if they are part of the job, before we give you a number.",
      },
      {
        heading: "Getting to the roof is part of the job here",
        kind: "steps",
        ordered: true,
        bullets: [
          {
            text: "We walk the access before scheduling. A long gravel drive, a tight gate, a cattle guard or a low branch over the approach decides what equipment can reach the house and how material gets staged.",
          },
          {
            text: "Material is dropped where it will not kill your lawn, your septic field or your drive. On acreage there is usually a right answer and several expensive wrong ones.",
          },
          {
            text: "Tear-off debris is contained, not scattered. Open land and wind are a bad combination, and a roof produces a startling amount of debris.",
          },
          {
            text: "Everything is magnet-swept before we leave — drive, paths, and the grass where anyone walks barefoot or a horse might. Nails in pasture are a genuine problem, not a tidiness point.",
          },
          {
            text: "If the property is gated or you are not home, we agree access in advance rather than calling you from the gate.",
          },
        ],
      },
      {
        heading: "Metal is a real conversation here, not an upsell",
        html: 'On a quarter-acre subdivision roof governed by an architectural committee, metal is usually ruled out before anyone prices it. On Magnolia acreage it is a legitimate option and frequently the right one: custom homes, long sightlines, no committee telling you what colour your roof may be, and owners who intend to be there in thirty years. It costs meaningfully more than asphalt up front and lasts far longer, so the maths depends almost entirely on how long you are staying. We will price both honestly and tell you which we would choose in your position — <a href="/services/metal-roofing">standing seam and stone-coated metal</a> covers what the difference actually buys. For most houses here architectural asphalt is still the sensible answer, and we will say so rather than steering you up.',
      },
      {
        heading: "Trees are the other half of the Magnolia story",
        html: 'These are wooded lots, and mature oaks and pines over a roof bring three things with them. <strong>Falling limbs</strong> in wind — the most common storm damage we see on acreage, and more consequential than hail on these properties. <strong>Debris load</strong> in valleys and gutters, which is where a roof actually starts to fail when nobody clears it. And <strong>deep shade</strong>, which keeps slopes damp and streaks them with algae years earlier than a sunny roof — <a href="/blog/black-streaks-on-roof-algae/">what that is and what not to do about it</a>. None of it means cutting your trees down. It means the roof needs a different maintenance rhythm, and it means we check valleys and shaded elevations hard rather than treating them as an afterthought.',
      },
      {
        heading: "Nobody is coming to inspect it, which raises the stakes",
        html: 'Most Magnolia-addressed property sits in <strong>unincorporated Montgomery County</strong>, where there is no county building permit for a re-roof. The small City of Magnolia itself is incorporated, so addresses genuinely inside the city limits are a different matter and we confirm before assuming. For most of our customers here that means no permit, no city inspector and no mandated inspection of the finished roof — which sounds like convenience and is really the opposite. Where nobody checks the work, the only thing standing between you and a bad roof is the contractor\'s own standards and what you can see in the photographs. That is why we document the decking before it is covered, not after, and why the written scope names the per-sheet decking rate up front. <a href="/blog/what-should-a-roofing-estimate-include/">What a roofing estimate should include</a> is the checklist we would want you holding us to.',
      },
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Magnolia?",
        a: "For most Magnolia-addressed homes — which are in unincorporated Montgomery County — no county building permit is required for a re-roof. The City of Magnolia itself is incorporated, so if your address is genuinely inside the city limits the answer may differ, and we confirm that before scheduling rather than assuming. Deed restrictions or a community's architectural guidelines may still apply either way.",
      },
      {
        q: "Will you quote the barn and the detached garage too?",
        a: "Yes, and we would rather measure them up front than discover them on day one. Outbuildings are a common reason an acreage quote from elsewhere comes in low and then grows. Tell us what you want included and the written price covers it.",
      },
      {
        q: "Is metal worth it on an acreage home?",
        a: "Sometimes genuinely yes, which is not something every roofer will tell you honestly in either direction. It costs meaningfully more up front and lasts far longer, so it turns almost entirely on how long you plan to stay. Without a committee dictating materials, you actually have the choice here. We price both and tell you which we would pick in your position.",
      },
      {
        q: "Can your trucks get down my drive?",
        a: "Usually, but we walk it before scheduling rather than finding out on the morning. Long gravel drives, gates, cattle guards and low branches all change how we stage material and what equipment comes. It is a five-minute conversation that prevents a wasted day.",
      },
      {
        q: "What about nails in the pasture?",
        a: "Taken seriously. We contain tear-off debris as we go rather than at the end, and magnet-sweep the drive, the paths and the grass before leaving. On a property with animals or bare feet this matters more than it does on a subdivision lot, and we treat it that way.",
      },
      {
        q: "How long does an acreage roof take?",
        a: "Longer than the one-day subdivision job, usually, because the roofs are bigger and more complex and access takes time. We give you a realistic schedule with the written estimate rather than an optimistic one, including what happens if the decking turns out worse than it looks.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const CITY_SERVICE_KEYS = Object.keys(CITY_SERVICES);

export function cityServicesForCity(citySlug: ServiceAreaSlug): CityService[] {
  return Object.values(CITY_SERVICES).filter((cs) => cs.citySlug === citySlug);
}
