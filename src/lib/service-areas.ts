import type { DataCompleteness } from "./quality-gate";
import type { ServiceFaq } from "./services";

export type ServiceAreaSlug =
  | "houston"
  | "spring"
  | "cypress"
  | "the-woodlands"
  | "kingwood"
  | "tomball"
  | "magnolia"
  | "conroe";

/** A real, completed local job. Only add entries that actually happened. */
export interface ServiceAreaProject {
  /** Short factual description — what was done, no invented numbers. */
  summary: string;
  /** Optional neighborhood the job was in. */
  neighborhood?: string;
  photo?: { src: string; alt: string };
}

/** A real customer testimonial. NEVER invent these (FTC violation + SEO risk). */
export interface ServiceAreaTestimonial {
  quote: string;
  author: string;
  /** Where it came from, e.g. "Google", so it can be verified. */
  source: string;
}

export interface ServiceArea {
  slug: ServiceAreaSlug;
  name: string;
  county: "Harris" | "Montgomery";
  /** Quick-reference named places (real). */
  landmarks: string[];
  /** Named neighborhoods used to prove genuine local presence (real). */
  neighborhoods: string[];
  /** Distinct hero subhead — named places, not "and surrounding areas". */
  intro: string;
  /** Meta description (~155 chars). Falls back to intro + boilerplate, which can truncate in SERPs. */
  seoDescription?: string;
  /** Factual local context (climate, housing stock, HOA density). No invented stats. */
  localContext: string;

  // --- Rich fields. Fill with REAL, researched/owner-provided data before
  //     flipping dataCompleteness to "complete". The quality gate requires these. ---
  /** True regional climate / storm pattern for this area. */
  climateNote?: string;
  /** True permitting / HOA / architectural-review notes for this area. */
  permitHoaNote?: string;
  /** Roof types commonly seen on local housing stock. */
  commonRoofTypes?: string[];

  /** Real, generally-true local Q&A. Feeds FAQPage JSON-LD on the city page. */
  faqs?: ServiceFaq[];

  // --- Real-world proof (recommended, not required to index). NEVER fabricate. ---
  projects?: ServiceAreaProject[];
  testimonials?: ServiceAreaTestimonial[];
  photos?: { src: string; alt: string }[];

  /**
   * Quality gate. Stays "draft" (→ noindex, excluded from sitemap) until a human
   * fills the rich fields with real content. See src/lib/quality-gate.ts.
   */
  dataCompleteness: DataCompleteness;
}

export const SERVICE_AREAS: Record<ServiceAreaSlug, ServiceArea> = {
  houston: {
    slug: "houston",
    name: "Houston",
    county: "Harris",
    landmarks: ["Memorial", "Spring Branch", "Champions", "Cypress-Fairbanks", "Heights"],
    neighborhoods: ["Memorial", "Spring Branch", "Champions", "Cypress-Fairbanks", "The Heights"],
    intro:
      "We serve Greater Houston from our Spring base — from mature inner-loop bungalows to sprawling suburban builds, and unlike the unincorporated suburbs, a re-roof inside the city limits is permitted work we handle.",
    seoDescription:
      "Roofing in Houston, TX — IKO roof replacement, repair, storm and insurance help across Memorial, Spring Branch, the Heights, Champions, and Cy-Fair. City of Houston roof permits handled.",
    localContext:
      "Greater Houston is the most varied roofing market we serve. Inner-loop neighborhoods like the Heights and parts of Memorial mix early- and mid-century homes — often with steeper pitches, additions, and complex flashing — while Spring Branch, Champions, and the Cypress-Fairbanks corridor run from 1970s subdivisions to newer suburban builds. The through-line is exposure: Houston sits squarely in the Gulf Coast storm corridor, and it's one of the few parts of our area where a re-roof inside the city limits requires a permit. We work Houston from our Spring base to the north.",
    climateNote:
      "Houston takes the full Gulf Coast hazard set. The National Weather Service documents hurricane and tropical-system exposure (Hurricane Beryl drove damaging gusts across the metro in 2024, and the May 2024 derecho produced ~100-mph thunderstorm winds through parts of the city), spring and early-summer hail, and relentless heat, UV, and humidity. That heat-and-humidity load dries out asphalt binder and feeds the blue-green algae streaking common on Gulf-Coast roofs — so Houston shingles tend to reach the early end of their rated life.",
    permitHoaNote:
      "Jurisdiction is the thing to get right in Houston. Inside the City of Houston limits, a roof replacement requires a permit through the Houston Permitting Center — the permit confirms the new roof meets current wind-resistance code, and we pull and manage it. If the address is in unincorporated Harris County instead, there's no general county building permit for a re-roof and deed restrictions/HOA govern. Many Houston-area neighborhoods also have their own architectural guidelines. We confirm which jurisdiction your address is in before we start.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard across Houston's suburban and updated inner-loop homes; IKO Dynasty",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing given metro hail exposure and any insurance discount your carrier offers",
      "Standing-seam metal and, on some historic inner-loop homes, steeper architectural applications",
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Houston?",
        a: "If your home is inside the City of Houston limits, yes — the city requires a roof permit through the Houston Permitting Center, and we handle it. The permit exists to confirm the roof meets current wind-resistance code. If your address is in unincorporated Harris County, there's typically no county building permit for a re-roof and your HOA governs instead. We confirm which applies to your address.",
      },
      {
        q: "My inner-loop home is older with a complex roof — can you handle it?",
        a: "Yes. Older Heights and Memorial-area homes often have steeper pitches, additions, and more flashing detail than a standard suburban roof — which is exactly the labor that determines whether a roof lasts. We document every detail in a 40-photo packet and price from your roof's actual size, pitch, and complexity.",
      },
      {
        q: "How does Houston's climate affect my roof?",
        a: "Hard. Hurricanes and tropical systems, spring hail, and constant heat/UV/humidity all shorten asphalt life here, and shaded, humid slopes streak with algae. We size ventilation on every replacement and install IKO shingles with a 130-mph wind warranty and a 10-year algae-resistance warranty.",
      },
    ],
    dataCompleteness: "complete",
  },
  spring: {
    slug: "spring",
    name: "Spring",
    county: "Harris",
    landmarks: [
      "Klein",
      "Gleannloch Farms",
      "Old Town Spring",
      "Louetta corridor",
      "Champions Forest",
    ],
    neighborhoods: [
      "Klein",
      "Gleannloch Farms",
      "Old Town Spring",
      "Champions Forest",
      "Augusta Pines",
      "Harmony",
    ],
    intro:
      "Spring is home base — off I-45 near Klein, Gleannloch Farms, and Champions Forest — so most jobs here are a short drive away, and we know which roofs in which subdivisions are coming due.",
    seoDescription:
      "Roofing in Spring, TX by a local company based here — IKO roof replacement, repair, and storm/insurance help across Klein, Gleannloch Farms, Champions, and Augusta Pines.",
    localContext:
      "Spring is our home base, straddling the Harris–Montgomery county line north of Houston along I-45. It's a patchwork of eras: Klein and Champions Forest built out largely in the 1970s and '80s, so those roofs are well into replacement age, while Gleannloch Farms, Augusta Pines, and Harmony are 1990s-through-2010s master-planned communities whose original builder roofs are now aging out in waves. Old Town Spring anchors the historic railroad district. Because we're based here, we can be on a Spring roof quickly after a storm — and we already know the covenant expectations street to street.",
    climateNote:
      "Spring sits squarely in the hail-and-wind corridor north of Houston. The National Weather Service Houston/Galveston office counts roughly 50–60 thunderstorm days a year regionally, about a third of them severe, and NCEI's storm records log repeated quarter-size-and-larger hail across the Spring/Klein area most years. Straight-line downbursts of 60–100+ mph are the routine threat, with the occasional tropical system on top — Hurricane Beryl (2024) drove damaging gusts across the metro. Add relentless summer heat and UV, and asphalt roofs here tend to reach the early end of their rated life.",
    permitHoaNote:
      "Most of Spring is unincorporated Harris County. The county's Office of the County Engineer permits things like septic systems, driveway culverts, and floodplain work — it does not run a general residential building-permit program — so a straightforward re-roof is typically governed by your HOA or deed restrictions rather than a county building permit. Many Spring subdivisions (Gleannloch Farms, Augusta Pines, and others) do have architectural guidelines on shingle color, so we handle the HOA submittal. Note that northern Spring extends into Montgomery County and a few incorporated pockets differ — we confirm your specific address before we assume anything.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard across Klein, Champions, and the master-planned communities; our IKO Dynasty line fits here",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing given the area's hail record and any insurance discount your carrier offers",
      "Standing-seam or stone-coated metal — chosen on some custom and acreage homes for longevity",
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Spring?",
        a: "For most Spring homes — which are in unincorporated Harris County — there's no county building permit for a re-roof; the county's permitting focuses on septic, driveways, and floodplain work, not residential roofs. Your HOA or deed restrictions usually govern shingle color instead, and we handle that paperwork. Because northern Spring reaches into Montgomery County and a few areas are incorporated, we confirm your exact address first.",
      },
      {
        q: "My Klein/Champions-area roof is original — is it time?",
        a: "Much of Klein and Champions Forest was built in the 1970s–80s, so a lot of those roofs are past or near the end of architectural-shingle life for this climate. We'll document the actual condition with photos and give you an honest remaining-life estimate — repair if it's sound, replace only if it's truly due.",
      },
      {
        q: "How fast can you get to my Spring home after a storm?",
        a: "Spring is our home base off I-45, so we're usually close by — we prioritize a documented, free inspection quickly after a hail or wind event, while the evidence is fresh and before any claim deadline pressure.",
      },
      {
        q: "Which shingle is best for Spring's hail exposure?",
        a: "We install IKO Dynasty (Class 3) as standard and IKO Nordic (Class 4, the highest impact rating) as the upgrade. Class 4 can help you qualify for an insurance premium discount where your carrier offers one — ask yours — though the rating isn't a hail guarantee and hail isn't covered by the shingle warranty.",
      },
    ],
    projects: [
      {
        summary:
          "Reopened a denied claim on a renovated Spring home: we documented covered storm damage, pursued the appraisal process after the initial denial, and secured a full roof replacement — managing the whole process. (Full story under Projects.)",
        photo: {
          src: "/projects/iko-roof-replacement-spring-tx.jpg",
          alt: "Aerial view of a completed IKO shingle roof replaced by Northvale Roofing on a Spring, TX home",
        },
      },
    ],
    dataCompleteness: "complete",
  },
  cypress: {
    slug: "cypress",
    name: "Cypress",
    county: "Harris",
    landmarks: ["Bridgeland", "Towne Lake", "Fairfield", "Cypress Creek Lakes", "Blackhorse Ranch"],
    neighborhoods: [
      "Bridgeland",
      "Towne Lake",
      "Fairfield",
      "Cypress Creek Lakes",
      "Blackhorse Ranch",
    ],
    intro:
      "Cypress is master-planned country — Bridgeland, Towne Lake, and Fairfield — where getting the architectural-review submittal right the first time is half the job.",
    seoDescription:
      "Roofing in Cypress (Cy-Fair), TX — IKO roof replacement, repair, storm and insurance help across Bridgeland, Towne Lake, Fairfield, and Blackhorse Ranch. ARC submittals handled.",
    localContext:
      "Cypress — Cy-Fair to locals — is unincorporated Harris County inside the City of Houston's extraterritorial jurisdiction, so it's not a city but a sprawling corridor of master-planned communities: Bridgeland, Towne Lake, Fairfield, Cypress Creek Lakes, and Blackhorse Ranch. Nearly all of them were built on Municipal Utility District (MUD) land with strict architectural-review committees that approve specific shingle lines and colors. Roof age runs the full range here — 1990s Fairfield roofs are aging out while Bridgeland is still adding phases — but the constant is that the ARC submittal, not a city permit, is what governs your re-roof.",
    climateNote:
      "Cypress carries the same NW-Houston Gulf Coast exposure the National Weather Service documents — hurricane and tropical-system risk, spring and early-summer hail, and 60–100+ mph thunderstorm downbursts, on top of relentless heat and humidity. The area's many man-made lakes and open, newer subdivisions offer little wind obstruction, so edge and ridge detailing matters, and the heat/UV/humidity load shortens asphalt-shingle life and feeds algae streaking.",
    permitHoaNote:
      "Because Cypress is unincorporated (in Houston's ETJ, not its city limits), there's no city building permit for a re-roof — but the architectural-review committee is strict. Communities like Bridgeland and Towne Lake approve specific shingle lines and colors, and getting that submittal right the first time avoids a costly re-do. We prepare and file the ARC paperwork with compliant IKO color samples as part of the job, and confirm your community's current requirements before ordering material.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the ARC-approved standard across the master-planned communities; IKO Dynasty in approved colors",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing for hail exposure and any insurance discount, in the same muted palettes",
      "Standing-seam or stone-coated metal on select custom homes where the ARC permits it",
    ],
    faqs: [
      {
        q: "Do I need a permit to re-roof in Cypress?",
        a: "Cypress is unincorporated Harris County (inside Houston's ETJ, not its city limits), so there's typically no city building permit for a re-roof. What governs instead is your community's architectural-review committee — and in master-planned Cypress, those are strict about shingle line and color. We handle that ARC submittal.",
      },
      {
        q: "Will my Bridgeland/Towne Lake HOA approve my shingle and color?",
        a: "That's exactly what the ARC process decides, and it's the step people most often get wrong. We bring IKO color samples that fit your community's approved palette and file the submittal for you, so your choice clears review the first time and we don't order material before approval.",
      },
      {
        q: "My Fairfield roof is from the '90s — is it due?",
        a: "Quite possibly — a lot of Fairfield's original builder roofs are now past typical architectural-shingle life for this climate. We'll document the actual condition and give you an honest remaining-life estimate before recommending replacement.",
      },
    ],
    dataCompleteness: "complete",
  },
  // The Woodlands — Phase 2 flagship. Facts below are sourced (NWS Houston/Galveston,
  // U.S. Census, The Woodlands Township Standards & RDRC pages). Marked "complete";
  // the quality gate still holds it noindex until real NAP is entered (auto-publishes
  // then). NEEDS OWNER: real local projects/testimonials/photos to strengthen it.
  // Verify the specific accepted-materials list against the official 2024 Residential
  // Development Standards PDF before treating it as exhaustive.
  "the-woodlands": {
    slug: "the-woodlands",
    name: "The Woodlands",
    county: "Montgomery",
    landmarks: [
      "Creekside Park",
      "Grogan's Mill",
      "Cochran's Crossing",
      "Sterling Ridge",
      "Alden Bridge",
      "Town Center",
    ],
    neighborhoods: [
      "Grogan's Mill",
      "Panther Creek",
      "Cochran's Crossing",
      "Indian Springs",
      "Alden Bridge",
      "College Park",
      "Sterling Ridge",
      "Carlton Woods",
      "Creekside Park",
    ],
    intro:
      "From Grogan's Mill to Creekside Park, we work The Woodlands village by village — and we know the Township's roofing Standards before we ever get on a ladder.",
    seoDescription:
      "Roofing in The Woodlands, village by village — Township Standards handled, RDRC paperwork filed. Free inspection with a same-day written estimate.",
    localContext:
      "The Woodlands is a master-planned community founded by George P. Mitchell and dedicated in 1974, mostly in Montgomery County north of Houston with Creekside Park extending into Harris County, and home to roughly 114,000 residents as of the 2020 census. It's built around named villages — Grogan's Mill (the original), Cochran's Crossing, Panther Creek, Alden Bridge, Sterling Ridge, and Creekside Park among them — and governed by The Woodlands Township through Restrictive Covenants and village Residential Design Review Committees that set roofing standards favoring muted, natural-harmonizing materials. The heavily wooded, humid-subtropical setting plus exposure to severe spring storms makes durable, Standards-compliant roofing a practical concern here.",
    climateNote:
      "The Woodlands sits in southeast Texas's humid-subtropical climate. The National Weather Service Houston/Galveston office reports the region averages roughly 50–60 thunderstorm days a year, with about a third producing severe weather — hail an inch or larger, or wind gusts above 58 mph — and local downbursts can drive winds from 60 to over 100 mph. The Gulf Coast location also exposes the area to tropical systems. Sustained heat, intense UV, and humidity dry out asphalt binder over time, driving granule loss and brittleness.",
    permitHoaNote:
      "Most of The Woodlands is unincorporated Montgomery County, which does not require a building permit for a residential roof replacement — reroof rules are driven instead by covenants. The Woodlands Township administers the community Standards (responsibility moved from the original associations to the Township in 2010), and each village has a Residential Design Review Committee. Re-roofing is exempt from the usual survey/application paperwork, but materials and colors must still comply with the published Standards, which favor muted, non-glossy roofing; the Township keeps an approved materials-and-color compliance list (Covenant Administration, 281-210-3800). We confirm your village's current requirements before ordering material.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the dominant material on local housing stock and permitted as composition shingle under Township Standards",
      "Standing-seam or stone-coated metal — accepted under Standards (must be non-glossy), chosen for longevity and storm/UV resistance",
      "Concrete/clay tile or slate — accepted on higher-end and custom homes, common in luxury villages like Carlton Woods",
    ],
    faqs: [
      {
        q: "Who approves roof replacements in The Woodlands?",
        a: "Your village's Residential Design Review Committee (or designated Township staff), under the Township's 2024 Residential Development Standards — prior written approval is required for all roof replacement, and roofing repairs need a permit at the time of repair. We prepare and file the application through the Township's Civic Access Portal on every job.",
      },
      {
        q: "Is there a county permit for re-roofing in The Woodlands?",
        a: "No — unincorporated Montgomery County's own FAQ states residential properties don't require a permit for a roof, and most of The Woodlands is unincorporated Montgomery County. The covenant approval is the binding requirement. (Creekside Park sits in Harris County; the covenant process is the same.)",
      },
      {
        q: "Which roofing materials do the Township Standards allow?",
        a: "Tile, slate, composition shingles, stone-coated or standing-seam metal, and cement-fiberboard — in muted colors without pattern that harmonize with the natural landscape, and metal must be non-glossy. We bring compliant samples so your selection clears review the first time.",
      },
      {
        q: "How long does the RDRC approval take?",
        a: "The Standards give committees up to 45 days to act on a complete application — most come back sooner, and staff-approval or pre-approval paths apply to some items. We file early and never order material before approval.",
      },
      {
        q: "Do you cover every village in The Woodlands?",
        a: "Yes — Grogan's Mill, Panther Creek, Cochran's Crossing, Indian Springs, Alden Bridge, College Park, Sterling Ridge, Carlton Woods (behind the gates — we confirm the current application and access requirements before scheduling), and Creekside Park. Each village has its own page covering roof ages and covenant specifics.",
      },
    ],
    // Real completed project (full story at /projects). Never fabricated.
    projects: [
      {
        summary:
          "Reopened a denied hail claim: after another contractor missed the adjuster meeting, we re-inspected, documented one-inch hail damage, met the adjuster on-site, and secured a full roof replacement — then added a solar-powered attic fan. (See the full story under Projects.)",
        photo: {
          src: "/projects/iko-roof-replacement-the-woodlands-tx.jpg",
          alt: "Aerial view of a completed IKO shingle roof replaced by Northvale Roofing on a Woodlands, TX home",
        },
      },
    ],
    dataCompleteness: "complete",
  },
  kingwood: {
    slug: "kingwood",
    name: "Kingwood",
    county: "Harris",
    landmarks: ["Kings Point", "Bear Branch", "Elm Grove", "Kings Forest", "Trailwood"],
    neighborhoods: [
      "Kings Point",
      "Bear Branch",
      "Elm Grove",
      "Kings Forest",
      "Trailwood",
      "Greentree",
    ],
    intro:
      'Kingwood — the "Livable Forest" of far northeast Houston. Its tree canopy is beautiful and brutal on roofs, and because Kingwood is part of the City of Houston, a re-roof here is permitted work.',
    seoDescription:
      "Roofing in Kingwood, TX (the Livable Forest) — IKO roof replacement, repair, storm and insurance help across Kings Point, Bear Branch, Elm Grove, and Kings Forest. City permits handled.",
    localContext:
      'Kingwood is a ~14,000-acre master-planned community northeast of downtown, marketed for decades as "The Livable Forest" — and that dense tree canopy defines roofing here. Its villages, from Kings Point and Bear Branch to Elm Grove and Kings Forest, largely date to earlier build eras, so many roofs are well into replacement age. Two things set Kingwood apart from our other suburbs: it was annexed into the City of Houston at the end of 1996, so City of Houston roof permits apply; and it flooded severely during Hurricane Harvey in 2017, which put a lot of local attention on doing roof and building work correctly.',
    climateNote:
      "Kingwood's tree canopy is the local roofing story. Overhanging limbs abrade and strike roofs in every wind event, leaves and debris pack valleys and gutters (a direct leak path), and heavy shade keeps north-facing slopes damp — accelerating the blue-green algae streaking common on Gulf-Coast roofs. On top of that, Kingwood carries the region's standard hail and tropical-system exposure documented by the National Weather Service, and its Harvey flooding history is a reminder that water intrusion here compounds fast.",
    permitHoaNote:
      "Kingwood was annexed into the City of Houston on December 31, 1996, so a roof replacement here requires a City of Houston permit through the Houston Permitting Center — which we pull and manage. On top of the city permit, Kingwood's village associations have their own architectural guidelines on shingle color, so we prepare that submittal too. We confirm your village's current requirements before ordering material.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard across Kingwood's villages; IKO Dynasty in muted, tree-friendly colors",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing given hail plus the limb-strike risk under the canopy",
      "Standing-seam or stone-coated metal on some custom homes",
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Kingwood?",
        a: "Yes — Kingwood was annexed into the City of Houston in 1996, so a re-roof requires a City of Houston permit through the Houston Permitting Center. We pull and manage it, and we also handle your village association's architectural submittal for shingle color.",
      },
      {
        q: "The trees over my Kingwood roof are a problem — what should I do?",
        a: "In the Livable Forest, watch three things: overhanging limbs that abrade and strike the roof in wind (trim them back), debris packing valleys and gutters (a common leak path we clear and inspect), and heavy shade that keeps slopes damp and algae-streaked. The IKO shingles we install carry a 10-year algae-resistance warranty, and we never pressure-wash asphalt.",
      },
      {
        q: "My village roof is original — is it time to replace?",
        a: "Many Kingwood villages date to earlier build eras, so a lot of roofs are past typical architectural-shingle life for this climate — especially under heavy shade and debris. We'll document the condition with photos and give you an honest remaining-life estimate before recommending replacement.",
      },
    ],
    dataCompleteness: "complete",
  },
  tomball: {
    slug: "tomball",
    name: "Tomball",
    county: "Harris",
    landmarks: [
      "Rose Hill",
      "Lakewood Crossing",
      "Willowcreek Ranch",
      "Vintage Oaks",
      "Downtown Tomball",
    ],
    neighborhoods: [
      "Rose Hill",
      "Lakewood Crossing",
      "Willowcreek Ranch",
      "Vintage Oaks",
      "Old Town Tomball",
    ],
    intro:
      "We cover Tomball up FM 2920 from Spring — from historic Old Town to fast-growing new subdivisions — and inside the city limits a re-roof is permitted work we handle.",
    seoDescription:
      "Roofing in Tomball, TX — IKO roof replacement, repair, storm and insurance help across Old Town Tomball, Willowcreek Ranch, Rose Hill, and Vintage Oaks. City of Tomball permits handled.",
    localContext:
      "Tomball blends a historic railroad-and-German-heritage Old Town with a fast wave of new master-planned growth on its fringes (Willowcreek Ranch, Rose Hill, and newer communities like Amira and Rosehill Reserve). That gives it two roof populations: older homes near downtown, and builder-grade shingle roofs in newer subdivisions that reach end-of-life in waves. Tomball is an incorporated city in Harris County near the Montgomery line, so — unlike the surrounding unincorporated areas — a re-roof inside the city limits is permitted work. We reach Tomball up FM 2920 from our Spring base.",
    climateNote:
      "Tomball sees the same NW-Houston Gulf Coast exposure the National Weather Service and NCEI document — spring and early-summer hail, 60–100+ mph thunderstorm downbursts, occasional tropical systems, and heavy heat, UV, and humidity. Newer open subdivisions on the city's growing edge offer little wind obstruction, so edge and ridge detailing matters, and the heat/humidity load shortens asphalt-shingle life and drives algae streaking.",
    permitHoaNote:
      "The City of Tomball requires a permit before construction work starts, including a residential roofing permit (applications run through the city's online SmartGov portal), and the city has adopted current building/energy codes. We pull and manage that permit inside the city limits. Homes on the surrounding unincorporated fringe follow the county rule (no county re-roof permit) with HOA guidelines instead — so we confirm which jurisdiction your address is in before we start.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard across new Tomball subdivisions; IKO Dynasty",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing for hail exposure and any insurance discount",
      "Standing-seam metal on some Old Town and custom/acreage homes",
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Tomball?",
        a: "If your home is inside the City of Tomball limits, yes — the city requires a roofing permit before work starts (submitted through its online portal), and we pull and manage it. If your Tomball-addressed home is on the unincorporated fringe, there's typically no county re-roof permit and your HOA governs. We confirm which applies to your address.",
      },
      {
        q: "My newer Tomball subdivision roof is builder-grade — how long will it last?",
        a: "Builder-grade roofs in the fast-growing Tomball subdivisions commonly need attention as they reach the end of their service life, sooner in this heat. We document the actual condition and give you an honest remaining-life estimate — and when it's time, we install IKO with a 130-mph wind warranty and 15-year non-prorated Iron Clad coverage.",
      },
      {
        q: "Which shingle is best for Tomball's storm exposure?",
        a: "We install IKO Dynasty (Class 3) as standard and IKO Nordic (Class 4) as the upgrade. On open, newer subdivisions that take unobstructed wind and hail, Nordic's top impact rating is worth pricing — and Class 4 can help you qualify for an insurance premium discount where your carrier offers one.",
      },
    ],
    dataCompleteness: "complete",
  },
  magnolia: {
    slug: "magnolia",
    name: "Magnolia",
    county: "Montgomery",
    landmarks: [
      "High Meadow Ranch",
      "Mostyn Manor",
      "FM 1488 corridor",
      "Audubon",
      "Magnolia Reserve",
    ],
    neighborhoods: [
      "High Meadow Ranch",
      "Mostyn Manor",
      "Magnolia Ridge",
      "Audubon",
      "Sendera Ranch",
    ],
    intro:
      "Magnolia is acreage country — one-acre-plus wooded homesites, bigger and more complex roofs, and tall pines and oaks that drop limbs and shade in every storm.",
    seoDescription:
      "Roofing in Magnolia, TX for acreage and custom homes — IKO roof replacement, repair, storm and insurance help across High Meadow Ranch, Audubon, Mostyn Manor, and the FM 1488 corridor.",
    localContext:
      "Magnolia is the rural, wooded edge of southern Montgomery County along the FM 1488 corridor. Where The Woodlands is dense villages, Magnolia is acreage: one-acre-plus homesites in communities like High Meadow Ranch and High Meadow Estates (gated, heavily treed), newer master-planned Audubon, Mostyn Manor, Magnolia Reserve, and 1-to-5-acre spreads like Sendera Ranch. That means bigger, more complex roofs — more valleys, dormers, and steep pitches — and a canopy of tall pines and oaks directly overhead. Those trees are the local story: they drop limbs in wind, pile debris in valleys, and shade north-facing slopes that then streak with algae.",
    climateNote:
      "Magnolia catches the same Montgomery County hail and thunderstorm-wind exposure documented by the National Weather Service and NCEI — roughly 50–60 thunderstorm days a year regionally, about a third severe, with quarter-size-and-larger hail logged across the county most years. What's different here is the tree canopy: mature pines and oaks over acreage lots turn a wind event into a falling-limb-and-debris event, and heavy shade keeps roofs damp longer, accelerating the blue-green algae streaking common on Gulf-Coast roofs. Open stretches along FM 1488 also take the full force of straight-line winds.",
    permitHoaNote:
      "Most Magnolia-addressed property is unincorporated Montgomery County, which — like the unincorporated parts of The Woodlands — does not require a county building permit for a residential re-roof; deed restrictions and HOAs govern instead. Gated and master-planned communities such as High Meadow Ranch and Audubon do have architectural guidelines on materials and color, and we prepare that submittal. The small City of Magnolia itself is incorporated, so if your address is inside the city limits the rules differ — we confirm before ordering material.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard on most Magnolia homes; IKO Dynasty in muted, tree-friendly colors",
      "Class 4 impact-resistant asphalt (IKO Nordic) — a common upgrade on exposed acreage lots given hail and falling-limb risk",
      "Standing-seam or stone-coated metal, tile, and slate — seen on larger custom and estate homes in the acreage communities",
    ],
    faqs: [
      {
        q: "Do I need a permit to re-roof in Magnolia?",
        a: "For most Magnolia homes — unincorporated Montgomery County — there's no county building permit for a re-roof; your HOA or deed restrictions govern shingle and color, and we handle that submittal. If your address is inside the City of Magnolia limits, city rules apply, so we confirm your exact jurisdiction first.",
      },
      {
        q: "The trees over my roof cause problems — what should I watch for?",
        a: "On Magnolia's wooded acreage, three things: falling and abrading limbs in wind (trim back overhang), debris packing into valleys and behind chimneys (a leak path we clear and inspect), and heavy shade that keeps north slopes damp and algae-streaked. The IKO shingles we install carry a 10-year algae-resistance warranty, and we never pressure-wash asphalt — ARMA warns it causes damage.",
      },
      {
        q: "My home is on acreage with a big, complex roof — does that change the job?",
        a: "Yes — more valleys, dormers, and steep pitch mean more flashing detail and more of the labor that actually determines whether a roof lasts. We price every roof from its own size, pitch, and complexity and put the exact number in writing; a large custom roof simply has more of the details we document in your 40-photo packet.",
      },
      {
        q: "Is a Class 4 shingle worth it out here?",
        a: "For exposed acreage lots that see both hail and falling-limb impacts, IKO Nordic's Class 4 rating is worth pricing — and it can qualify you for an insurance premium discount where your carrier offers one. It isn't a hail guarantee, and hail isn't covered by the shingle warranty, but the impact resistance and any discount often pencil out.",
      },
    ],
    projects: [
      {
        summary:
          "Helped a Magnolia homeowner choose the right roof, not the cheapest — comparing IKO Dynasty and Nordic, colors, and ventilation to finish a major renovation. (Full story under Projects.)",
        photo: {
          src: "/projects/iko-roof-replacement-magnolia-tx.jpg",
          alt: "Aerial view of a completed IKO shingle roof replaced by Northvale Roofing on a Magnolia, TX home",
        },
      },
    ],
    dataCompleteness: "complete",
  },
  conroe: {
    slug: "conroe",
    name: "Conroe",
    county: "Montgomery",
    landmarks: ["Lake Conroe", "April Sound", "Bentwater", "Grand Central Park", "Downtown Conroe"],
    neighborhoods: [
      "April Sound",
      "Bentwater",
      "Grand Central Park",
      "Graystone Hills",
      "Longmire",
    ],
    intro:
      "Conroe spans gated Lake Conroe communities, new master-planned neighborhoods, and older inland homes — and unlike most of our area, roofs inside the city limits are permitted work.",
    seoDescription:
      "Roofing in Conroe, TX — IKO roof replacement, repair, storm and insurance help across Lake Conroe communities (April Sound, Bentwater), Grand Central Park, and inland Conroe. City permits handled.",
    localContext:
      "Conroe is the Montgomery County seat, and it's really three roofing markets in one. On Lake Conroe, gated communities like April Sound and Bentwater sit on open water, where sustained wind and humidity work harder on fasteners, sealant, and ridge caps than on a sheltered inland lot. Around I-45 and the Grand Parkway, new master-planned neighborhoods like Grand Central Park are filling in with builder roofs. And across older inland Conroe — Graystone Hills, Longmire, and the neighborhoods near downtown — you'll find roofs of every era. The wrinkle that sets Conroe apart from the rest of our service area: much of it is inside an incorporated city with a building department, so re-roofs there are permitted work.",
    climateNote:
      "Conroe carries the standard Montgomery County storm exposure the National Weather Service and NCEI document — roughly 50–60 thunderstorm days a year regionally, about a third severe, with quarter-size-and-larger hail logged across the county most years, plus occasional tropical systems. Lake Conroe adds a local twist: roofs facing the open water get sustained, less-obstructed wind that stresses edges and ridge caps, and the lake humidity keeps shingles damp — accelerating the algae streaking and the sealant and fastener wear we see on waterfront homes.",
    permitHoaNote:
      "Conroe is the exception in our area: the City of Conroe requires a building permit for residential work inside the city limits, administered by its Building Inspections & Permits Department (permit applications run through the city's OpenGov portal). We pull and manage that permit as part of the job. If your address has a Conroe mailing address but is actually in unincorporated Montgomery County, the county doesn't require a re-roof permit — your HOA governs instead — so the first thing we confirm is which jurisdiction you're in. Lake communities like April Sound and Bentwater also have their own architectural review.",
    commonRoofTypes: [
      "Architectural (dimensional) asphalt shingle — the standard across inland and master-planned Conroe; IKO Dynasty in Standards-friendly colors",
      "Class 4 impact-resistant asphalt (IKO Nordic) — worth pricing for both hail and the sustained wind on exposed lakefront lots",
      "Standing-seam or stone-coated metal — chosen on some lakefront and custom homes for wind and longevity",
    ],
    faqs: [
      {
        q: "Do I need a permit to replace my roof in Conroe?",
        a: "If your home is inside the City of Conroe limits, yes — the city requires a building permit for a re-roof, and we pull and manage it (applications go through the city's OpenGov portal). If your Conroe-addressed home is actually in unincorporated Montgomery County, there's no county re-roof permit and your HOA governs instead. We confirm which applies to your address before we start.",
      },
      {
        q: "My home is on Lake Conroe — does the waterfront change anything?",
        a: "It does. Open-water wind hits edges, rakes, and ridge caps harder than on a sheltered lot, and lake humidity keeps roofs damp, which speeds algae streaking and sealant/fastener wear. We pay extra attention to edge sealing and ventilation on lakefront roofs, and the IKO shingles we install carry a 130-mph wind warranty and a 10-year algae-resistance warranty.",
      },
      {
        q: "Which shingle holds up best around Conroe?",
        a: "We install IKO Dynasty (Class 3) as standard and IKO Nordic (Class 4) as the upgrade. For exposed lakefront and hail-prone lots, Nordic's polymer-modified mat and top impact rating are worth pricing — and Class 4 can help you qualify for an insurance premium discount where your carrier offers one.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const SERVICE_AREA_SLUGS = Object.keys(SERVICE_AREAS) as ServiceAreaSlug[];
