# TASKS.md — progress tracker

Source of truth for build progress. Update after every batch/PR.

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
- [ ] **D2 — Admin panel:** Keystatic at `/admin` behind Google Workspace SSO.
      Editable: Business Info, Photos, Reviews, Blog. City/service SEO pages stay Claude-crafted.

**Phase 2 — Automation (30–90d):**

- [ ] n8n (cheap cloud): revenue-attribution loop (lead→job→revenue), auto monthly
      owner report (QBO+HighLevel+GA4), review-request engine, CompanyCam→site (D3/D4).

**Phase 3 — Scale (90+d):**

- [ ] Role-based access + lead routing (§3508 team); AI layers (SMS responder, lead
      scoring, Claude-drafted supplements); per-rep/channel dashboards; security/testing hardening.

## Owner to-dos

**Unblocks indexable pages / content:**

- [ ] Real NAP: business phone + physical address (replaces `(281) 000-0000`, blank address)
- [ ] Real cert status (RCAT / GAF Master Elite — held vs. applicant)
- [ ] Operator/crew real experience (years, rough project scale) for "established" copy
- [ ] Real photos (owner's prior work OK if rights confirmed + labeled)

**Accounts to provision (Claude builds code + gives click-by-click; never touches secrets/DNS):**

- [ ] GA4 measurement ID + (optional) GTM ID in Vercel env; Search Console verify (`docs/analytics-search-console.md`)
- [ ] Lead alerts: Twilio + Resend keys in Vercel (`docs/setup-leads.md`)
- [ ] HighLevel account → API key + location ID in Vercel (lead hub)
- [ ] Admin panel: Google OAuth app + Keystatic GitHub app (for sign-in + saving) — D2
- [ ] CompanyCam account + API key — D3
- [ ] JobNimbus (production CRM) — when first jobs land (~Aug)
- [ ] n8n on a small cloud instance — when QuickBooks + ads are live (D5)

## Branch / PR map

- **PR #2** — Phase-1 SEO harness. Branch `claude/repo-overview-architecture-2r2oti` → `main`.
- **PR #3** — D1 lead alerts. Branch `claude/owner-operations-kit` → stacked on the Phase-1 branch.
- Operations-kit work continues on `claude/owner-operations-kit`, one draft PR per deliverable.
