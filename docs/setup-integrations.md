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

## Behavior with no keys

Everything works exactly as before: `/reviews` falls back to admin-panel reviews,
and the gallery renders nothing. No errors, no network calls.
