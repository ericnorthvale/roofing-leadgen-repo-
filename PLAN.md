# PLAN.md — Northvale Roofing SEO Engine

## Why this exists

We are building a fast, trustworthy local-roofing website for the Houston metro
plus an SEO engine that can **scale safely**. The thing we are deliberately
avoiding is the doorway-page / scaled-content-abuse pattern that Google's
2025–2026 spam and core updates penalize (mass near-identical city/service
pages). We build the SYSTEM to scale, but we **gate publishing on real,
page-specific value**: a page only gets indexed when it carries substantial,
distinct, true local content.

This repo was already a well-built Astro scaffold. This plan hardens its SEO
foundation, replaces name-swapped boilerplate + invented facts with a real,
gated data model, and proves quality on one flagship city before any scaled
expansion.

## Owner decisions (locked)

- **Service areas (8):** Houston, Spring, Cypress, The Woodlands, Kingwood,
  Tomball, Magnolia, Conroe.
- **Flagship city (Phase 2):** The Woodlands.
- **Positioning:** "Bold & premium" — read like an established premium
  contractor, but the Hard Rules below override "fake it." No fabricated
  reviews, stats, certifications, or address. Unknown specifics become a visible
  placeholder + a `NEEDS DATA` flag, never invented.
- **Service pages:** converted into a data model (records, not hardcoded copy).

## Phases

### Phase 0 — Audit (done)

Findings are in git history / the team plan. Stack: Astro 5 static + Tailwind 4
on Vercel, pnpm/Node 20, CI with Lighthouse budgets. Solid SEO base (canonical,
LocalBusiness + Breadcrumb JSON-LD, sitemap/robots). Gaps: no rich data model,
no quality gate, no Service/FAQ schema, sitemap doesn't exclude noindex pages,
doorway-shaped city boilerplate, and some invented facts already in copy.

### Phase 1 — Foundation / SEO harness (this PR; builds the system, not new pages)

1. Root `CLAUDE.md` — brand/NAP, hard rules, SEO standards, review workflow.
2. **Data model** — `src/lib/service-areas.ts` (8 cities, rich fields,
   `dataCompleteness`) + new `src/lib/services.ts` (the 5 services as records).
3. **Quality gate** — `src/lib/quality-gate.ts` `isIndexable(record)`: a page is
   indexable only when `dataCompleteness === "complete"`, NAP is real, and the
   required distinct fields are present; otherwise it renders `noindex`.
4. **SEO helpers + components** — `serviceJsonLd` (Service + areaServed) and
   `faqPageJsonLd` in `src/lib/seo.ts`; `Faq`, `RelatedLinks`, and an
   image/alt wrapper component.
5. **Programmatic sitemap + robots** — sitemap auto-excludes any `noindex` /
   gate-failing page (single source of truth in `src/lib/routes.ts`). Add an
   HTML sitemap page.
6. **GA4 + Search Console** — GA4 is already wired (needs the ID); document the
   manual Search Console verification step (no DNS changes by Claude).
7. **Scrub invented facts** — replace fabricated specifics with confident-but-
   true framing or a flagged placeholder.
8. Validate: build passes, JSON-LD validates, Lighthouse healthy, links OK. PR.

> Effect of the gate in Phase 1: city pages that still lack real, distinct local
> data render `noindex` and drop out of the sitemap until Phase 2/3 fills them
> with real content. This is intentional and safe — thin pages should not be
> indexed. Service pages stay indexable once their copy is scrubbed.

### Phase 2 — Flagship city: The Woodlands (needs owner's real data)

City hub + core service-in-city pages, each genuinely unique and locally
specific, with real photos, trust signals, full schema, breadcrumbs, internal
links, fast mobile CWV. This becomes the quality template. PR → pause for
preview review.

### Phase 3 — Gated expansion

City by city / neighborhood by neighborhood, in small batches (5–20 pages).
Only build pages with real, distinct data; data-less pages are `noindex`
"NEEDS REAL DATA" drafts. After each batch: build + quality gate + schema
validation + broken-link check, then a fresh reviewer subagent checks the batch
against this plan and the Phase-2 bar. Update TASKS.md every batch.

## Hard rules (also in CLAUDE.md — never break)

- No page that differs only by a swapped city/neighborhood/service name. Every
  indexable page carries substantial, real, page-specific content.
- Never fabricate any fact (addresses, phones, projects, stats, certs, reviews).
  Unknown = visible placeholder + flag for a human.
- NAP (name, address, phone) byte-for-byte identical on every page.
- Thin / data-incomplete pages render `noindex` and are excluded from the sitemap.
- Never push to `main`. All work via PR against a Vercel preview.
- Never modify DNS, domain settings, secrets, env vars, billing, or auth. Stop
  and ask if a task seems to need these.
- Confirm before any bulk delete/move/rename.

---

# The Operating System (Architecture, Automation, Security, SDLC, Testing, Cost)

Beyond the SEO site, Northvale needs a connected operating system two
non-technical owners can run and scale to a sales team, with automation at the
core. Reconciled with the Joint Launch Plan.

## Locked stack decisions

- **Lead/automation hub = HighLevel** — the website posts leads here; it runs
  speed-to-lead SMS/email, nurture, review requests, and sales-team lead routing.
- **Production CRM = JobNimbus, added later** (~Aug, when jobs start). **No
  AccuLynx.** Website never integrates to the production CRM (HighLevel→JobNimbus
  is a CRM-to-CRM handoff), so it doesn't affect website code.
- **Admin panel sign-in = Google Workspace SSO** (restricted to @northvaleroofing.com).
- **Photos = CompanyCam auto-pull** (real, geotagged → strong local SEO + trust).
- **Automation = native + HighLevel first; n8n for custom glue only**, on a cheap
  cloud instance (Mac mini for dev). No duplicated wiring.
- **Finance = full revenue-attribution loop, phased**; assisted owner reports can
  start now via the connected QuickBooks.
- **Security/testing = lightweight now, harden before scaling.**

## Architecture (data flow)

Website (Vercel) → **HighLevel** (leads/automation) → **JobNimbus** (jobs) →
**QuickBooks** (money); **CompanyCam** (photos) + **GA4** (traffic) feed in; **n8n**
glues the gaps + scheduled jobs. Source of truth per domain: content = GitHub;
leads = HighLevel; jobs = JobNimbus; money = QuickBooks; photos = CompanyCam.

## Build sequencing (operations kit)

1. **D1 — Lead alerts + safety net** ✅ (PR #3): instant SMS/email so no lead is lost.
2. **D2 — Admin panel** (Keystatic + Google SSO): owners edit Business Info, photos,
   reviews, blog. City/service SEO pages stay Claude-crafted.
3. **D3/D4 — CompanyCam photos + Google reviews** (env-gated).
4. **D5 (later) — n8n**: revenue-attribution loop + scheduled owner reports; then
   pre-scale security/testing hardening.

## Security baseline (phased)

NOW (cheap/essential): 2FA on all accounts; Google SSO for admin; secrets in env
(not git); HTTPS; webhook signature verification; honeypot + rate-limit on
`/api/lead`; TCPA/TDPSA consent capture. DEFER to hardening: Sentry, automated
dependency scanning, formal PII retention/deletion policy, CSP tightening,
access-audit cadence.

## SDLC + testing

Branch → PR → Vercel preview → review → merge → deploy. CI: typecheck, lint,
build, link-check, Lighthouse (+ unit/integration/E2E, `npm audit`, secret-scan as
we harden). Tests: unit (Vitest — quality gate, phone, utm, notify, rate-limit),
integration (`/api/lead`), E2E (Playwright smoke + lead flow + admin auth-gate),
schema validation, synthetic monitoring (nightly lead test). n8n workflows
version-controlled in git, tested before prod.

## Cost (approx monthly run-rate, USD — verify; excludes ad spend + payroll)

Launch ≈ **$330–500/mo** (Vercel, Google Workspace, HighLevel, CompanyCam,
QuickBooks, n8n VPS, call tracking, Twilio/Resend usage). At scale ≈
**$900–1,400/mo** (+ JobNimbus seats). Ad spend is separate (~$4.5k–7k/mo per
launch plan: LSA + Google + Facebook).

## Maintenance

Mostly automated + Claude-assisted, Greg-light: weekly alert/review checks;
monthly auto-report + dependency PRs + SEO snapshot; quarterly security review +
audits; annual renewals calendar. Bookkeeper/CPA own QuickBooks.
