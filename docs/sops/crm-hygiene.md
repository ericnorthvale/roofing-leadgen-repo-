# SOP: CRM Hygiene & the Lead Source Spine

**Why:** marketing ROI and follow-up only work if every lead carries one
consistent source value and moves through one consistent pipeline. This is the
attribution spine the audit flagged.

## The one rule that matters most: Lead Source

- Every lead has a single canonical **`lead_source`** value. The website sets it
  automatically (`src/lib/lead-source.ts`) and sends it to HighLevel as both a
  **custom field** (`lead_source`) and a **tag** (`lead_source:<value>`).
- Allowed values (keep this list tight; add deliberately):
  `google` · `google-ads` · `lsa` · `facebook` · `bing` · `referral` ·
  `gbp` (Google Business Profile) · `yard-sign` · `door-knock` · `website` (direct/organic).
- **Phone/manual leads:** whoever creates the contact MUST set `lead_source` by
  hand using the same list. A blank source = an unattributable lead = wasted ad money.
- The **same field name maps 1:1** into JobNimbus and QuickBooks when those legs
  go live, so a closed job can be traced to its channel.

## Pipeline stages (standardize across HighLevel)

`New → Contacted → Inspection booked → Inspection done → Estimate sent →
Won → Lost`. [NEEDS INPUT: confirm/adjust stage names with the team.]

- Move the card the moment the real-world event happens — the pipeline is the
  single source of truth for "where is this deal."

## Data-entry standard (every contact)

- Name, phone (E.164), address, `lead_source`, service type, and a one-line note.
- No duplicate contacts — search before creating.
- Disposition every lead within [NEEDS INPUT: e.g. 5 minutes] (speed-to-lead).

## Do / Don't

- ✅ Set `lead_source` on 100% of leads, including phone-ins.
- ✅ Keep the allowed-values list short and shared.
- ❌ Never invent or guess a source — if unknown, use `website` and note it.
