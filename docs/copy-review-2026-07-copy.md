# Site-wide copy review — July 2026

Two-pass review of every copy surface (core pages, service pages + data
records, location/neighborhood/persona records + templates, all 13 blog posts,
components, legal pages) against CLAUDE.md hard rules, `docs/brand-voice.md`,
and `docs/research-facts.md`. Pass 1: five parallel section reviews, findings
verified in-file. Pass 2: adversarial re-triage against real enforcement
mechanisms (Texas DTPA §17.46 puffery doctrine, FTC fake-reviews rule 16 CFR
465, Tex. Bus. & Com. Code §27.02 / ch. 601, FTC Cooling-Off Rule), plus a web
verification sweep of the flagged neighborhood facts.

**Owner context that changed the triage:** the operator has real experience in
the local roofing market and has subcontracted jobs. Experience claims are
therefore likely TRUE (keep, anchor via the Tier 2.6 questionnaire in
`TASKS_FOR_ERIC.md`) — but "no subcontracting / crews are our people" became
the riskiest claim on the site and was reworded.

## What was legally exposed (specific false factual representations) — FIXED

| Finding                                                                                                                                                                          | Where                 | Fix applied                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "50-year non-prorated warranty" on Timberline HDZ — no such GAF term exists; warranty misrepresentation is DTPA-laundry-list territory and contradicted our own `/warranty` page | `about.astro`         | Replaced with sourced coverage (Lifetime limited + WindProven no-max-wind-speed)                                                       |
| "No subcontracting the foreman role. Crews are our people." — owner has subbed jobs; specific false representation                                                               | `about.astro`         | Reworded: every job led by a 10+ yr foreman + named Northvale PM, "our crew or a vetted partner crew" (NEEDS DATA: confirm crew model) |
| Stock photos could render under "Recent work" while `USE_DEMO_IMAGES` is on (misrepresenting work performed — FTC/DTPA-real)                                                     | `ServiceLayout.astro` | Hard-gated: BeforeAfter band never renders while demo images are on                                                                    |
| Reviews page indexable with meta asserting verified reviews across six cities while zero exist                                                                                   | `reviews.astro`       | `noindex` + neutral meta while `reviews.length === 0` (matches gallery/team/financing gates)                                           |

## Statute miscitations — FIXED (credibility, not fine-generating)

The §701 / "§27.02 rescission" citations that `research-facts.md` said were
purged in Phase 2.5 had survived in the legal module and TCPA page:

- `legal.ts`: §27.02 relabeled (deductible/insurance-proceeds notice, not
  "door-to-door solicitation"); §701 → §4102.163; added ch. 601 ref.
- `legal/tcpa.astro`: 3-day rescission re-cited to Tex. Bus. & Com. Code ch.
  601 + FTC Cooling-Off Rule and correctly scoped ("signed at your home after a
  door-to-door solicitation"); "§§ 4102 and 701" → §4102.163;
  "licensed-where-required" → plain no-state-license statement; meta cleaned.
- `about.astro`: door-knocking attributed to TDI guidance (was mis-cited to
  §27.02); "insurance fraud" → "criminal offense in Texas (§27.02)".
- `blog/storm-damage-what-to-do.md`: "three days to rescind" re-cited/scoped;
  deductible-waiver cited to §27.02; ice-and-water shield moved from
  "code-required" to best-practice.
- `for-[persona].astro`: §4102 → §4102.163.
- **Key learning: the 3-day right is REAL** (ch. 601 / Cooling-Off Rule) — it
  was mis-cited, not invented. Now sourced in `research-facts.md` Sheet 4.

## Over-caution reversed (pass-2 findings)

- "America's flagship" / "industry's first WindProven" are **GAF's own
  marketing claims** — attributed ("GAF bills it…", "per GAF") instead of
  deleted; added to `research-facts.md` Sheet 1.
- Experience/fluency claims are likely true given the operator's background —
  kept confident, anchored via the **Tier 2.6 owner questionnaire** in
  `TASKS_FOR_ERIC.md` (years in market, carriers worked, crew model, a11y
  testing, mailing address, welcome.mdx coverage list). The 10-carrier
  "fluent in their preferences" list was neutralized to a process claim
  pending the owner's real carrier list (`services.ts`, NEEDS DATA).
- Neighborhood local color: **verified-and-kept, not stripped.** Web sweep
  results (now in `research-facts.md` Sheet 2, "verified 2026-07-03"):
  - CONFIRMED: Panther Creek's thirteen parks; Grogan-Cochran "last sawmill";
    Tamarac Park/Lake Harrison; College Park naming (nuance: "in and adjacent
    to"); Spindle Tree; Township's Cochran's Crossing wording; Creekside/
    preserve matching 2007-10-19 dates.
  - CORRECTED: Alden Bridge Park removed from Cochran's Crossing landmarks
    (wrong village); Falconwing "skate park" removed (it's at Tamarac);
    "Trace Creek Trail" → Trace Creek Park; Panther Creek creek runs
    _through_ the village (not "eastern boundary"); "roughly 400 acres of
    forest and meadow" cut (realtor marketing); Creekside "named for" →
    "set along" Spring Creek; Carlton Woods approval-path wording made
    neutral (association ARC exists, but RDRC relationship stays UNVERIFIED).

## Mechanical corrections

- Covenant Administration phone **281-210-3973 → 281-210-3800** (sourced).
- Internal `Tone: {data.tone}` note no longer rendered on persona pages.
- **Timarron** (a DFW community) removed from the HOA persona page;
  "lists maintained for" → "we build ARC-compliant submittals for".
- Garbled TDI storm-guidance sentence split (prohibition vs. advice),
  `services.ts` storm section.
- "forty miles inland" (unsourced, inaccurate) → "well inland" (×2).
- 57% Cost-vs-Value recoup figure removed (UNVERIFIED #2); directional point
  kept. Class-4 → Class 4 normalized; insurance-discount claim re-hedged to
  TDI wording + Form PC068.

## Voice / SEO

- Home hero H1 humanized (was a pipe-delimited title-tag string ending in
  "Experts"); keywords moved to the subhead prose; `<title>` unchanged.
- `ServiceCard` "Learn more →" → "{title} details →".
- Services hub title geo-qualified; inspection seoTitle geo-anchored.
- `ServiceArea.seoDescription` field added (fallback intro-concat truncated in
  SERPs); filled for the-woodlands.
- Generic "Bottom line" blog closers replaced with specific headings.
- Em-dash pass intentionally minimal (house style per brand-voice.md); one
  double-em-dash paragraph on the homepage varied.

## Deliberately NOT changed

- "10+ year foreman", "what we see on inspections", village-presence intros
  ("we're already on these streets") — likely true given operator background;
  confirm via Tier 2.6 questionnaire rather than delete.
- Hail thresholds "damaging ≥¾ inch" vs "severe ≥1 inch" — both correctly
  qualified per NWS; left precise rather than falsely unified.
- The two short blog posts (storm-damage ~720w, class-4 ~520w) still sit under
  the 1500-word brand-voice floor — expansion is real writing work, deferred
  as a follow-up rather than padded.
- Persona pages remain thin-but-distinct and indexable — flagged as a
  follow-up (add persona-specific proof/process section or noindex).
