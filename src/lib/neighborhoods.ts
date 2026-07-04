import type { DataCompleteness } from "./quality-gate";
import type { ServiceAreaSlug, ServiceAreaProject, ServiceAreaTestimonial } from "./service-areas";
import type { ServiceFaq } from "./services";

/**
 * Neighborhood (village) landing pages — the deepest level of the local
 * hub-and-spoke: city hub → service-in-city spokes → neighborhood pages.
 *
 * HARD RULE: every record must be distinct on the fields that matter
 * (development era, housing stock, covenant/design-review specifics). The
 * quality gate (evaluateNeighborhood) treats those as hard requirements, so a
 * name-swapped record can never index. Facts must be sourced — see
 * docs/research-facts.md for the citations behind each field.
 */
export interface Neighborhood {
  slug: string;
  name: string;
  citySlug: ServiceAreaSlug;
  county: "Harris" | "Montgomery";
  /** Unique SEO <title> (brand appended by the layout). */
  seoTitle: string;
  /** Unique meta description, ≤160 chars. */
  seoDescription: string;
  /** Distinct hero subhead. */
  intro: string;
  /** Sourced local context — what makes roofing HERE different. */
  localContext: string;
  /** When the village opened / built out (sourced) — drives roof-age framing. */
  developmentEra?: string;
  /** Distinct housing-stock note (styles, price tier, roof types). */
  housingStock?: string;
  /** Covenant / design-review specifics for re-roofing in this village. */
  hoaNote?: string;
  /** Named places inside the village (real). */
  landmarks?: string[];
  faqs?: ServiceFaq[];

  // --- Real-world proof (recommended, not required to index). NEVER fabricate. ---
  projects?: ServiceAreaProject[];
  testimonials?: ServiceAreaTestimonial[];
  photos?: { src: string; alt: string }[];

  /** Quality gate — stays "draft" (noindex, out of sitemap) until real. */
  dataCompleteness: DataCompleteness;
}

/**
 * The Woodlands villages. Facts sourced in docs/research-facts.md (Sheet 2:
 * Township 2024 Residential Development Standards, Community Impact,
 * visitthewoodlands.com, Township village pages). Opening years with
 * conflicting sources are softened per the UNVERIFIED list.
 */
export const NEIGHBORHOODS: Record<string, Neighborhood> = {
  "grogans-mill": {
    slug: "grogans-mill",
    name: "Grogan's Mill",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Grogan's Mill Roofing — Replacement & Repair | The Woodlands",
    seoDescription:
      "Roofing in Grogan's Mill, The Woodlands' original 1974 village: replacement, repair, and RDRC-compliant re-roofs on the community's oldest housing stock.",
    intro:
      "Grogan's Mill is where The Woodlands began — and where its oldest roofs live. We work the village's mature streets with the Township's roofing Standards on file and the RDRC paperwork handled for you.",
    localContext:
      "Grogan's Mill opened in 1974 as the first village of The Woodlands (development began in fall 1972), named after the Grogan-Cochran Lumber Company whose sawmill was the last to operate in the area. Local counts put the village at roughly 5,100 homes across some 22 neighborhoods, wrapped around The Woodlands Resort, the original Country Club courses, and Sawmill Park. Five decades of tree growth means real canopy over many rooflines here: constant needle-and-leaf load in valleys and gutters — debris the Township's own covenants require owners to keep off their roofs — plus the shade and humidity that feed algae streaking on north-facing slopes.",
    developmentEra:
      "First village of The Woodlands — development began fall 1972, grand opening 1974. The community's oldest housing stock: most Grogan's Mill homes are on at least their second or third roof, and re-roof decisions here are usually about the whole system (decking, flashing, ventilation), not just shingles.",
    housingStock:
      "Established 1970s–1980s homes on mature, heavily-wooded lots — smaller-footprint originals alongside remodeled and expanded houses. Composition shingle dominates, with steep gables and long valleys that collect pine debris. On roofs this age, we inspect decking condition and flashing details as carefully as the shingles themselves.",
    hoaNote:
      "Grogan's Mill re-roofs go through The Woodlands Township's covenant process: the Residential Design Review Committee (or designated staff) must approve all roof replacement before work begins, per the Township's 2024 Residential Development Standards. Colors must be muted and harmonize with the natural landscape; acceptable materials include composition shingles, tile, slate, stone-coated or standing-seam metal (non-glossy). No property survey is required for a re-roof, and gutters, downspouts, and color-compatible roof vents are pre-approved. We prepare and submit the application through the Township's Civic Access Portal as part of the job.",
    landmarks: [
      "The Woodlands Resort",
      "The Woodlands Country Club",
      "Sawmill Park",
      "Tamarac Park",
      "Lake Harrison",
    ],
    faqs: [
      {
        q: "Do I need approval to replace my roof in Grogan's Mill?",
        a: "Yes. The Woodlands Township's Residential Development Standards require prior written approval from the village's Residential Design Review Committee (or designated staff) for all roof replacement — even like-for-like. Roofing repair also requires a permit at the time of repair or replacement. We handle the Civic Access Portal application and material submittal for you.",
      },
      {
        q: "My Grogan's Mill home still has its original or second roof. Repair or replace?",
        a: "On 1970s–1980s homes we look past the shingles: decking condition, flashing, and attic ventilation drive the honest answer. If a targeted repair buys you years, we'll say so in writing — and if the roof is at end of life, we'll show you the photos that prove it.",
      },
      {
        q: "What roof colors are allowed in Grogan's Mill?",
        a: "The Township's Standards require roofing that is muted in shade, without color pattern, harmonizing with the natural landscape. We bring sample boards from the compliant color ranges and handle the RDRC submittal, so your selection is approved before material is ordered.",
      },
      {
        q: "Does all the tree cover in Grogan's Mill actually hurt a roof?",
        a: "Mature canopy drops needles and leaves into valleys and gutters year-round — debris the Township covenants require owners to remove from roofs — and shaded, humid slopes are where we most often find algae streaking and lingering moisture. An annual inspection and clean valleys go a long way here.",
      },
    ],
    dataCompleteness: "complete",
  },

  "panther-creek": {
    slug: "panther-creek",
    name: "Panther Creek",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Panther Creek Roofing — Lakeside Village of The Woodlands",
    seoDescription:
      "Roof replacement and repair in Panther Creek, The Woodlands' mid-1970s lakeside village. Township-compliant materials, RDRC paperwork handled.",
    intro:
      "Panther Creek runs from Lake Woodlands' western shore through some of the community's most established streets. We know the village's roof stock — and the Township paperwork every re-roof here needs.",
    localContext:
      "Panther Creek was the second village of The Woodlands, opened in the mid-1970s and named for the creek that winds through the village and feeds Lake Woodlands. It begins at the lake's western shore — Northshore Park and Southshore Park anchor the waterfront — and the village's thirteen parks and Country Club fairways thread between neighborhoods that have had decades to grow real tree cover. Roofs here are on their second or third generation, and the village mixes carefully-maintained originals with extensively remodeled homes, so two houses on the same street can need very different roofing conversations.",
    developmentEra:
      "Second village of The Woodlands, opened in the mid-1970s — housing stock nearly as mature as Grogan's Mill's. Most homes have been re-roofed at least once; the current question is usually whether the last re-roof was done well.",
    housingStock:
      "Established 1970s–1980s homes, many custom or heavily updated, on wooded and lakeside lots. Composition shingle is standard, with the occasional tile or metal roof on remodeled customs. Prior re-roof quality varies widely — we routinely find older overlays, aging flashing, and mixed-generation repairs that shape our recommendation.",
    hoaNote:
      "Re-roofs in Panther Creek require prior written approval through The Woodlands Township covenant process — the village's Residential Design Review Committee or designated staff — per the 2024 Residential Development Standards. Materials must be from the accepted list (composition shingle, tile, slate, stone-coated or non-glossy standing-seam metal) in muted, landscape-harmonizing colors. We submit the application through the Township's Civic Access Portal, and the Standards' 45-day review clock makes early submittal part of doing the job right.",
    landmarks: [
      "Lake Woodlands",
      "Northshore Park",
      "Southshore Park",
      "The Woodlands Country Club",
    ],
    faqs: [
      {
        q: "Who approves a roof replacement in Panther Creek?",
        a: "The Panther Creek Residential Design Review Committee (or Township staff, for eligible items) must give prior written approval before a roof replacement, under The Woodlands Township's 2024 Residential Development Standards. We prepare the submittal, including material and color documentation, as part of every job.",
      },
      {
        q: "My Panther Creek roof was replaced once already. What should I watch for?",
        a: "Second-generation roofs live or die on the details of that earlier job: flashing that was reused instead of replaced, ventilation that was never corrected, or an overlay instead of a tear-off. Our forty-photo inspection documents exactly what the last crew left behind before we recommend anything.",
      },
      {
        q: "Can I put a metal roof on a Panther Creek home?",
        a: "The Township Standards accept standing-seam and stone-coated metal, provided the finish is non-glossy and the color is muted and harmonizes with the landscape. The RDRC reviews the specific product and color, and we handle that submittal with manufacturer samples.",
      },
    ],
    dataCompleteness: "complete",
  },

  "cochrans-crossing": {
    slug: "cochrans-crossing",
    name: "Cochran's Crossing",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Cochran's Crossing Roofing — Repair & Replacement",
    seoDescription:
      "Roofing in Cochran's Crossing, The Woodlands: 1980s-90s housing stock at prime re-roof age, Township-compliant materials, RDRC submittals handled.",
    intro:
      "Cochran's Crossing pairs 1980s and '90s housing stock with some of the strongest schools and parks in The Woodlands — and a wave of roofs in their natural replacement window. We handle the whole process, Township paperwork included.",
    localContext:
      "Cochran's Crossing opened in 1983, named for the Cochran family — co-owners of the Grogan-Cochran Lumber Company that once logged this land. The Township describes the village by its scenic parks, top-rated schools, and the Country Club's Palmer Course; it's home to The Woodlands High School and a cluster of well-regarded elementary and intermediate campuses. Housing here largely dates to the mid-1980s through the 1990s, which puts many original and first-replacement roofs squarely in their end-of-life window — and makes honest repair-versus-replace guidance the conversation we have most on these streets.",
    developmentEra:
      "Opened 1983. The village built out through the mid-'80s and '90s, so its roofs cluster in the 25-40 year band — prime replacement territory for first- and second-generation shingle roofs.",
    housingStock:
      "Family-scale 1980s–1990s homes on wooded lots, from established starter neighborhoods to larger customs near the Palmer course. Composition shingle dominates; steep-slope two-stories with multiple valleys are common, and we see the era's typical aging points — worn pipe boots, tired step flashing, and ventilation that was minimal by today's standards.",
    hoaNote:
      "Every Cochran's Crossing re-roof needs prior written approval through The Woodlands Township — the village RDRC or designated staff — under the 2024 Residential Development Standards. Accepted materials are composition shingles, tile, slate, and stone-coated or non-glossy standing-seam metal, in muted colors that harmonize with the landscape; roof vents and flashing must be color-compatible with the roof. We submit through the Civic Access Portal and don't order material until the approval is in hand.",
    landmarks: [
      "The Woodlands High School",
      "Palmer Golf Course",
      "Cochran's Crossing Village Center",
    ],
    faqs: [
      {
        q: "How old are roofs in Cochran's Crossing, typically?",
        a: "The village opened in 1983 and built out through the '90s, so original and first-replacement roofs here commonly sit in the 25–40 year band. That's beyond the typical service life of older three-tab shingles and at the edge for early architectural shingles — which is why inspections in this village so often turn into replacement planning.",
      },
      {
        q: "Do you handle the Township approval for Cochran's Crossing re-roofs?",
        a: "Yes. The Township's Standards require prior written RDRC/staff approval for all roof replacement. We prepare the application, submit the material and color documentation through the Civic Access Portal, and schedule installation once approval comes back.",
      },
      {
        q: "Can you match my roof to others approved in the village?",
        a: "We keep track of the muted, Standards-compliant shingle colors we've submitted successfully and bring physical samples to your driveway. Final approval always rests with the RDRC, but starting from proven-compliant selections keeps the process fast.",
      },
    ],
    dataCompleteness: "complete",
  },

  "indian-springs": {
    slug: "indian-springs",
    name: "Indian Springs",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Indian Springs Roofing — The Woodlands Village Experts",
    seoDescription:
      "Roof replacement, repair and inspections in Indian Springs, The Woodlands — 1984 village by the George Mitchell Nature Preserve. RDRC paperwork handled.",
    intro:
      "Indian Springs sits against the George Mitchell Nature Preserve — deep forest on one side, mid-'80s-and-newer rooflines on the other. We work both realities: preserve-edge tree load and Township-compliant re-roofs.",
    localContext:
      "Indian Springs opened in 1984, its name recorded from artifacts of the Bidai tribe of Atakapan Indians discovered on the property during development. The village runs along some of the community's best green space — direct access to the George Mitchell Nature Preserve, Falconwing Park and its pool, little Trace Creek Park — and its homes back up to genuinely wild forest more than almost anywhere else in The Woodlands. For roofs, that adjacency is the story: heavy shade, constant organic debris in valleys and gutters, algae-friendly humidity on north slopes, and limb exposure in every serious wind event.",
    developmentEra:
      "Opened 1984, building out through the 1990s. Original and first-replacement roofs are now deep into their service life; homes nearer the preserve age faster on the shaded slopes than the calendar suggests.",
    housingStock:
      "Mid-1980s–1990s family homes and customs on some of the most heavily-treed lots in the community, many backing directly to preserve land. Composition shingle is standard. Shaded, debris-loaded slopes and long valleys are the recurring maintenance theme — the roofs here earn their inspections.",
    hoaNote:
      "Indian Springs re-roofs follow The Woodlands Township covenant process: prior written approval by the village Residential Design Review Committee or designated staff, per the 2024 Residential Development Standards — muted colors, accepted materials (composition shingle, tile, slate, stone-coated or non-glossy standing-seam metal), color-compatible vents and flashing. The Standards also oblige owners to keep roofs clear of leaves, pine needles and branches — a real consideration on preserve-edge lots. We handle the Civic Access Portal submittal end to end.",
    landmarks: [
      "George Mitchell Nature Preserve",
      "Falconwing Park",
      "Trace Creek Park",
      "Indian Springs Village Center",
    ],
    faqs: [
      {
        q: "My Indian Springs home backs up to the preserve. What does that mean for my roof?",
        a: "More shade, more debris, more humidity. Valleys and gutters load up with needles and leaves faster than on open lots — debris the Township covenants require owners to remove — and shaded slopes hold moisture that feeds algae streaking. We recommend annual inspections and honest attention to ventilation on these homes.",
      },
      {
        q: "Is tree-limb damage covered by insurance in Indian Springs?",
        a: "Falling-limb impact from a storm is generally the kind of sudden, accidental damage homeowner policies address, but every policy differs — we document the damage with our forty-photo packet so you and your carrier are working from evidence, and we tell you honestly whether the damage justifies a claim before you file.",
      },
      {
        q: "Who approves re-roofs in Indian Springs?",
        a: "The village's Residential Design Review Committee (or Township staff for eligible items), with prior written approval required before any roof replacement under the Township's 2024 Residential Development Standards. We prepare and track the application for you.",
      },
    ],
    dataCompleteness: "complete",
  },

  "alden-bridge": {
    slug: "alden-bridge",
    name: "Alden Bridge",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Alden Bridge Roofing — Repair & Replacement Experts",
    seoDescription:
      "Roofing across Alden Bridge, The Woodlands' big 1994 village — 1990s-2000s roofs hitting replacement age, Township-compliant re-roofs, RDRC handled.",
    intro:
      "Alden Bridge is one of the largest villages in The Woodlands — mile after mile of 1990s and 2000s rooflines now reaching the age where shingles start failing for good. This is where we spend a lot of our week.",
    localContext:
      "Alden Bridge opened in 1994 in the northwest corner of The Woodlands, named after the Louisiana hometown of Roger Galatas, then-president of The Woodlands Operating Company. Local guides put it among the community's largest villages — on the order of seven thousand homes across dozens of neighborhood sections — connected by FM 1488, FM 2978 and I-45, with 26 parks stitched through the forest. The math matters for roofs: a village mostly built in the mid-'90s through early 2000s means an enormous cohort of builder-installed and first-replacement shingle roofs crossing the 20-30 year threshold together — the busiest replacement window in The Woodlands right now.",
    developmentEra:
      "Opened 1994, with build-out through the early 2000s. Original builder-grade roofs here are past — often well past — their expected service life, and even quality first replacements are entering the inspection-every-year stage.",
    housingStock:
      "1990s–2000s production and semi-custom homes across a wide range of sections and price points. Composition shingle throughout, mostly the era's builder-grade three-tab and early architectural product; steep two-story gables are the signature roofline. When we open these roofs up, era-typical decking (spaced or minimal sheathing gaps, older felt) is part of the replacement conversation.",
    hoaNote:
      "Alden Bridge re-roofs require prior written approval through The Woodlands Township — the village Residential Design Review Committee or designated staff — under the 2024 Residential Development Standards: muted, landscape-harmonizing colors; accepted materials including composition shingle, tile, slate, and stone-coated or non-glossy standing-seam metal. No survey is needed for a re-roof, and we submit the full application through the Township's Civic Access Portal before ordering material.",
    landmarks: [
      "FM 1488 corridor",
      "Alden Bridge Village Center",
      "Alden Bridge Park",
      "Research Forest Drive",
    ],
    faqs: [
      {
        q: "Why are so many Alden Bridge roofs being replaced right now?",
        a: "The village opened in 1994 and built out fast — so tens of thousands of shingle slopes installed within the same decade are aging out within the same decade. Original builder-grade roofs from the '90s are past their expected service life (roughly 20 years for three-tab per InterNACHI, less in hot climates), and Gulf Coast heat, humidity and hail only accelerate the schedule.",
      },
      {
        q: "Do I need Township approval to re-roof in Alden Bridge?",
        a: "Yes — prior written approval from the village RDRC or designated Township staff is required for all roof replacement under the 2024 Residential Development Standards, and roofing repairs require a permit at the time of repair. We prepare and submit the paperwork as part of the job.",
      },
      {
        q: "Is a Class 3 or Class 4 impact-resistant shingle worth it in Alden Bridge?",
        a: "If you're replacing anyway, upgrading to a UL 2218 Class 4 shingle like IKO Nordic is worth pricing: this area sees real hail, and IKO notes the impact rating may help you qualify for an insurance premium discount where your carrier offers one — though it isn't a hail guarantee, and hail isn't covered by the shingle warranty. We quote both our standard IKO Dynasty and the Class 4 Nordic in writing so you can compare.",
      },
      {
        q: "Can you handle several homes on the same street?",
        a: "Yes — replacement waves are normal in a village that built out together, and neighboring jobs let us share logistics. Every home still gets its own inspection, its own written estimate, and its own Township approval; we never assume two roofs need the same work.",
      },
    ],
    dataCompleteness: "complete",
  },

  "college-park": {
    slug: "college-park",
    name: "College Park",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "College Park & Harper's Landing Roofing — The Woodlands",
    seoDescription:
      "Roofing in College Park and Harper's Landing — the only Woodlands village east of I-45. 1990s-2000s roofs at replacement age; Township paperwork handled.",
    intro:
      "College Park — including Harper's Landing — is the only piece of The Woodlands east of I-45, and its 1990s-2000s rooflines are hitting replacement age on their own schedule. We cover both sides of the freeway, same standards, same paperwork.",
    localContext:
      "College Park was designated in 1995, named for the educational institutions in and adjacent to it — Lone Star College–Montgomery and Sam Houston State University's Woodlands Center among them — and The Woodlands College Park High School opened in 2005. It's the only village on the east side of I-45, anchored by its two major residential neighborhoods, Harper's Landing and Windsor Hills (the latter opened in 2000 per the developer's history). For roofing, College Park behaves like Alden Bridge's younger sibling across the freeway: a concentrated cohort of mid-'90s-through-2000s production homes whose builder-grade shingles are aging out together.",
    developmentEra:
      "Designated 1995; residential build-out ran through the 2000s (Windsor Hills opened 2000). Original roofs across Harper's Landing and Windsor Hills are now in or approaching their replacement window.",
    housingStock:
      "1990s–2000s production homes in Harper's Landing and Windsor Hills — family two-stories on wooded lots with composition shingle throughout. East-of-freeway location means we route inspections here directly off I-45; roof stock and aging patterns mirror the community's other '90s villages.",
    hoaNote:
      "College Park re-roofs follow the same Woodlands Township covenant process as the rest of the community: prior written approval from the Residential Design Review Committee or designated staff under the 2024 Residential Development Standards — accepted materials (composition shingle, tile, slate, stone-coated or non-glossy standing-seam metal) in muted, landscape-harmonizing colors. We submit through the Civic Access Portal and wait for approval before ordering material.",
    landmarks: [
      "Harper's Landing",
      "Windsor Hills",
      "Lone Star College",
      "The Woodlands College Park High School",
    ],
    faqs: [
      {
        q: "Is Harper's Landing part of The Woodlands for roofing approvals?",
        a: "Yes. Harper's Landing is one of College Park's two major neighborhoods, and re-roofs there go through The Woodlands Township covenant process — prior written RDRC/staff approval, compliant materials and muted colors — like the rest of the community.",
      },
      {
        q: "Do you actually cover the east side of I-45?",
        a: "Yes — College Park is a normal part of our service run, not an exception. Same-day inspections, the same forty-photo documentation packet, and the same Township paperwork handling as every other village.",
      },
      {
        q: "My Windsor Hills home was built around 2000. Should I be planning a replacement?",
        a: "If the roof is original, yes — start planning. Builder-grade shingles from that era carry roughly 20-year expected service lives (InterNACHI), and hot climates shorten that. A free inspection tells you honestly whether you have years left or whether it's time; either way you'll have it in writing.",
      },
    ],
    dataCompleteness: "complete",
  },

  "sterling-ridge": {
    slug: "sterling-ridge",
    name: "Sterling Ridge",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Sterling Ridge Roofing — West Woodlands Village Experts",
    seoDescription:
      "Roof replacement and repair in Sterling Ridge, The Woodlands' 1999 western village around the Player course. Township-compliant re-roofs, RDRC handled.",
    intro:
      "Sterling Ridge anchors the western end of The Woodlands — 1999-and-newer rooflines around the Gary Player course, wrapping the gates of Carlton Woods. First-generation roofs here are coming due, and we're already on these streets.",
    localContext:
      "Sterling Ridge opened in 1999, named to honor the sterling (twenty-fifth) anniversary of The Woodlands. It spans the community's western end, surrounds the gated Carlton Woods enclave, and hosts the Gary Player Signature course at The Woodlands Country Club; its newer sections include May Valley and Spindle Tree at the village's wooded western edge. Housing runs from late-'90s production streets to substantial customs near the fairways — which means the village's first big wave of original-roof replacements is arriving now, on homes whose owners expect the job done to a premium standard.",
    developmentEra:
      "Opened 1999, building out through the 2000s (May Valley and Spindle Tree among the newer sections). Original roofs from the village's first sections are crossing the 20-25 year line — the front edge of the replacement wave.",
    housingStock:
      "Late-1990s–2000s homes from upscale production to large customs near the Player course. Architectural composition shingle is the norm, with tile and other premium materials appearing on higher-end builds. Steeper, more complex rooflines than the community's older villages — more valleys, more penetrations, more flashing detail to get right.",
    hoaNote:
      "Sterling Ridge re-roofs require prior written approval through The Woodlands Township — the village Residential Design Review Committee or designated staff — under the 2024 Residential Development Standards: muted, landscape-harmonizing colors; accepted materials including composition shingles, tile, slate, and stone-coated or non-glossy standing-seam metal; color-compatible vents and accessories. We manage the Civic Access Portal submittal and the material documentation the committee expects.",
    landmarks: [
      "Gary Player Signature Course",
      "May Valley",
      "Sterling Ridge Village Center",
      "Carlton Woods (adjacent)",
    ],
    faqs: [
      {
        q: "When will Sterling Ridge roofs need replacement?",
        a: "The village opened in 1999, so its earliest original roofs are now 20+ years old — at or past typical builder-shingle service life, especially in this climate. Newer sections have time, but a free inspection pins down where your roof actually is rather than guessing from the calendar.",
      },
      {
        q: "Do premium homes near the Player course need different roofing?",
        a: "Often, yes — larger and more complex rooflines with more valleys and penetrations, and owners who want premium architectural shingles, designer lines, or standing-seam metal. All of it must still clear the Township's muted-color, accepted-materials Standards, and we handle that submittal with manufacturer samples.",
      },
      {
        q: "Do you also work inside Carlton Woods?",
        a: "Yes — Carlton Woods is the gated enclave within the Sterling Ridge area, and we serve it as its own neighborhood page explains. Access works differently behind the gates, and we confirm the current approval and access requirements before scheduling.",
      },
    ],
    dataCompleteness: "complete",
  },

  "carlton-woods": {
    slug: "carlton-woods",
    name: "Carlton Woods",
    citySlug: "the-woodlands",
    county: "Montgomery",
    seoTitle: "Carlton Woods Roofing — Luxury Roof Specialists",
    seoDescription:
      "Roofing for Carlton Woods, The Woodlands' gated golf community: tile, slate, standing seam and premium shingle on estate homes. Discreet, documented work.",
    intro:
      "Carlton Woods is the most exclusive address in The Woodlands — gated, guarded, and built around two championship courses. Estate roofs here are systems: tile, slate, metal, and premium shingle that deserve specialist care and discreet crews.",
    localContext:
      "Carlton Woods opened in 2000 as the community's flagship gated enclave — a 24-hour manned community consistently ranked among the Houston area's most expensive neighborhoods. It has two sections: the original Carlton Woods within the Sterling Ridge area (Montgomery County) and Carlton Woods Creekside (2005) in the Village of Creekside Park (Harris County). The Club at Carlton Woods hosts a Jack Nicklaus Signature course (2001) and the Tom Fazio Championship course (2005), and since 2023 the Nicklaus course has hosted the Chevron Championship, an LPGA major. Estate homes here carry the premium roof systems the Township's Standards accept — tile, slate, standing-seam metal, premium composition — and roofing work behind the gates runs on appointment, documentation, and respect for the property.",
    developmentEra:
      "First phase opened 2000 (Carlton Woods Creekside followed in 2005). Custom estates rather than production waves — roof age varies home by home, and material lifespans (tile, slate, metal) run far longer than standard shingle.",
    housingStock:
      "Custom and estate homes on golf-course and forest lots. Premium roof systems dominate: concrete and clay tile, natural slate, standing-seam metal, and designer architectural shingle — often combined on one roofline. These systems fail at the details (flashing, underlayment, fasteners) long before the field material wears out, which is exactly what our inspections target.",
    hoaNote:
      "Carlton Woods is governed as a gated community with its own association — whose architectural review committee enforces guidelines for property modifications — alongside The Woodlands Township's community-wide Standards (muted colors; tile, slate, composition, stone-coated or non-glossy standing-seam metal among accepted materials). We confirm the current application and access requirements before scheduling — and handle that coordination for you.",
    landmarks: [
      "The Club at Carlton Woods (Nicklaus Signature Course)",
      "Tom Fazio Championship Course (Creekside)",
      "Chevron Championship venue (since 2023)",
    ],
    faqs: [
      {
        q: "Do you work on tile and slate roofs in Carlton Woods?",
        a: "Yes. Premium systems — concrete and clay tile, natural slate, standing-seam metal, designer shingle — are the norm on Carlton Woods estates, and their failure points are underlayment, flashing and fasteners rather than the field material. Our inspections and repairs target those details, with full photo documentation.",
      },
      {
        q: "How does roofing work behind the gates?",
        a: "On appointment and on process: we coordinate access with the community's 24-hour gate staff, confirm the association's current approval requirements before work is scheduled, and run clean, discreet job sites — no yard signs unless you want one, full cleanup, documented completion.",
      },
      {
        q: "Is Carlton Woods in Montgomery County or Harris County?",
        a: "Both, depending on section: the original Carlton Woods sits in the Sterling Ridge area of Montgomery County, while Carlton Woods Creekside (opened 2005) lies in the Village of Creekside Park in Harris County. It doesn't change our service — it can matter for records and insurance paperwork, which we prepare accordingly.",
      },
    ],
    dataCompleteness: "complete",
  },

  "creekside-park": {
    slug: "creekside-park",
    name: "Creekside Park",
    citySlug: "the-woodlands",
    county: "Harris",
    seoTitle: "Creekside Park Roofing — Harris County's Woodlands Village",
    seoDescription:
      "Roofing in Creekside Park, The Woodlands' newest village (2007) and its only Harris County village. First-generation roofs coming due; RDRC handled.",
    intro:
      "Creekside Park is the newest village in The Woodlands and the only one in Harris County — and its first-generation builder roofs are quietly reaching the age where problems start. We're here before they do.",
    localContext:
      "Creekside Park opened on October 19, 2007 — the community's newest village, set along Spring Creek, and the only village located in Harris County (all others are in Montgomery County); its residents attend Tomball ISD schools. The George Mitchell Nature Preserve opened the same day and wraps the village in protected forest; Rob Fleming Park anchors recreation, the village center arrived in 2015, and Creekside has its own Residential Design Review Committee meeting monthly at Township Town Hall. The roofing story is generational: a village built almost entirely from 2007 onward means nearly every home is still on its original builder roof — a cohort now moving into the years where builder-grade shingles, flashing details and pipe boots begin to fail.",
    developmentEra:
      "Opened October 19, 2007 — the newest village. Nearly all homes are on original builder roofs now in the second half of their expected service life; the village's first big replacement wave is forming, not finished.",
    housingStock:
      "2007-and-newer production and custom homes, from family two-stories to Carlton Woods Creekside estates. Architectural composition shingle dominates. On roofs this age we focus on the early-failure points — pipe boots (the rubber commonly degrades within roughly 10–15 years), nail pops and flashing details — because catching them early is the difference between a repair and interior damage.",
    hoaNote:
      "Creekside Park re-roofs go through The Woodlands Township covenant process with the village's own Residential Design Review Committee (which meets monthly at Township Town Hall): prior written approval before roof replacement, accepted materials (composition shingle, tile, slate, stone-coated or non-glossy standing-seam metal) in muted, landscape-harmonizing colors, per the 2024 Residential Development Standards. Harris County location doesn't change the covenant process — we submit through the Civic Access Portal either way.",
    landmarks: [
      "George Mitchell Nature Preserve",
      "Rob Fleming Park",
      "Creekside Park Village Center",
      "Spring Creek",
    ],
    faqs: [
      {
        q: "My Creekside Park home was built around 2010. Why would the roof need attention already?",
        a: "Because components fail before shingles do. Neoprene pipe boots commonly crack within roughly 10–15 years, nail pops open shingle punctures, and builder-grade flashing shows its shortcuts — all fixable cheaply if caught early. A free inspection with our forty-photo packet tells you exactly where the roof stands.",
      },
      {
        q: "Does being in Harris County change anything about roofing in Creekside Park?",
        a: "Not the covenant side — Creekside re-roofs still require prior written approval through the village RDRC under the Township's Standards. County matters mostly for records and, in storm claims, for how events get catalogued; we prepare documentation with the correct jurisdiction either way.",
      },
      {
        q: "Do preserve-edge lots in Creekside need extra roof care?",
        a: "The George Mitchell Nature Preserve keeps real forest against many lot lines, and those homes see more shade, more debris in valleys and gutters, and more limb exposure in wind events. The Township covenants require owners to keep roofs clear of leaves, needles and branches — an annual inspection makes that easy to stay ahead of.",
      },
    ],
    dataCompleteness: "complete",
  },
};

export const NEIGHBORHOOD_SLUGS = Object.keys(NEIGHBORHOODS);

export function neighborhoodsForCity(citySlug: ServiceAreaSlug): Neighborhood[] {
  return Object.values(NEIGHBORHOODS).filter((n) => n.citySlug === citySlug);
}
