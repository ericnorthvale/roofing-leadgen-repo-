# SOP: Revenue attribution (manual first)

**Why:** so ad spend isn't blind. The point of the whole `lead_source` spine is to answer
one question — _which channel actually made money?_ You don't need n8n or any
infrastructure to start; a weekly manual join gives ~80% of the value at 20+ jobs. Build
the habit now with a spreadsheet; automate it later (n8n Workflow 1) once the schema is
proven.

**Owner:** GM / whoever runs the weekly numbers.

## The weekly join (15 minutes)

1. **Open the attribution sheet** (Google Sheet in Drive `Analytics/`). Columns:
   `date, lead_source, city, service, revenue, gross_margin` (add `stage` for insurance
   jobs — see below).
2. **Pull won/paid opportunities from HighLevel** for the week (the `lead_source` field +
   tag are already set at the website and carried through — `src/lib/lead-source.ts`,
   `docs/sops/crm-hygiene.md`).
3. **Match each to its QuickBooks invoice/payment** for the revenue amount. One row per
   closed job.
4. **Fill `gross_margin`** from job costing (target GM ≥ 35% retail / ≥ 30% insurance from
   job #1).
5. **Review the roll-up:** revenue and gross margin **by `lead_source`** vs. that channel's
   spend = cost-per-lead and revenue-per-channel. That's the number that decides where the
   next ad dollar goes.

## Offline-conversion upload (the compounding step)

Once a job closes, upload the **closed revenue back to Google Ads / Meta** as an offline
conversion (keyed on the click id / lead). This teaches the ad platforms to optimize for
_revenue_, not just form fills — the single most compounding automation in the plan. Do it
manually/weekly at first; n8n automates it later.

## Guard the CRM-to-CRM seam (where attribution dies)

When JobNimbus goes live (~first jobs, ~Aug), **`lead_source` + the HighLevel contact id
must carry into JobNimbus as custom fields.** Make it an acceptance test: create a test
lead, push it through to a JobNimbus job, and confirm `lead_source` survived. If it doesn't
carry, every downstream revenue number is guesswork.

## Insurance-specific note

Age insurance AR by **claim stage** (ACV received / depreciation pending / supplement
pending), not standard AR aging — standard aging misleads on insurance work. Keep a
materials-float cash policy for storm surges.

## Hard lines

- Never guess a `lead_source`. If it's blank, fix the capture — don't backfill a guess.
- Attribution is only as good as the data-entry discipline in `crm-hygiene.md`.
