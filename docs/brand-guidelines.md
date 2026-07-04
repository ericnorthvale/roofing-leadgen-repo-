# Northvale Roofing — Brand Guidelines

**Status:** Draft for owner review · supersedes the 2026 "Brand Identity Guide" PDF
**Scope:** Visual identity (logo, color, type, art direction, applications).
Voice and tone live in [`brand-voice.md`](./brand-voice.md) — this document does
not duplicate them. Brand facts (NAP, tagline, hours) are sourced from
[`src/lib/brand.ts`](../src/lib/brand.ts) / `src/data/business-info.json` and
must never be hardcoded elsewhere.

This document upgrades the original PDF with: measured WCAG contrast rules, an
accessible dark gold, named supporting tones with roles, full tint ramps, a
two-font type system, art direction, and application specs. Decisions recorded
here were made by the owner on 2026-07-04:

1. **Art direction:** light-first pages with navy-dominant "dark moments"
   (hero, footer, CTA bands).
2. **Typography:** Cormorant Garamond + Montserrat (Open Sans dropped).
3. **Logo assets:** designer's original PNG exports recovered from the
   owner's Drive Branding folder; vectors auto-traced from the PDF as a
   stopgap — see [Asset inventory](#asset-inventory).

---

## 1. Brand at a glance

| Item        | Value                                                     |
| ----------- | --------------------------------------------------------- |
| Name        | Northvale Roofing                                         |
| Legal name  | Northvale Roofing LLC                                     |
| Domain      | northvaleroofing.com                                      |
| Tagline     | "Same day. In writing."                                   |
| Promise     | Written estimate before we leave the driveway.            |
| Positioning | Bold & premium — established, neighborly-expert, truthful |

Signature phrases (use verbatim, don't paraphrase): "Same day. In writing." ·
"A named project manager." · "Forty-photo packet." · "Under 60 seconds." ·
"Built for the next storm, not the last one."

---

## 2. Logo system

Two marks, four color variants each. Files in
[`docs/brand-assets/`](./brand-assets/).

### 2.1 Primary wordmark

"NORTHVALE" in a high-contrast serif with a house-and-window glyph forming the
"A", over a letterspaced "ROOFING" with flanking rules.

| Variant | Fill      | Use on                                        |
| ------- | --------- | --------------------------------------------- |
| Gold    | `#C9A26C` | Navy or very dark photo backgrounds (primary) |
| Navy    | `#060E21` | White / light backgrounds (secondary)         |
| White   | `#FFFFFF` | Dark backgrounds where gold lacks presence    |
| Black   | `#0A0A0A` | Single-color print, engraving, mono fax/forms |

### 2.2 "N" monogram (icon mark)

Standalone mark for favicons, app icons, social avatars, watermarks, and
embroidery. Same four variants.

- Always place on a solid background (navy, white, gold-tint, or black).
- Never lock the monogram next to the full wordmark at sizes below 48px.
- The monogram is the source for the favicon/app-icon set (see §7.2).

### 2.3 Usage rules (carried from the PDF, still binding)

- **Clear space:** keep space equal to the cap-height of the "R" in ROOFING
  clear on all four sides.
- **Minimum sizes:** print ≥ 1.5 in wide; digital ≥ 150px wide (wordmark).
  Below 150px, switch to the monogram.
- Never stretch, skew, rotate, recolor outside the four variants, outline,
  or add drop shadows/gradients/effects.
- Never redraw the logo. (The traced SVGs in this repo are a sanctioned
  stopgap until the designer's vector source arrives — see §8.)

### 2.4 Tagline lockup

The tagline "Same day. In writing." is **not** part of the logo. When pairing:

- Set it in Montserrat Medium, letterspaced +8%, in the same color as the
  logo variant in use, at no more than 40% of the wordmark's width.
- Position: centered below the ROOFING line, one clear-space unit down.
- Never place the tagline inside the logo's clear space at header sizes;
  reserve the lockup for covers, yard signs, and social headers.

### 2.5 Logos on photography

- Only place the logo on photo areas that are visually quiet **and** dark
  enough: the gold or white wordmark needs a background darker than roughly
  navy-800 to hold contrast. When in doubt, put the logo on a solid navy band
  or a navy scrim (60–80% opacity) rather than raw photo.
- Never place the navy logo on photos.

---

## 3. Color

### 3.1 Primary palette

| Name               | Hex       | RGB                | CMYK             | Role                                   |
| ------------------ | --------- | ------------------ | ---------------- | -------------------------------------- |
| **Northvale Navy** | `#060E21` | rgb(6, 14, 33)     | 82 / 58 / 0 / 87 | Primary brand color; dark bands, text  |
| **Northvale Gold** | `#C9A26C` | rgb(201, 162, 108) | 0 / 19 / 46 / 21 | Primary accent **on dark only** (§3.3) |

Pantone references: **NEEDS DATA** — lock coated + uncoated refs with the
print vendor before ordering signage, wraps, or embroidery so the gold doesn't
drift between jobs.

### 3.2 Supporting tones (named, with roles)

The PDF showed three unnamed swatches. They are now named and scoped:

| Name           | Hex       | Role                                                                                                                                                                                                                                     |
| -------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cream**      | `#E8D5B0` | Warm tint backgrounds, table stripes, badge fills on light pages                                                                                                                                                                         |
| **Slate Gray** | `#888888` | Hairlines, disabled states, **large text only** (3.54:1 on white)                                                                                                                                                                        |
| **Ink Navy**   | `#1E1E2E` | ⚠️ Sits off-family: it has a purple cast (equal R/G, high B) next to the blue-black navy. **NEEDS DATA:** confirm intent with the designer, or drop it in favor of navy-900 `#0E182F`. Do not introduce it into the site until resolved. |

### 3.3 Accessible gold — the most important rule in this document

Northvale Gold fails WCAG on light backgrounds (**2.37:1 on white — fail even
for large text**). Two derived golds fix this; both keep the brand hue
(34.8°) and saturation (46%):

| Name          | Hex       | On white      | Permitted use                                      |
| ------------- | --------- | ------------- | -------------------------------------------------- |
| **Gold**      | `#C9A26C` | 2.37:1 ✗      | Dark backgrounds only; never as text/icon on light |
| **Gold Mid**  | `#BB8A46` | 3.07:1 (AA-L) | Large display text (≥ 24px / 19px bold) on light   |
| **Gold Deep** | `#956E37` | 4.60:1 (AA)   | Body-size text, links, icons on white/light        |

### 3.4 Approved pairings (measured)

All ratios computed with the WCAG 2.x relative-luminance formula
(script: contrast checker run 2026-07-04; re-verify any new pairing before use).

| Foreground on background | Ratio   | Verdict            |
| ------------------------ | ------- | ------------------ |
| Gold on Navy             | 8.12:1  | ✅ AAA             |
| White on Navy            | 19.22:1 | ✅ AAA             |
| Cream on Navy            | 13.34:1 | ✅ AAA             |
| Navy on White            | 19.22:1 | ✅ AAA             |
| Navy on Gold (buttons)   | 8.12:1  | ✅ AAA             |
| Navy on Cream            | 13.34:1 | ✅ AAA             |
| Gold Deep on White       | 4.60:1  | ✅ AA              |
| Gold Mid on White        | 3.07:1  | ⚠️ Large text only |
| Slate Gray on White      | 3.54:1  | ⚠️ Large text only |
| Gold on White            | 2.37:1  | ❌ Never           |
| White on Gold            | 2.37:1  | ❌ Never           |

**Button rule:** gold-filled buttons always carry **navy** text, never white.

### 3.5 Tint ramps (for digital implementation)

Generated from the brand anchors (navy-950 = Northvale Navy, gold-400 =
Northvale Gold, gold-200 = Cream, gold-600 = Gold Deep). These become the
Tailwind `@theme` tokens when the site migrates.

| Step | Navy      | Gold      | Neutral   |
| ---- | --------- | --------- | --------- |
| 50   | `#F5F6FA` | `#FBF8F4` | `#F7F7F8` |
| 100  | `#E8EBF3` | `#F5EEE5` | `#ECEDEE` |
| 200  | `#CAD3E7` | `#E8D5B0` | `#D6D8DB` |
| 300  | `#9CADD3` | `#D9BD97` | `#B3B6BC` |
| 400  | `#6480C4` | `#C9A26C` | `#8D919A` |
| 500  | `#4160AA` | `#AC7E3F` | `#6E727C` |
| 600  | `#29478E` | `#956E37` | `#565A61` |
| 700  | `#1F356B` | `#654A25` | `#414349` |
| 800  | `#16264B` | `#47341A` | `#2E2F33` |
| 900  | `#0E182F` | `#2D2110` | `#1D1E20` |
| 950  | `#060E21` | `#1A130A` | `#111113` |

### 3.6 Proportion (light-first with dark moments)

Per the owner's decision, pages are light-first. Target mix on a typical page:

- **~60%** white / navy-50 / gold-50 surfaces (content areas),
- **~30%** Northvale Navy (hero band, footer, CTA band, dark cards),
- **~10%** gold (CTAs, eyebrows on navy, accents, icon strokes).

Gold is a seasoning, not a surface — if a layout reads "gold page," it's
overdone. Long-form content (service pages, city pages, blog) stays on light
backgrounds for readability; navy owns the emotional moments.

---

## 4. Typography

Two families (the PDF's Open Sans is dropped; Montserrat absorbs its roles).
Both are open-license (Google Fonts) and must be **self-hosted as variable
woff2** following the existing pattern (`public/fonts/` +
`@font-face` in `src/styles/globals.css`) — never loaded from a CDN.

| Family                 | Role                                            | Weights        |
| ---------------------- | ----------------------------------------------- | -------------- |
| **Cormorant Garamond** | Display: hero text, H1/H2, large pull-quotes    | SemiBold, Bold |
| **Montserrat**         | Everything else: H3+, nav, buttons, body, forms | Regular–Bold   |

**Hard rule: no Cormorant Garamond below 28px rendered size.** It is a thin,
low-x-height face that turns wispy and hard to read small — below that
threshold, use Montserrat.

### 4.1 Type scale

| Level         | Size / leading | Face                                |
| ------------- | -------------- | ----------------------------------- |
| H1 — Hero     | 48 / 52px      | Cormorant Garamond Bold             |
| H2 — Section  | 32 / 38px      | Cormorant Garamond SemiBold         |
| H3 — Sub      | 22 / 28px      | Montserrat Bold                     |
| Body          | 16 / 24px      | Montserrat Regular                  |
| Caption/label | 12 / 16px      | Montserrat Medium, letterspaced +8% |

### 4.2 Fallback stacks

```css
--font-display: "Cormorant Garamond", "Fraunces", Georgia, "Times New Roman", serif;
--font-sans: "Montserrat", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
```

The previous production faces (Fraunces + Inter) remain in the fallback
stacks so the identity degrades gracefully if the brand fonts fail to load.

---

## 5. Art direction

### 5.1 Page anatomy (light-first, dark moments)

- **Header:** white, navy wordmark, gold-filled CTA with navy text.
- **Hero:** Northvale Navy band. Gold or white display type, gold eyebrow,
  cream supporting text. Photo heroes get a navy scrim.
- **Content sections:** white and navy-50/gold-50 alternating; navy-900 text.
- **CTA band:** navy, gold accents — the "premium moment" mid-page.
- **Footer:** navy-950, gold/white logo, cream/white text.

### 5.2 Photography

- **Real Northvale jobs only.** No stock in "recent work," before/after, or
  anything implying it's ours — that violates the FTC rule and repo Hard Rule
  #2. (`src/lib/demo-images.ts` stock is preview-only and must be off before
  launch.)
- Shot list per job: drone establishing shot, straight-on facade, 2–3 detail
  crops (ridge, flashing, drip edge), crew-at-work candid, finished wide shot
  at golden hour when possible.
- Grade warm and natural. No HDR halos, no oversaturated skies, no filters
  that misrepresent the finished product.
- People: crews in branded gear, real employees only, with consent.

---

## 6. Iconography & graphic devices

- Line icons, 1.5–2px stroke, squared terminals; navy on light, gold on navy.
- The flanking-rules device (from "— ROOFING —") may be reused as a section
  divider: thin rule, centered label in Montserrat caption style.
- No clip-art, no glossy 3D badges, no fake award seals (Hard Rule #2 —
  only real, held certifications may be shown, with their real marks).

---

## 7. Applications

### 7.1 Web UI

- **Primary button:** Gold `#C9A26C` fill, **navy** text (8.12:1), pill
  radius, min-height 48px. Hover: Gold Deep fill `#956E37` with white text
  (4.60:1).
- **Ghost button (light):** navy text, navy-200 border, navy-50 hover.
- **Ghost button (on navy):** white text, white 40% border, white 10% hover.
- **Links (light bg):** navy-700 default, Gold Deep hover.
- **Focus rings:** 3px Gold Deep on light, 3px Gold on navy.

### 7.2 Favicon & app icons (built from the N monogram)

- Master: gold N on navy square (rounded 20% radius for contexts that don't
  round automatically).
- Deliverables: `favicon.svg`, `favicon.ico` (16/32/48), `favicon-32.png`,
  `apple-touch-icon.png` (180×180), `icon-192.png`, `icon-512.png`, plus a
  **maskable** 512 variant with the N held inside the 40% safe zone.
- theme-color meta: `#060E21`.

### 7.3 Print, signage, vehicles, apparel

- **Yard signs:** navy field, gold wordmark, white phone number in Montserrat
  Bold ≥ 96pt equivalent; tagline lockup allowed. QR to /contact optional.
- **Vehicle wraps/magnets:** navy or white vehicles only; gold wordmark on
  navy, navy on white. Phone + domain in Montserrat Bold. No busy photos.
- **Apparel/embroidery:** monogram left chest (gold thread on navy garments,
  navy thread on light garments); wordmark across the back.
- All print gold must match the locked Pantone once chosen (see §3.1
  NEEDS DATA) — until then, proof against `#C9A26C` and eyeball-match.

### 7.4 Email signature

Navy name in Montserrat Bold, role in Slate Gray, gold hairline divider,
navy monogram (32px PNG), phone + domain as navy links. No banners, no quotes.

---

## 8. Asset inventory

All files in [`docs/brand-assets/`](./brand-assets/). Transparent backgrounds
throughout.

**Canonical rasters** — `docs/brand-assets/original/` holds the designer's
original PNG exports, recovered 2026-07-04 from the owner's Drive
`Branding/Logos/Brand Assets Northvale/transparent/` folder (a
`with_background/` set also exists in Drive; not mirrored here):

| File                                      | What it is                         |
| ----------------------------------------- | ---------------------------------- |
| `northvale_roofing_logo_transparent.png`  | Full wordmark, **gold**, 1359×1008 |
| `northvale_logo_{navy,white,black}.png`   | Full wordmark variants, 1359×1008  |
| `northvale_N_{gold,navy,white,black}.png` | Monogram variants, 536×536         |

Note: the designer's exported gold measures `#CAA36D` — one unit off the PDF's
own spec. Per the PDF's rule ("reproduce gold as #C9A26C in all digital
work"), **`#C9A26C` remains canonical**; treat the export's value as rounding.

**Traced vectors (stopgap)** — top level of `brand-assets/`; auto-traced from
the PDF art and verified side-by-side against the originals at 150px and 32px:

| File                                         | What it is                   |
| -------------------------------------------- | ---------------------------- |
| `northvale_logo_{gold,navy,white,black}.svg` | Full wordmark, traced vector |
| `northvale_N_{gold,navy,white,black}.svg`    | Monogram, traced vector      |

**NEEDS DATA (owner/designer):**

1. **True vector masters** (AI/EPS/SVG source) from whoever produced the PDF —
   the traced SVGs are faithful but are a stopgap, and the PDF's own rule is
   "never redraw."
2. **Pantone coated + uncoated** references for navy and gold (§3.1).
3. **Ink Navy `#1E1E2E` intent** — keep, correct, or drop (§3.2).

---

## 9. Relationship to the live site (migrated 2026-07-04)

This identity is **live on the site** (PR #32). What shipped:

- `@theme` ramps in `src/styles/globals.css` = §3.5 exactly (gold-400 = brand
  gold, gold-600 = Gold Deep; every gold text/icon/ring on light uses
  gold-600).
- `COLORS` in `src/lib/brand.ts`, `theme-color`, favicon/app-icon set (§7.2,
  built from the N monogram + `site.webmanifest`), `public/brand/logo*.svg`
  (traced wordmarks — still the §8 stopgap), and the OG image (rebuilt
  on-brand, served as PNG because social crawlers don't rasterize SVG).
- Fonts per §4: self-hosted variable Cormorant Garamond + Montserrat
  (`public/fonts/` + `@font-face` in `globals.css`, `font-display: optional`).
  The ≥28px Cormorant rule is enforced: base h1/h2 are display serif; h3/h4
  and all headings styled below 28px are Montserrat.
- Light-first/dark-moments anatomy of §5.1 unchanged; no NAP values changed.

Still open: swap in the designer's vector masters when they arrive (§8), and
re-run Lighthouse (`pnpm lhci`) as part of the next perf pass.
