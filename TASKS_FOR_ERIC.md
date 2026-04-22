# Open tasks — human required

Ordered by the point in the launch path where they're blocking. Check off as they're done; add new ones at the appropriate tier.

## Tier 1 — blocks anything going live

- [ ] **Register `Northvale Roofing LLC`** with TX Secretary of State (~$300, 3–5 business days). See `docs/trademark-clearance.md` for why LLC-first.
- [ ] **Purchase `northvaleroofing.com`** at Cloudflare Registrar. Point DNS at Vercel.
- [ ] **Create Vercel project** from this repo. Set `PUBLIC_SITE_URL=https://northvaleroofing.com`.
- [ ] **Set up Google Workspace** or at minimum `hello@northvaleroofing.com` with MX/SPF/DKIM/DMARC records.
- [ ] **Create dedicated phone number** (Twilio or Google Voice Business). Update `BRAND.phoneE164` + `phoneDisplay` in `src/lib/brand.ts`.

## Tier 2 — analytics + CRM wiring (blocks attribution)

- [ ] **HighLevel**: create sub-account (location), issue Private Integration token. Paste into Vercel env as `HIGHLEVEL_API_KEY` + `HIGHLEVEL_LOCATION_ID`.
- [ ] **CallRail Elite**: provision 3 tracking numbers (site DNI pool + offline pool + GBP pool). Configure webhook → `/api/callrail-webhook` with an HMAC-SHA1 secret; set `CALLRAIL_WEBHOOK_SECRET` + `CALLRAIL_API_KEY` + `CALLRAIL_ACCOUNT_ID` + `PUBLIC_CALLRAIL_COMPANY_ID` in Vercel.
- [ ] **GA4**: create property + data stream. Set `PUBLIC_GA4_ID`.
- [ ] **Server-side GTM**: stand up container on Vercel subdomain (e.g., `metrics.northvaleroofing.com`). Set `PUBLIC_GTM_ID`.
- [ ] **Meta Business Manager + CAPI**: create ad account, issue CAPI token. Set `META_CAPI_TOKEN` + `META_PIXEL_ID`.
- [ ] **Google Ads**: create account, set up conversion import from HighLevel (nightly), set `GOOGLE_ADS_CONVERSION_ID`.
- [ ] **Google Business Profile**: claim and verify. Request Place ID (see comment in `.env.example`). Set `GOOGLE_PLACE_ID`.
- [ ] **Google Places API key** issued and scoped for reviews pull. Set `GOOGLE_PLACES_API_KEY`.

## Tier 3 — legal + compliance

- [ ] **USPTO TEAS 1(b) ITU application** for NORTHVALE ROOFING in IC 037 (after LLC is filed). ~$350 gov't fee; ~$800 with attorney (recommended).
- [ ] **Counsel review** of `/legal/privacy`, `/legal/terms`, `/legal/tcpa`, `/legal/accessibility`. Texas-barred attorney familiar with TDPSA + TCPA.
- [ ] **Fill in LEGAL constants** in `src/lib/legal.ts` — `emailFooterAddress` (physical mailing address) once LLC registered agent is final.
- [ ] **Photograph crew + trucks + finished-job sites** for about + reviews + service pages. Replace stock copy slots. No unlicensed stock.

## Tier 4 — content engine wiring

- [ ] **Implement `src/scripts/keyword-brief-generator.ts`** — consumes `keyword-seeds.json`, expands a slot into `briefs/queue/<slug>.json`.
- [ ] **Implement `src/scripts/content-draft.ts`** — consumes a brief, drafts full MDX blog post, writes with `status: draft`, opens a labeled PR.
- [ ] **Implement `src/scripts/compliance-scan.ts`** — weekly, greps built `dist/` for banned phrases (deductible-waiving, "hail-proof", unverified award claims).
- [ ] **Implement `src/scripts/reviews-sync.ts`** — nightly Google Places pull into `src/content/reviews/*.json`.
- [ ] **ANTHROPIC_API_KEY** + **OPENAI_API_KEY** set in Vercel env for the drafter scripts.

## Tier 5 — paid channels + launch

- [ ] **Produce lead magnet PDFs** listed in `docs/lead-magnets/README.md`.
- [ ] **Stand up HighLevel nurture workflows** for homeowner, agent, insurance, HOA, inspector personas.
- [ ] **Google Ads brand + non-brand campaigns** drafted and loaded (paused until CPL signal is real).
- [ ] **Meta conversion campaign** — hold 14 days post-launch until event volume supports optimization.
- [ ] **Run `docs/runbooks/launch-checklist.md`** end-to-end before flipping DNS live.
