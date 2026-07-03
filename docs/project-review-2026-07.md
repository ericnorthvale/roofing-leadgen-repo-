# Full project review — July 2026

A top-to-bottom expert review of the codebase, planning docs, integrations, and
market strategy, run 2026-07-03 (three parallel deep-dives: site code + SEO
architecture; planning/strategy docs; lead pipeline + integrations, plus live
market research). The P0 code fixes it identified were implemented in the same
branch as this doc — each item below is marked FIXED or OPEN.

## Executive verdict

The engineering discipline here is genuinely rare for a contractor site: the
quality gate + single-source data model + anti-fabrication guardrails are the
real moat, and they're tested. The strategic thinking (gated programmatic SEO,
attribution spine, phased Business OS) is ahead of local competitors.

The two structural risks:

1. **The plan is website-heavy while the local market runs on Google Business
   Profile, reviews, and Local Services Ads.** The site is a 6–12 month asset;
   what makes the phone ring in month one (GBP, LSA, review velocity, real
   photos) is mostly outside this repo and under-weighted in the task tiers.
2. **The conversion layer had real bugs** (call tracking never wired, form
   validation disabled, a placeholder review rendering publicly, no lead
   persistence fallback). Most are now fixed — see below.

## What's genuinely strong (keep sacred)

- **Quality gate** (`src/lib/quality-gate.ts` + `dataCompleteness` +
  sitemap auto-exclusion in `routes.ts`) — the correct answer to Google's
  scaled-content-abuse enforcement, and enforced by tests
  (`seo-content.test.ts`: unique titles, anti-cannibalization, pairwise-
  distinct village content).
- **The Woodlands content** clears the anti-doorway bar: village pages turn on
  real distinct facts; service guides are citation-dense. Statute citations in
  live copy verified correct (§707.002, §27.02, §4102.163).
- **Anti-fabrication ethos** ("GAF Master Elite applicant", sourced-facts
  discipline with UNVERIFIED do-not-publish lists) — both an FTC shield and a
  trust wedge in a storm-chaser market.
- **Integration pattern**: env-gated, best-effort, never-blocks-the-lead, well
  unit-tested. The canonical `lead_source` spine (website → HighLevel →
  JobNimbus → QuickBooks) is the architecture that lets you answer "which
  channel made money."
- **Planning discipline**: decision log, SOPs, phased Business OS, clear
  human-vs-AI division of labor.

## Code-level findings

| #   | Finding                                                                                                                                                                                                                      | Status                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Placeholder review (`src/content/reviews/sample.json`) rendered on `/` and `/reviews` — a fake review on a real-reviews-only site                                                                                            | **FIXED** — `placeholder: true` flag; filtered in new `src/lib/reviews.ts`                                            |
| 2   | CallRail DNI swap script never rendered — call attribution non-functional                                                                                                                                                    | **FIXED** — env-gated snippet in `BaseLayout` (`PUBLIC_CALLRAIL_COMPANY_ID` = `companyId/scriptKey`)                  |
| 3   | `novalidate` on LeadForm + presence-only server checks — garbage flowed to CRM/SMS/Meta                                                                                                                                      | **FIXED** — native validation on; `src/lib/lead-validation.ts` (format checks + length caps, 422s)                    |
| 4   | No client Meta Pixel / Google Ads tag; CAPI `event_id` had nothing to dedup against                                                                                                                                          | **FIXED** — pixel + AW gtag in `BaseLayout`; browser-generated `eventId` shared form → CAPI → `/thank-you` pixel fire |
| 5   | TCPA consent not evidenced in CRM                                                                                                                                                                                            | **FIXED** — `consent_given/_timestamp/_ip/_text_version` custom fields (`CONSENT_TEXT_VERSION` in `legal.ts`)         |
| 6   | `aggregateRatingJsonLd` built + tested but never emitted                                                                                                                                                                     | **FIXED** — wired on `/` and `/reviews`; auto-activates with real reviews                                             |
| 7   | Orphaned `neighborhoods` content collection (second source of truth)                                                                                                                                                         | **FIXED** — removed; `lib/neighborhoods.ts` is the only source                                                        |
| 8   | Vercel geo captured but dropped                                                                                                                                                                                              | **FIXED** — forwarded as `ip_city`/`ip_region` custom fields                                                          |
| 9   | No e2e test ever submitted the form                                                                                                                                                                                          | **FIXED** — `tests/e2e/lead-form.spec.ts` (happy path, native-validation block, API 422)                              |
| 10  | **No lead persistence fallback** — with zero integration keys a lead is only a console line                                                                                                                                  | **OPEN** — recommend Vercel Blob/KV append as a never-lose-a-lead net (owner infra decision)                          |
| 11  | Phone leads skip Meta CAPI; CallRail webhook has no rate limit                                                                                                                                                               | **OPEN** — add when call volume justifies                                                                             |
| 12  | HighLevel v2 payload shapes unverified against a live account                                                                                                                                                                | **OPEN** — verify on day one of real token (repo already flags this)                                                  |
| 13  | `USE_DEMO_IMAGES = true` (stock photos live)                                                                                                                                                                                 | **OPEN** — tracked launch-day owner action (`TASKS_FOR_ERIC.md`)                                                      |
| 14  | Content-pipeline GitHub Actions crons invoke stubbed scripts                                                                                                                                                                 | **OPEN** — implement scripts or disable the crons so failures don't become ignored noise                              |
| 15  | Canonical domain unresolved (www vs apex; two Vercel projects; `PUBLIC_SITE_URL`)                                                                                                                                            | **OPEN — owner, before GSC/GBP/ads spend**                                                                            |
| 16  | (Found during verification) Astro eats backslashes in quoted attributes, so the form's `pattern` regexes rendered as `d{5}` etc. — they could never match; native validation was silently broken independent of `novalidate` | **FIXED** — patterns passed as JS-string expressions (v-flag-safe); e2e test now proves the browser blocks bad input  |

Doc drift fixed alongside: CLAUDE.md phone/staleness + hybrid framing,
brand-voice placeholder number, research-facts statute corrections marked
resolved, briefs README city enum (now all locked 8).

## Market & strategy critique (The Woodlands)

- **GBP is the battleground.** For "roofing company The Woodlands TX" the
  local 3-pack + LSA sit above organic. Incumbents (Blue Truss — GAF Master
  Elite + CertainTeed SMP, back-to-back Best-of-Woodlands; Texas Engineered
  Roofing; Elite Roofers) own award/review history. The year-one wedge is
  review _velocity_ (20 in 90 days reads strong to the algorithm), LSA, and
  the neighborhood/HOA content moat no competitor has. Promote GBP from a
  Tier-2 task to a workstream co-equal with the website.
- **Add an LSA line item.** Roofing LSA CPL ≈ $55–90 in metro markets, about
  half of blended Google Ads CPL, with Google Screened badging. Requires
  background check + insurance — start the application the day the LLC + GL
  policy exist. LSA + SEO together materially beats either alone.
- **Reality-check the day-90 north star.** 50 leads/wk ≈ 15 jobs/wk ≈ a $15M+
  run-rate — beyond first-year crew capacity. Better: 10–15 qualified
  leads/wk at ≤$100 blended CPL with ≥40% contact-to-inspection, letting
  capacity pull volume up. Ad-generated leads you can't service become the
  bad reviews that kill GBP.
- **Speed-to-lead to the homeowner** (sub-5-minute) is specified nowhere as a
  day-one workflow: HighLevel auto-responder SMS + missed-call text-back are
  configuration, not code, and should exist before the first ad dollar.
- **E-E-A-T ceiling**: content is excellent but authorless. Real faces, real
  geotagged photos (CompanyCam), real reviews are the highest-ROI owner
  actions in the entire backlog — in that order.
- **Storm asymmetry is the best play.** Pre-build a "storm kit" (pre-drafted
  GBP post, LSA budget bump, geo-targeted Meta creative, hail-map landing
  section) that fires within hours of a Montgomery County hail event.

## Finance / CRM / lead-management roadmap critique

- **HighLevel → JobNimbus → QuickBooks is right** (and rejecting AccuLynx was
  right at this stage). Guard the seam: `lead_source` + contact id must carry
  into JobNimbus as custom fields — make it an SOP acceptance test, because
  the CRM-to-CRM handoff is where attribution dies in practice.
- **Pull the revenue-attribution loop forward.** Don't wait for n8n: a weekly
  manual join of HighLevel opportunities to QBO invoices in a sheet gives 80%
  of the value at 20+ jobs. The offline-conversion upload (closed revenue →
  Google/Meta) is the single most compounding automation in the plan.
- **Roofing-specific finance gaps to add:** per-job costing (target GM ≥35%
  retail / ≥30% insurance from job #1); insurance AR aged by _claim stage_
  (ACV received / depreciation pending / supplement pending) — standard AR
  aging misleads on insurance work; a materials-float cash policy for storm
  surges.
- **Lead management gaps:** qualification fields (retail vs claim, roof age,
  timeline) → different nurture tracks; a lead-recycling cadence (no-answer
  ×3 → 90-day nurture, not dead); quote-follow-up sequence (20–30% of
  signable jobs are lost to post-estimate silence).
- **Review engine at job #1, not Phase 2** — velocity is the GBP wedge.

## Priorities

- **P0 (repo)** — items 1–9 above: done on this branch.
- **P1 (owner, this month)** — LLC + GL insurance → LSA application
  immediately after; claim/verify GBP; resolve canonical domain; provision
  HighLevel + verify payload shapes + build speed-to-lead auto-responder +
  missed-call text-back; review-request SOP live at job #1; real photos.
- **P2 (30–90 days)** — lead persistence fallback; revenue-attribution sheet
  (manual first) → offline conversion uploads; storm kit; JobNimbus with
  attribution-carry SOP; implement-or-disable the stubbed content-pipeline
  crons; Meta CAPI for phone leads + webhook rate limit.
