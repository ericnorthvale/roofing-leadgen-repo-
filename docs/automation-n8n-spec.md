# Phase 2 automation — n8n workflow spec (ready to build)

Design spec for the n8n workflows that turn the system "unattended." Built when n8n
is live (cheap cloud instance) and the relevant accounts exist. Workflows are
**exported to git** (`automation/n8n/*.json`) and tested against test webhooks before
enabling — never hand-edited blind in production.

**Hosting (per decision-log):** small managed/cloud n8n (~$6–12/mo), NOT the home
Mac mini for production. Credentials live in n8n's encrypted store (not git).
Mac mini = dev/test only.

---

## Workflow 1 — Revenue-attribution loop _(the marketing-ROI prize)_

**Goal:** tie every dollar of revenue back to the channel that produced the lead.

- **Trigger:** JobNimbus "job won/paid" webhook (or QuickBooks invoice paid).
- **Steps:**
  1. Look up the contact's **`lead_source`** (set at the website → carried into
     HighLevel → JobNimbus; see `src/lib/lead-source.ts` + `docs/sops/crm-hygiene.md`).
  2. Read invoice/payment amount from QuickBooks.
  3. Append a row to the attribution store (Google Sheet in Drive `Analytics/`):
     `date, lead_source, city, service, revenue, gross_margin?`.
  4. Optionally push the value back to Google Ads / Meta as an offline conversion.
- **Output:** channel ROI (cost per lead vs. revenue per channel) in the dashboard.
- **Depends on:** HighLevel + JobNimbus + QuickBooks live; `lead_source` discipline.

## Workflow 2 — Scheduled owner report

**Goal:** the monthly/quarterly owner package assembles itself (per the launch plan's
reporting cadence).

- **Trigger:** cron (monthly by day 14; quarterly).
- **Steps:** pull P&L / AR aging (QuickBooks) + leads-by-source & pipeline (HighLevel)
  - traffic/conversions (GA4) → render a PDF/Doc → save to Drive → email Eric, with a
    link to the `major-decision-request-template.md` for any approvals.
- **Note:** can be run **assisted now** via the connected QuickBooks (Claude) before
  n8n exists; n8n makes it unattended.

## Workflow 3 — Review-request engine

**Goal:** automate the `docs/sops/review-request.md` process (real reviews only).

- **Trigger:** job marked complete (JobNimbus) → wait N days.
- **Steps:** send SMS + email (HighLevel) with the Google review link → monitor for a
  new review (Places API) → notify the team. Never incentivize or gate by sentiment.

## Workflow 4 — CompanyCam → website

**Goal:** new tagged job photos appear on the site automatically.

- **Trigger:** cron (e.g. nightly) or CompanyCam webhook.
- **Steps:** pull recent tagged photos (`src/lib/companycam.ts` logic) → write gallery
  entries → open a **preview PR** (human approves before live). Keeps alt-text discipline.

---

## Build & safety checklist (when implementing)

- [ ] Stand up n8n on the cheap cloud instance; enable 2FA; store credentials in n8n.
- [ ] Build each workflow against **test** webhooks/fixtures; verify outputs before enabling.
- [ ] Export each workflow JSON to `automation/n8n/` (version-controlled backup).
- [ ] Least-privilege API tokens (scoped) for HighLevel/JobNimbus/QBO/CompanyCam.
- [ ] Document each live workflow + its owner in this file; log the decision in `decision-log.md`.
