# TASKS.md — progress tracker

Source of truth for build progress. Update after every batch/PR.

## ⚑ July 2026 full-project review (docs/project-review-2026-07.md)

A top-to-bottom review shipped with this branch. P0 code fixes landed in the
same PR (placeholder-review leak, form validation + length caps, TCPA consent
evidence to CRM, CallRail DNI + Meta Pixel + Google Ads tag with shared
event-id dedup, AggregateRating JSON-LD wiring, dead-code cleanup, e2e form
tests). Still open — tracked in the review doc:

- [ ] **Owner (blocks GSC/GBP/ads):** resolve canonical domain (www vs apex,
      single Vercel project, consistent `PUBLIC_SITE_URL`)
- [ ] **Owner:** LLC + GL insurance → apply for Google LSA immediately after;
      claim/verify GBP (promote to co-equal workstream with the site)
- [ ] **Owner:** HighLevel keys + verify v2 payload shapes + build the
      speed-to-lead auto-responder and missed-call text-back workflows
- [x] Lead persistence fallback so an unconfigured stack can never silently
      drop a lead — private Vercel Blob store (`src/lib/lead-store.ts`), wired
      into `/api/lead` + the CallRail webhook; owner setup: `docs/setup-leads.md` §3
- [x] Meta CAPI for phone leads (`action_source: phone_call`, call id as dedup
      event id) + rate limit on the CallRail webhook
- [x] Content-pipeline crons: `compliance-scan.ts` implemented (weekly
      banned-phrase scan of `dist/`, rules in `src/lib/compliance-rules.ts`);
      brief/draft/e2e workflows guarded with fail-fast steps; `reviews-sync`
      blocked on GBP — per-script status in `src/scripts/README.md`

## ▶ Next session — start here

**Owner validation of the local-authority SEO expansion (this branch's draft
PR).** Review the Vercel preview: homepage H1/title (owner-specified), 5
service guides, 5 Woodlands service-in-city pages, 9 village pages, /process +
/warranty, 10 new blog posts. Then supply the highest-value data: GBP/social
URLs (`sameAs`), financing terms, team members, real photos, and the standard
workmanship-warranty term (see Owner to-dos). CRM keys task
(`docs/setup-highlevel.md`) still stands. The CRM lead pipeline is
built and merged (PR #17): the website form and tracked phone calls will create a
HighLevel contact + pipeline opportunity, and form leads also fire a server-side
Meta conversion — all **env-gated and dormant until keys land in Vercel**. To turn
it on: provision the HighLevel sub-account, issue the Private Integration token,
build the sales pipeline, grab the Pipeline/Stage IDs, create the custom fields,
set `HIGHLEVEL_API_KEY` / `HIGHLEVEL_LOCATION_ID` (+ optional
`HIGHLEVEL_PIPELINE_ID` / `HIGHLEVEL_PIPELINE_STAGE_ID`) in Vercel, then submit a
test lead and confirm a contact + opportunity appear. Then verify the live v2
payload shapes in `src/lib/highlevel.ts` against the real account.

## Phase 0 — Audit

- [x] Stack / routing / SEO / risks audit
- [x] PLAN.md + TASKS.md + owner decisions

## Phase 1 — Foundation / SEO harness

- [x] PLAN.md, TASKS.md, root CLAUDE.md
- [x] Data model: 8-city `service-areas.ts` with rich fields + `dataCompleteness`
- [x] Data model: `services.ts` (5 services as records, content migrated)
- [x] Quality gate: `src/lib/quality-gate.ts` (`evaluateArea` / `evaluateService`)
- [x] SEO helpers: `serviceJsonLd` (Service + areaServed) + `faqPageJsonLd`
- [x] Components: `Faq`, `RelatedLinks`, `RoofImage` (image/alt wrapper)
- [x] `[area].astro` + service pages render from data model + gate (noindex when incomplete)
- [x] Programmatic sitemap excludes noindex/gate-failing pages (`routes.ts`)
- [x] HTML sitemap page (`/sitemap`)
- [x] GA4 confirmed + Search Console manual step documented (`docs/analytics-search-console.md`)
- [x] Scrub invented facts → confident-but-true / flagged placeholders
- [x] Validate: build + 15 unit tests + lint pass; open draft PR

## Phase 1.5 — Visual layer + UX/conversion (PR #13, merged)

- [x] `ImagePlaceholder` swap primitive (`src` → real photo / `demoKey` → demo / branded box; reserves aspect ratio, no CLS)
- [x] Accessible mobile nav (`<details>` menu in `SiteHeader`) — launch-blocker fix
- [x] `TrustBadges`, `BeforeAfter`, crew/truck strips, service-card thumbnails, Woodlands gallery, split hero with image slot
- [x] Third-party `Resources` block + `src/lib/resources.ts` (non-competitive, link-only)
- [x] Copy/typo fixes (homepage Neighborhoods card; `data-cta-phone`)
- [x] Royalty-free demo images behind `USE_DEMO_IMAGES` (`src/lib/demo-images.ts`) — preview only, remove before launch
- [x] Validate: build + 51 unit tests + lint pass

## Phase 2 — Flagship city: The Woodlands

- [x] City hub page — sourced local data, FAQ schema, village/spoke links
      (photos still demo/gated; real photos = owner to-do)
- [x] Core service-in-city pages — `/the-woodlands/{roof-replacement,roof-repair,
roof-inspection,storm-damage,insurance-claims}` via `city-services.ts` +
      `CityServiceLayout` (city-scoped Service schema, local FAQs, TOC)
- [x] Full schema + breadcrumbs (JSON-LD bug fixed) + internal-link graph
      (`src/lib/internal-links.ts`)
- [x] Validate → draft PR → pause for preview review

## Phase 2.5 — Local authority expansion (this branch)

- [x] Research pass: 4 sourced fact sheets → `docs/research-facts.md`
      (materials/costs, Township Standards + villages, climate/storms,
      permits + TX insurance law) with UNVERIFIED do-not-publish lists
- [x] 9 neighborhood (village) pages — `src/lib/neighborhoods.ts` +
      `NeighborhoodPageLayout`, per-page anti-doorway gate
      (`evaluateNeighborhood`), all indexable on sourced distinct content
- [x] Homepage: owner-specified H1/title/description + ~3,000-word sections
      (why-roofs-fail, materials, villages, HOA, permits/codes, 16 FAQs)
- [x] 5 service guides expanded (system anatomy, cited costs, statute-accurate
      insurance content); **fixed Golden Pledge overpromise** (Master Elite not
      held) + two wrong statute citations on storm pages
- [x] EEAT pages: `/process`, `/warranty` (live); `/financing`, `/team`,
      `/gallery` (gated noindex until owner data)
- [x] 10 published blog posts (all claims traced to research-facts.md, costs
      attributed) + `BlogPosting` schema + author box + related-link graph
- [x] SEO plumbing: `sameAs` wiring (owner-editable), gated AggregateRating
      helper, TOC component, keyword map (`docs/keyword-map.md`)
- [x] Tests: 88 unit (21 new SEO guards: unique titles, lengths, gates,
      anti-cannibalization, sitemap parity) + 60 e2e pass

## Phase 2.6 — Brand identity refresh (this branch, doc-only)

Owner supplied a new brand identity PDF (navy `#060E21` / gold `#C9A26C`,
serif wordmark + "N" monogram, Cormorant Garamond type). Critique delivered;
owner decisions recorded: light-first pages with navy "dark moments";
Cormorant Garamond + Montserrat (Open Sans dropped); logo art extracted from
the PDF (it embeds raster only) and auto-traced to SVG as a stopgap.

- [x] `docs/brand-guidelines.md` — full upgraded guide: accessible gold rules
      (brand gold fails 2.37:1 on white → Gold Deep `#956E37` for light
      backgrounds), measured WCAG pairing table, named supporting tones, full
      navy/gold/neutral 50–950 ramps, two-font type system, art direction,
      photography, applications (web/favicon/signage/vehicle), asset inventory
- [x] `docs/brand-assets/` — 8 traced SVG + 8 transparent PNG logo variants
      (wordmark + monogram × gold/navy/white/black), fidelity-checked at
      150px/32px against the PDF originals
- [ ] **Owner/designer (NEEDS DATA):** true vector masters, Pantone coated +
      uncoated refs, `#1E1E2E` intent (purple cast) — see guide §8
- [ ] **Next phase (not started):** apply the identity to the site — swap
      `@theme` ramps in `globals.css`, `COLORS` in `brand.ts`, logo/favicon/OG
      assets, Cormorant+Montserrat self-hosted fonts (guide §9)

## Phase 3 — Gated expansion (batches of 5–20)

- [ ] (per batch) build real-data pages; noindex drafts for the rest
- [ ] (per batch) build + gate + schema + link check + fresh reviewer subagent
- [ ] (per batch) update this file

## Operations, Architecture & Automation (see PLAN.md "Operating System")

Locked decisions: **HighLevel** = website lead/automation hub; **JobNimbus** =
production CRM, added later (no AccuLynx); **Google Workspace SSO** for the admin
panel; **CompanyCam** auto-pull for photos; **n8n on cheap cloud** for custom glue
later (Mac mini for dev); **lightweight security now, harden before scaling**.

Re-sequenced after the BOS audit (see `docs/decision-log.md`): the attribution
spine and knowledge base were moved up.

**Re-sequenced again 2026-07-04 for revenue-ASAP + part-time owners + 4–8-job
capacity** (`docs/decision-log.md`): a **go-to-market workstream (GBP + LSA + review
velocity + speed-to-lead)** is now co-equal with the site and sits at the top of
`TASKS_FOR_ERIC.md` (Tier 0); speed-to-lead automation and manual revenue attribution
moved up into Foundation; the day-90 north star was retired for a capacity-matched target;
ad spend ramps to capacity; n8n → managed (not self-hosted); JobNimbus/CompanyCam deferred
to the first job; the content auto-draft pipeline was deprioritized.

**Go-to-market (phone-ringers) — owner workstream, do first (see `TASKS_FOR_ERIC.md` Tier 0):**

- [ ] Claim + verify Google Business Profile.
- [ ] Apply for Local Services Ads (day LLC + GL insurance exist).
- [ ] Speed-to-lead live in HighLevel — auto-responder + missed-call text-back
      (`docs/runbooks/speed-to-lead.md`), before the first ad dollar.
- [ ] Review-request SOP running at job #1 (`docs/sops/review-request.md`).
- [ ] Lead-qualification fields + follow-up/recycle cadences in HighLevel.

**Phase 1 — Foundation (stop the leaks):**

- [x] **D1 — Lead alerts + safety net:** SMS (Twilio) + email (Resend), env-gated;
      rate limit; `docs/setup-leads.md`. → PR #3
- [x] **Knowledge Base + Decision Log:** `docs/sops/*` (sales, supplements, sub/rep
      onboarding, CRM hygiene, reviews) + `docs/decision-log.md` + Major Decision template.
- [x] **Attribution spine (start):** canonical `lead_source` (`src/lib/lead-source.ts`)
      → HighLevel field + tag; maps 1:1 into JobNimbus/QBO when live.
- [x] **D2 — Admin panel:** Keystatic at `/keystatic` behind an in-app Google
      sign-in (OAuth → signed session cookie, domain/email allowlist; no Cloudflare).
      Editable: Business Info, Photos, Reviews, Blog. City/service SEO pages stay Claude-crafted.
      Owner provisions the Google OAuth client + secrets (`docs/setup-admin-panel.md`).

**Phase 1.6 — CRM lead pipeline hardened (PR #17, merged):**

- [x] **HighLevel**: contact **upsert** (de-dupes by phone/email) + pipeline
      **opportunity** creation, gated on `HIGHLEVEL_PIPELINE_ID` /
      `HIGHLEVEL_PIPELINE_STAGE_ID` (`src/lib/highlevel.ts`).
- [x] **CallRail webhook → HighLevel**: completed inbound (Post-Call) events push
      a contact (+ opportunity) and fire the owner SMS/email alert
      (`src/pages/api/callrail-webhook.ts`); pre-call/outbound de-duped.
- [x] **Meta Conversions API**: best-effort server-side `Lead` event (hashed PII,
      dedup `event_id`), env-gated (`src/lib/meta-capi.ts`).
- [x] Owner guide `docs/setup-highlevel.md`; 64 unit tests pass; all env-gated.

**Phase 1.7 — Revenue attribution (manual first, moved up 2026-07-04):**

- [ ] Weekly HighLevel→QuickBooks join in a Google Sheet
      (`date, lead_source, city, service, revenue, gross_margin`); then offline-conversion
      uploads (closed revenue → Google/Meta). ~80% of the value with zero infra; proves the
      schema n8n Workflow 1 later automates.
- [ ] Guard the HighLevel→JobNimbus seam: an SOP acceptance test that `lead_source` +
      contact id carry across the CRM-to-CRM handoff (where attribution dies in practice).
- [ ] **Storm kit** (pre-staged runbook): pre-drafted GBP post, LSA/Search budget-bump
      procedure, geo-targeted Meta creative, hail-map landing section — fires within hours
      of a Montgomery County hail event (harden `docs/runbooks/storm-window.md`).

**Phase 2 — Automation (30–90d):**

- [ ] **Managed** n8n (~$20–50/mo, not self-hosted): automate the now-proven manual
      revenue-attribution loop (lead→job→revenue), the auto monthly owner report
      (QBO+HighLevel+GA4), and CompanyCam→site (D3/D4, once jobs produce photos).

**Phase 3 — Scale (90+d):**

- [ ] Role-based access + lead routing (§3508 team); AI layers (SMS responder, lead
      scoring, Claude-drafted supplements); per-rep/channel dashboards; security/testing hardening.

## Owner to-dos

**Unblocks indexable pages / content:**

- [x] Real business phone wired (`(713) 449-7661`) — unblocks NAP-gated indexing
- [ ] Real physical address (`addressLine1`/`postalCode` still blank in `business-info.json`)
- [ ] Real cert status (RCAT / GAF Master Elite — held vs. applicant)
- [ ] Operator/crew real experience (years, rough project scale) for "established" copy — note `about.astro` "10+ year foreman" is unverified
- [ ] Real photos → then set `USE_DEMO_IMAGES = false` to replace the demo stock (owner's prior work OK if rights confirmed + labeled)
- [ ] **GBP + social profile URLs** → Business Info "profile URLs" in the admin
      panel (feeds JSON-LD `sameAs`)
- [ ] **Financing terms** (provider, plans) → Business Info; auto-publishes `/financing`
- [ ] **Team members** (names, roles, photos) → unlocks `/team`
- [ ] **Standard workmanship-warranty term** (years/coverage) → `/warranty` page
- [ ] **Real project photos** (CompanyCam or uploads) → unlocks `/gallery` +
      village-page proof sections
- [ ] Confirm drone-inspection capability before any page claims it (none do today)
- [ ] Real reviews (Google profile live?) → Reviews page + gated AggregateRating schema

**Accounts to provision (Claude builds code + gives click-by-click; never touches secrets/DNS):**

- [ ] GA4 measurement ID + (optional) GTM ID in Vercel env; Search Console verify (`docs/analytics-search-console.md`)
- [ ] Lead alerts: Twilio + Resend keys in Vercel (`docs/setup-leads.md`)
- [ ] HighLevel account → API key + location ID in Vercel (lead hub)
- [ ] Admin panel: Google OAuth app + Keystatic GitHub app (for sign-in + saving) — D2
- [ ] CompanyCam account + API key — D3
- [ ] JobNimbus (production CRM) — when first jobs land (~Aug)
- [ ] n8n on a small cloud instance — when QuickBooks + ads are live (D5)

## Branch / PR map

Merged to `main` (newest first; reconstructed from history — branch noted where notable):

- **PR #26** — Owner next-steps execution plan (Tier 0–2) as `docs/execution-plan-next-steps.docx`. Branch `claude/execution-plan-docs-fivp6q` (squash-merged; owner-authorized session-end merge).
- **PR #25** — docs: re-sequence roadmap for revenue-ASAP with two part-time owners (Tier 0 phone-ringers first; content engine deprioritized).
- **PR #24** — Copy review: fix statute citations, unverified facts, and legal-exposure claims (+ `docs/copy-review-2026-07-copy.md`, Tier 2.6 questionnaire).
- **PR #23** — Lead persistence net (private Vercel Blob), phone Meta CAPI + webhook rate limit, compliance scan.
- **PR #22** — docs: standardize canonical domain on apex northvaleroofing.com.
- **PR #21** — Full project review: P0 conversion-layer fixes + `docs/project-review-2026-07.md`.
- **PR #20** — Local-authority SEO expansion: Woodlands hub-and-spoke, village pages, definitive guides.
- **PR #19** — docs(status): record admin panel + CRM pipeline milestones.
- **PR #18** — docs: partner-facing website & tech overview (`docs/website-partner-overview.md`).
- **PR #17** — CRM lead pipeline hardened (HighLevel upsert + opportunity, CallRail→HighLevel, Meta CAPI). Branch `claude/crm-lead-gen-integrations-ijcx6k` (squash-merged; owner-authorized session-end merge).
- **PR #16** — fix(callrail): mask customer phone in webhook logs + record session decisions.
- **PR #15** — AI-generated-code security review checklist (`docs/security/ai-code-review-checklist.md`). Branch `claude/ai-code-security-checklist-t86f8r`.
- **PR #14** — Docs: record visual layer + demo-image system (session wrap-up).
- **PR #13** — Visual layer + demo images. Branch `claude/roofing-site-audit-bbl2i1` (squash-merged; one-time owner-authorized direct merge for production preview).
- **PR #12** — Docs: Vercel SSR + OAuth-callback lessons from admin sign-in debugging.
- **PR #11** — fix(admin): build Keystatic GitHub redirect_uri from the real host (not localhost).
- **PR #10** — fix(admin): exclude `/api` and `/keystatic` from ISR (fixes auth callback crash).
- **PR #9** — fix(admin): catch + surface auth callback errors instead of crashing.
- **PR #8** — fix(admin): friendly "panel not set up yet" page instead of a Keystatic crash.
- **PR #7** — Docs: log deployment + admin-auth decisions to the decision-log.
- **PR #6** — fix(admin): never cache auth redirects (no-store on sign-in / callback / gate).
- **PR #5** — fix(admin): make Keystatic + Google sign-in work in production.
- **PR #4** — Docs: correct launch-checklist (8 service-area pages; actual Lighthouse budgets).
- **PR #3** — D1 lead alerts. Branch `claude/owner-operations-kit` (stacked on the Phase-1 branch).
- **PR #2** — Phase-1 SEO harness. Branch `claude/repo-overview-architecture-2r2oti`.
- **PR #1** — original April scaffold (`ebleck55`). Closed unmerged: superseded by current `main`.

Operations-kit work continues on `claude/owner-operations-kit`, one draft PR per deliverable.
