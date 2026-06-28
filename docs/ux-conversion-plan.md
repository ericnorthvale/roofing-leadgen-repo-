# UX / conversion plan (web + mobile)

Conversion-focused review of the site, with what's been executed and what's
deferred. Goal: more leads from the same traffic, on mobile especially (most
roofing traffic is mobile).

## Executed now (highest impact, low risk, zero fabrication)

- **Sticky mobile call/text bar** (`MobileClickToCall.astro`) — one-tap "Call now"
  / "Text us" at any scroll depth on mobile; body gets bottom padding so nothing is
  covered. The single biggest mobile-conversion lever for a roofer.
- **Click-to-call CTA everywhere** (`PhoneCTAButton.astro`) — added to the hero and
  to service + city page CTA rows, so phone-first visitors convert without the form.
  Uses the single BRAND phone source (becomes real the moment NAP is set).
- **Trust bar above the form** on service pages (already there on city pages) —
  reassurance right before the conversion point.
- **Footer CTA band** — a "Book / Call" rescue for visitors who scroll to the bottom.
- **48px tap targets** on all buttons (WCAG) — fewer mis-taps on mobile.
- **Lower mobile form friction** — the optional "notes" field is hidden on mobile
  (still submitted on desktop); all required fields kept.
- Every CTA carries a unique `data-cta-id` so GTM/GA4 can measure phone-vs-form per button.

All changes keep the zero-JS-by-default, fast-CWV approach (no new libraries; the
sticky bar uses `contain: layout`).

## Deliberately NOT done

- **Fabricated social proof** (the audit suggested a hero "4.9★ / 500+ roofs" line).
  **Skipped** — inventing review counts/job counts violates our hard rules + the FTC
  rule. A real rating block will be added once genuine Google reviews exist (the live
  Google-reviews pull is already built, env-gated).

## Deferred (worthwhile, larger or lower-leverage)

- A separate 3-field "quick capture" mobile form variant (bigger refactor; current
  form already trimmed on mobile).
- Inline form error-state styling/messages (adds JS; "lightweight now" posture).
- Mobile-specific hero subhead, 2-col service-card grid, section-spacing tuning —
  nice polish, lower leverage.

## Measure it (close the loop)

Once GA4 is live, compare phone (`*-call`, `mobile-call`) vs form conversions by
`data-cta-id`, desktop vs mobile. Feed the numbers back (Drive export → Claude) to
decide the next round. Note: the placeholder phone makes click-to-call inert until
real NAP is entered — setting NAP activates every call CTA at once.
