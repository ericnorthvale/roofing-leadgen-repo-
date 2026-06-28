# UTM scheme — Northvale Roofing

One scheme, six channels. Applied consistently so GA4, HighLevel, and the CallRail→Google Ads bridge all agree on "where did this lead come from."

## Taxonomy

| Key                | Values                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utm_source`       | `google` · `meta` · `bing` · `nextdoor` · `yelp` · `gbp` · `email` · `sms` · `direct-mail` · `referral` · `organic`                                            |
| `utm_medium`       | `cpc` · `organic` · `social-paid` · `social-organic` · `email` · `sms` · `display` · `print` · `referral`                                                      |
| `utm_campaign`     | Lowercase, kebab, channel-scoped. Examples: `google-brand-woodlands`, `meta-storm-retargeting-q2`, `gbp-replacement-2026-spring`, `nextdoor-q3-storm-response` |
| `utm_content`      | Creative or placement identifier (ad variant, email template ID, landing page variant). Max 128 chars.                                                         |
| `utm_term`         | Keyword for paid search only. Otherwise leave empty.                                                                                                           |
| `gclid` / `fbclid` | Auto-captured by middleware. Do not manually set.                                                                                                              |

## Enforcement

- `src/lib/utm.ts` truncates every value to 128 chars. Anything longer is sliced in storage.
- `src/middleware.ts` reads params on every request and persists them into `Astro.locals.utm`.
- `src/components/LeadForm.astro` mirrors the payload into `localStorage` under `nv_utm` so cross-session attribution survives.
- The `/api/lead` endpoint reads both the form field and `locals.utm` and merges (form-field wins for URLs the visitor actually arrived on; server-side geo/headers supplement).

## Channel-specific notes

### Google Ads

- Auto-tagging ON (gclid). If you disable auto-tag for any reason, every ad must have manual UTMs appended.
- Offline conversion import connects HighLevel → Google Ads on a nightly job. Needs `gclid` persisted on the lead record for the 90-day GCLID window.

### Meta Ads

- `fbclid` captured automatically. CAPI (server-side pixel) mirrors `lead_submitted` + `call_started` events with hashed email/phone.
- Do not use Meta's auto-UTM feature — it overwrites `utm_campaign`. Set manually.

### Google Business Profile

- Every GBP post, website link, and booking link uses `utm_source=gbp&utm_medium=organic` + a campaign tag describing the service or offer.

### Email (HighLevel)

- Every email template has UTMs pre-wired. Default: `utm_source=email&utm_medium=email&utm_campaign={workflow-name}`.

### SMS (HighLevel)

- All outbound SMS with a link uses `utm_source=sms&utm_medium=sms&utm_campaign={workflow-name}`. Link shortener disabled — full URLs survive forwarding.

### CallRail

- CallRail form + call tracking links auto-tag with CallRail's own parameters; we also manually set `utm_source` per tracking number so the source is consistent even if CallRail's attribution differs.
