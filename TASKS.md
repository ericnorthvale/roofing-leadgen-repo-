# TASKS.md — progress tracker

Source of truth for build progress. Update after every batch/PR.

## ▶ Next session — start here

**Complete the steps in `docs/setup-highlevel.md`.** The CRM lead pipeline is
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

## Phase 2 — Flagship city: The Woodlands (needs owner real data)

- [ ] City hub page (real local data, photos, trust signals)
- [ ] Core service-in-city pages
- [ ] Full schema + breadcrumbs + internal links + fast mobile CWV
- [ ] Validate → PR → pause for preview review

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

**Phase 2 — Automation (30–90d):**

- [ ] n8n (cheap cloud): revenue-attribution loop (lead→job→revenue), auto monthly
      owner report (QBO+HighLevel+GA4), review-request engine, CompanyCam→site (D3/D4).

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
