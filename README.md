# roofing-leadgen

Website + lead-gen + content engine for a premium residential roofing business serving The Woodlands and NW Houston (Harris + Montgomery counties).

**Brand:** Northvale Roofing
**Domain:** northvaleroofing.com
**Owner:** ebleck55

> **Scaffold provenance:** the initial 21-file scaffold was built on `ebleck55/bleck-deal-engine@claude/roofing-lead-engine-plan-wPc6X` under `roofing-leadgen/` (MCP allowlist constraint). The full scaffold was copied here and extended — this repo is the permanent home.

## Stack (locked)

- **Site:** Astro 5 + Tailwind 4 + TypeScript (zero-JS-by-default for best Core Web Vitals)
- **Hosting:** Vercel (hybrid output + ISR on content pages)
- **Domain + DNS:** Squarespace Domains (registrar + DNS) — registered 2026-04-23
- **Automation / cron:** GitHub Actions
- **CRM + SMS + email + nurture:** HighLevel Pro SaaS
- **Call tracking + attribution:** CallRail Elite
- **Analytics:** GA4 + server-side GTM
- **Content pipeline LLM:** Anthropic Claude (primary) + OpenAI + Gemini
- **SEO intelligence:** Ahrefs Standard
- **Homeowner targeting data:** PropStream

## Key docs

- [`TASKS_FOR_ERIC.md`](TASKS_FOR_ERIC.md) — every open ask that needs a human
- [`STATUS.md`](STATUS.md) — phase-end summaries
- [`docs/brand-voice.md`](docs/brand-voice.md) — local-neighborly + premium-trusted + fast-response-urgency
- [`docs/compliance.md`](docs/compliance.md) — TCPA / CAN-SPAM / TDPSA / §27.02 / §701 / §4102 / §1102 checklist
- [`docs/utm-scheme.md`](docs/utm-scheme.md) — canonical UTM conventions
- [`docs/trademark-clearance.md`](docs/trademark-clearance.md) — USPTO TESS clearance log
- [`docs/runbooks/`](docs/runbooks/) — launch-checklist, storm-window, incident-response playbooks
- [`docs/lead-magnets/`](docs/lead-magnets/) — email-attachable lead magnet content
- [`briefs/README.md`](briefs/README.md) — content pipeline lifecycle docs

## Layout

```
.
├── .github/workflows/        # CI, content-pipeline, nightly-e2e, weekly-compliance
├── briefs/                   # content pipeline briefs (sample checked in; queue/ ignored)
├── docs/                     # brand, compliance, utm, runbooks, lead magnets, trademark
├── public/                   # static assets (favicon, brand/logo, og/default)
├── src/
│   ├── components/           # CTAButton, SiteHeader, LeadForm, Hero, TrustBar, …
│   ├── content/              # content collections (blog MDX, neighborhoods MD, reviews JSON)
│   ├── content.config.ts     # schema definitions (drafts gated from production)
│   ├── layouts/              # BaseLayout, ServiceLayout, NeighborhoodLayout, LegalLayout, BlogLayout
│   ├── lib/                  # brand, service-areas, personas, phone, utm, seo, legal, analytics, highlevel, callrail
│   ├── middleware.ts         # UTM + geo capture
│   ├── pages/                # home, /services/*, /[area], /for-[persona], /legal/*, /blog, /api/*
│   ├── scripts/              # content-pipeline + reviews-sync + compliance-scan (stubbed)
│   └── styles/globals.css    # Tailwind + brand tokens
├── tests/                    # unit (vitest) + e2e (playwright)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Development

```bash
pnpm install
pnpm dev           # local preview at http://localhost:4321
pnpm typecheck
pnpm lint
pnpm test          # unit + integration (vitest)
pnpm test:e2e      # Playwright against dev server (or staging with E2E_BASE_URL)
pnpm lhci          # Lighthouse CI (needs `pnpm build` first)
```

## Day-90 north star

By day 90: 50+ homeowner leads/wk @ ≤$75 CPL, 15+ signed agent referrers, 4+ signed insurance partners, 4 weekly content pieces auto-shipping with human review gate, GBP 20+ reviews ≥4.8, all 5 paid channels live, revenue-attributed to source for ≥60% of closed deals.
