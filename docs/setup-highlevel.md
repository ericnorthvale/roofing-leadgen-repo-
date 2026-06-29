# HighLevel CRM — setup (owner manual steps)

HighLevel is your lead + automation hub. Once it's connected, every website form
submission (and every tracked phone call) automatically **creates a contact and
opens a deal in your sales pipeline**, tagged with where the lead came from — so
nothing falls through and you can see ROI by channel.

The code is already built and **env-gated**: it does nothing until you create the
account and paste the keys into Vercel, then it activates on the next deploy.
**Claude never touches secrets, billing, or DNS** — these are your steps.

You'll end up with up to four values in Vercel:

| Vercel env var                | What it is                          | Required? |
| ----------------------------- | ----------------------------------- | --------- |
| `HIGHLEVEL_API_KEY`           | Private Integration token           | Yes       |
| `HIGHLEVEL_LOCATION_ID`       | Your sub-account (location) id      | Yes       |
| `HIGHLEVEL_PIPELINE_ID`       | The sales pipeline to drop deals in | Optional  |
| `HIGHLEVEL_PIPELINE_STAGE_ID` | The first stage (e.g. "New Lead")   | Optional  |

If you set only the first two, leads create **contacts**. Add the last two and
each lead also opens an **opportunity** in your pipeline.

## 1. Create the sub-account (Location) and get the Location ID

1. In HighLevel, create (or open) the **Northvale Roofing** sub-account.
2. Go to **Settings → Business Profile**. The **Location/Business ID** is shown
   there, and it's also the long id in the dashboard URL:
   `app.gohighlevel.com/location/<THIS_IS_THE_LOCATION_ID>/...`
3. That value → `HIGHLEVEL_LOCATION_ID`.

## 2. Issue a Private Integration token

1. In that sub-account, go to **Settings → Private Integrations** → **Create new
   integration**.
2. Give it a name (e.g. "Website lead intake") and grant at minimum the
   **Contacts** and **Opportunities** scopes (read + write).
3. Create it and **copy the token** (you only see it once).
4. That token → `HIGHLEVEL_API_KEY`.

## 3. Build the sales pipeline (optional but recommended)

1. Go to **Opportunities → Pipelines → Create Pipeline**. Name it (e.g. "Sales").
2. Add your stages — the first one is where new website leads land
   (e.g. **"New Lead"** → "Contacted" → "Estimate" → "Won"/"Lost").
3. **Find the IDs.** HighLevel doesn't show them on the settings screen, so use
   one of these:
   - **From the URL:** open the pipeline in the Opportunities view; the address
     bar contains `pipeline=<PIPELINE_ID>` (and selecting a stage shows the
     stage id), **or**
   - **From the API:** with your token, call
     `GET https://services.leadconnectorhq.com/opportunities/pipelines?locationId=<LOCATION_ID>`
     with headers `Authorization: Bearer <TOKEN>` and `Version: 2021-07-28`. The
     response lists each pipeline's `id` and its `stages[].id`.
4. Pipeline `id` → `HIGHLEVEL_PIPELINE_ID`; the first stage's `id` →
   `HIGHLEVEL_PIPELINE_STAGE_ID`.

## 4. Create the custom fields the site writes to

So attribution data lands in named fields (not just tags), create these **contact
custom fields** in **Settings → Custom Fields**. The field **key** must match
exactly (lowercase, underscores):

`lead_source`, `service`, `notes`, `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `utm_term`, `gclid`, `fbclid`, `landing_path`, `first_touch_at`

Tracked phone calls additionally use: `channel`, `callrail_call_id`,
`tracking_number`, `call_duration`, `call_recording`, `callrail_source`.

> `lead_source` is the important one — it's the single normalized channel value
> that should map 1:1 across HighLevel → JobNimbus → QuickBooks for clean ROI
> reporting. Any field you don't create just won't be stored; nothing breaks.

## 5. Paste into Vercel and redeploy

1. **Vercel → your project → Settings → Environment Variables**, add the values
   from steps 1–3.
2. Vercel redeploys automatically when you save env vars.

## 6. Test it

1. Submit the form on the live site (or a preview) with your own info.
2. In HighLevel you should see a **new contact** appear within a few seconds, with
   the `lead_source` field + tags populated — and, if you set the pipeline vars, a
   **new opportunity** in the "New Lead" stage.
3. Submitting again with the same phone/email **updates** that contact rather than
   creating a duplicate (we use the upsert endpoint).

### What happens if something's missing

- **No HighLevel keys:** the form still works and still emails/texts you (the
  day-one safety net in `docs/setup-leads.md`); HighLevel is simply skipped.
- **Keys but no pipeline IDs:** contacts are created, opportunities are skipped.
- **A HighLevel hiccup:** the lead still submits and you still get the instant
  alert — a CRM outage never loses a lead.

> Implementation note for whoever maintains the site: the exact v2 request shapes
> live in `src/lib/highlevel.ts` and were built to the documented API. Once the
> real token exists, confirm the contact/opportunity payloads against the live
> account and adjust there if HighLevel's API has shifted.
