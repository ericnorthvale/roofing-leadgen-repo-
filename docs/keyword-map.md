# Keyword map — one primary query per page

Anti-cannibalization contract: every indexable page owns ONE primary query
family. Before adding or retitling a page, check this map — if the query is
taken, strengthen that page instead of competing with it. Titles are unique
sitewide (enforced by tests/unit/seo-content.test.ts).

## The money pages (The Woodlands hub-and-spoke)

| Page                              | Primary query family                          | Notes                                                             |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| `/` (homepage)                    | roofing company The Woodlands TX              | Owner-specified H1/title; the brand + "roofing company" head term |
| `/the-woodlands`                  | roofing in The Woodlands                      | City hub; links every spoke + village                             |
| `/the-woodlands/roof-replacement` | roof replacement The Woodlands                | RDRC/covenant + cost angle                                        |
| `/the-woodlands/roof-repair`      | roof repair The Woodlands                     | Village-age repair patterns                                       |
| `/the-woodlands/roof-inspection`  | roof inspection The Woodlands                 | Free/40-photo + RDRC prep angle                                   |
| `/the-woodlands/storm-damage`     | storm damage roof The Woodlands / hail damage | Local storm record                                                |
| `/the-woodlands/insurance-claims` | roof insurance claim help The Woodlands       | TX-law angle                                                      |
| `/the-woodlands/<village>` ×9     | roofing <village name>                        | e.g. "roofing Alden Bridge"; village-distinct content             |

## Secondary city spokes (Phase 4 expansion)

| Page                       | Primary query family                              | Notes                                                                                                                                                            |
| -------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/conroe/storm-damage`     | storm / hail damage roof Conroe                   | City permit inside limits; Lake Conroe open-water wind                                                                                                           |
| `/conroe/insurance-claims` | roof insurance claim Conroe                       |                                                                                                                                                                  |
| `/spring/roof-replacement` | roof replacement Spring TX / new roof cost Spring | Home base; Klein + Champions '70s–'80s stock; Harris Co. no-permit rule. ALSO owns "signs you need a new roof Spring" — deliberately ONE page, not two thin ones |
| `/cypress/storm-damage`    | storm / hail damage roof Cypress (Cy-Fair)        | NCEI ~104 mph gust at Cypress in the 2024 derecho; MUD/ARC approval                                                                                              |

## Metro-wide service guides (NON-city-qualified queries)

| Page                         | Primary query family                                      | Notes                                                                 |
| ---------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `/services/roof-replacement` | roof replacement (NW Houston / Montgomery County framing) | Never title with "The Woodlands" — that's the city page's query       |
| `/services/roof-repair`      | roof repair NW Houston / same-day roof repair             |                                                                       |
| `/services/roof-inspection`  | free roof inspection                                      |                                                                       |
| `/services/storm-damage`     | storm damage roofing Houston                              | Educational guide                                                     |
| `/services/insurance-claims` | roof insurance claim support                              | TX process guide                                                      |
| `/services/metal-roofing`    | metal roofing / standing seam                             | Never city-qualified — `/the-woodlands/*` owns those                  |
| `/services/tile-roofing`     | tile roof repair / tile underlayment replacement          | Primary angle is underlayment, not tile replacement                   |
| `/services/flat-roofing`     | flat roofing / low-slope / TPO / PVC                      | Residential low-slope AND commercial                                  |
| `/storm-response`            | emergency roof tarping / storm response                   | ACTIVE-STORM landing page only; guides live at /services/storm-damage |

## Trust / EEAT pages

| Page                             | Query                                               | Status                               |
| -------------------------------- | --------------------------------------------------- | ------------------------------------ |
| `/process`                       | Northvale process / how roof replacement works      | indexable                            |
| `/warranty`                      | roof warranty explained / IKO warranty tiers        | indexable                            |
| `/roof-design-center`            | IKO Dynasty/Nordic / roof colors / design your roof | indexable (interactive product page) |
| `/certifications`                | IKO ROOFPRO / roofing certifications                | indexable                            |
| `/financing`                     | roof financing                                      | LIVE 2026-08 (owner-supplied terms)  |
| `/roof-size-calculator`          | roof size calculator                                | LIVE — public key in code (owner)    |
| `/team`                          | (brand)                                             | noindex until real people            |
| `/gallery`                       | (brand) / our work                                  | indexable (real project photos)      |
| `/projects`, `/projects/*`       | Northvale roofing projects / case studies           | indexable (real homeowner stories)   |
| `/about`, `/reviews`, `/contact` | brand queries                                       | existing                             |

## Blog (informational long-tail; each links up to its money page)

| Post                                               | Query family                                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| best-roofing-shingles-the-woodlands-climate        | best shingles for Texas/Woodlands climate                                                                                                         |
| iko-dynasty-vs-nordic                              | IKO Dynasty vs Nordic / Class 3 vs Class 4 (301 from tamko-titan-xt-vs-gaf-timberline-hdz)                                                        |
| roof-replacement-cost-the-woodlands                | roof replacement cost The Woodlands (informational; the money page holds the transactional query)                                                 |
| what-wind-rating-should-i-buy-near-houston         | shingle wind ratings Houston                                                                                                                      |
| should-i-replace-my-roof-before-selling            | replace roof before selling                                                                                                                       |
| do-insurance-companies-cover-hail-damage-texas     | does insurance cover hail damage Texas                                                                                                            |
| montgomery-county-roofing-permit-guide             | Montgomery County roofing permit                                                                                                                  |
| what-happens-during-a-roof-inspection              | what happens during a roof inspection                                                                                                             |
| why-roofs-leak-around-pipe-boots                   | roof leak pipe boot                                                                                                                               |
| woodlands-hoa-roof-approval-guide                  | The Woodlands HOA roof approval / RDRC                                                                                                            |
| roof-claim-denied-texas-appraisal                  | roof claim denied Texas / appraisal clause (city claim queries stay on /the-woodlands/insurance-claims)                                           |
| what-hail-damage-looks-like-on-a-roof              | what hail damage looks like / roof hail damage signs                                                                                              |
| repair-or-replace-your-roof                        | roof repair vs replacement / when to replace roof Texas                                                                                           |
| attic-ventilation-texas-roof-lifespan              | attic ventilation Texas / roof lifespan Texas climate                                                                                             |
| black-streaks-on-roof-algae                        | roof algae removal / black streaks on roof / gloeocapsa magma                                                                                     |
| tropical-storm-roof-damage-texas                   | tropical storm roof damage Texas / hurricane wind roof damage                                                                                     |
| best-iko-roof-colors-the-woodlands                 | best IKO roof colors / Woodlands roof color                                                                                                       |
| class-4-impact-resistant-shingles-texas (existing) | Class 4 shingles Texas                                                                                                                            |
| storm-damage-what-to-do (existing)                 | what to do after storm damage                                                                                                                     |
| insurance-wont-cover-entire-roof                   | insurance won't cover whole roof / partial roof claim approval / recoverable depreciation (the city claims pages keep the city-qualified queries) |
| what-should-a-roofing-estimate-include             | what should a roofing estimate include / compare roofing quotes / roofing bid checklist                                                           |
| how-to-pay-for-a-new-roof-texas                    | how to pay for a new roof / can't afford a new roof (informational — `/financing` keeps "roof financing")                                         |

## Rules

1. City-qualified transactional queries ("X The Woodlands") belong to
   `/the-woodlands/*` pages — never to `/services/*` titles.
2. Blog posts take informational phrasings ("how much does…", "what is…") and
   always link to the transactional page that owns the money query.
3. New cities repeat this pattern: hub `/<city>`, spokes `/<city>/<service>`,
   villages `/<city>/<neighborhood>` — gated by quality-gate.ts until content
   is real and distinct.
4. Facts on any page must trace to docs/research-facts.md (or a new sourced
   entry added there first).
