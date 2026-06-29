# Photos & Reviews integrations — setup (owner manual steps)

The code is built and **env-gated**: it stays dormant (no network calls, nothing
shown) until you add the keys in Vercel, then it activates automatically. Claude
never sets secrets/DNS/billing.

## Google reviews (live on /reviews)

Pulls real reviews from your Google Business Profile.

1. Create/claim your **Google Business Profile** and get its **Place ID**
   (https://developers.google.com/maps/documentation/places/web-service/place-id).
2. In **Google Cloud Console**, enable the **Places API** and create an API key.
3. In **Vercel → Settings → Environment Variables**, set:
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
4. Redeploy. The `/reviews` page now shows live Google reviews merged with any
   reviews you add in the admin panel. (Only real reviews — never fabricated.)

## CompanyCam job photos

Surfaces real, geotagged job photos on the site (strong local-SEO + trust signal).

1. In **CompanyCam → Settings → Integrations / API**, create an **API token**.
2. In **Vercel**, set `COMPANYCAM_API_KEY`.
3. Redeploy. Photos become available to the gallery component
   (`src/components/PhotoGallery.astro`) via `src/lib/companycam.ts`.

> Today this is a build-time pull (refreshes when the site rebuilds, ~hourly via
> ISR). The Phase-2 upgrade (n8n) turns it into a scheduled sync that opens a
> preview PR as new tagged photos arrive.

## CallRail tracked calls → CRM

Turns a tracked phone call into a CRM lead, same as a form submission.

1. In **CallRail → Settings → Integrations → Webhooks**, add a webhook for the
   **Post-Call** event (not Pre-Call) pointing at
   `https://northvaleroofing.com/api/callrail-webhook`.
2. Set a shared secret on that webhook and put the same value in **Vercel** as
   `CALLRAIL_WEBHOOK_SECRET`. The endpoint verifies the HMAC-SHA1 signature and
   rejects anything unsigned (401) or unconfigured (503).
3. Redeploy. Completed inbound calls then upsert a HighLevel contact (and open an
   opportunity if a pipeline is configured — see `docs/setup-highlevel.md`) and
   fire the same instant SMS/email alert as a form lead.

> Why Post-Call only: CallRail fires both a Pre-Call and a Post-Call webhook per
> call. The endpoint acts only on completed inbound calls (those carry a
> `duration`), so pointing it at Post-Call avoids duplicate leads.

## HighLevel CRM + Meta conversions

HighLevel (lead routing + nurture) and Meta CAPI (server-side ad conversions)
activate the same way — code is built and env-gated. HighLevel has its own
walkthrough in **`docs/setup-highlevel.md`**; Meta needs `META_PIXEL_ID` +
`META_CAPI_TOKEN` in Vercel (see `TASKS_FOR_ERIC.md`).

## Behavior with no keys

Everything works exactly as before: `/reviews` falls back to admin-panel reviews,
the gallery renders nothing, the lead form still submits and redirects, and the
CallRail webhook returns 503. No errors, no network calls.
