# Northvale Visual System — Phase 1 (reskin)

Source of truth: `src/styles/globals.css` (`@theme` tokens + `@layer components`).
Brand hard rules still apply (docs/brand-guidelines.md): gold text on light uses
gold-600 only; gold fills carry navy text; Cormorant never below 28px rendered.

## Tokens

| Token                            | Value                 | Use                                                             |
| -------------------------------- | --------------------- | --------------------------------------------------------------- |
| `--color-navy-950`               | `#060e21`             | Near-black bands: header, footer, final CTA band, mobile menu   |
| `--color-surface-ivory`          | `#f8f5ef`             | Warm light band: heroes, long-form content, reviews             |
| `--color-surface-cream`          | `#f2ede3`             | Warmer accent band: trust bar                                   |
| `--color-gold-400 / -600 / -300` | brand golds           | Primary CTA fill / gold text on light / gold text-hover on dark |
| `--radius-card`                  | `0.375rem`            | Cards + media (architectural, near-square)                      |
| `--radius-btn`                   | `2px`                 | All buttons + hamburger                                         |
| `--radius-pill`                  | `9999px`              | Genuine pills only (badges, chips)                              |
| `--shadow-card(-hover)`          | softened, navy-tinted | Cards on hover; hero image                                      |
| `--spacing-section`              | `6rem`                | Section rhythm reference                                        |

## Typography

- **Display:** Cormorant Garamond (weight 500, letter-spacing −0.015em, line-height 1.08) on `h1/h2`. Homepage hero `2.5rem → text-6xl`; section `h2` `text-3xl md:text-4xl`; dark-band CTA `text-4xl md:text-5xl`.
- **UI/body:** Montserrat. Body `--color-ink-800`; supporting text `ink-700` at `leading-relaxed`.
- **`.eyebrow`:** 12px Montserrat 600, 0.2em tracking, uppercase, gold-600 (use gold-300 utilities on dark).
- **`.rule-gold`:** 56×2px gold bar under headings — the section accent (use `mx-auto` on centered bands).

## Buttons

- `.btn` — rectangular (2px), 13px, 600 weight, 0.12em tracking, uppercase (presentational transform; markup wording unchanged), ≥48px tall, −1px hover lift, 180ms eases.
- `.btn-primary` — gold-400 fill + navy-950 text (brand §7.1); hover gold-600 + white.
- `.btn-ghost` — hairline navy-300 border on light; hover darkens border only.
- `.btn-ghost-dark` — for navy bands: white/40 hairline, hover white/85 + faint fill. Replaces the old inline-styled dark ghost.

## Bands (section variants)

| Variant     | Recipe                                                                                | Where                                  |
| ----------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| Dark        | `bg-navy-950 text-white`, hairline `border-white/10`, white serif headings, gold rule | Header, footer, final CTA, mobile menu |
| Ivory       | `bg-surface-ivory` + `border-navy-100` hairlines                                      | Heroes, long-form guide, reviews       |
| Cream strip | `bg-surface-cream`, uppercase tracked items, gold dot separators                      | Trust bar                              |
| White       | default                                                                               | Card grids, FAQ                        |

Rule: never two adjacent dark bands mid-page; long-form SEO content always sits on light.

## Cards

- Hairline `border-navy-100`, white fill, radius-card, **no resting shadow**; hover = shadow-card-hover + border-navy-300 + 2px lift (ServiceCard).
- Review cards: 2px gold top border as the quiet accent.

## Imagery

- Sharp-ish corners (radius-card), calm shadow; hero image gets an offset 1px gold frame (`absolute -right-3 -bottom-3 border-gold-400`, decorative, `aria-hidden`).
- Existing `ImagePlaceholder`/`RoofImage` system, aspect ratios, alt text: untouched.

## Motion & accessibility

- CSS-only transitions 150–250ms; hover lifts ≤2px; no parallax, no JS animation.
- Global `prefers-reduced-motion` kill-switch retained; gold-600 focus ring retained (works on light + dark).
- Contrast spot-checks: navy-100 text on navy-950 ≈ 14:1; navy-800 on cream ≈ 12:1; gold-600 on ivory ≈ 4.3:1 (used ≥14px semibold uppercase = large-text tier); gold-300 on navy-950 ≈ 9:1.

## When to use what

- New page header (light): ivory band → breadcrumbs → serif `h1` → gold rule → summary (`ink-700`) → button row.
- Section heading: `h2` (3xl/4xl) + `.rule-gold mt-5`; add `.eyebrow` above only where the page already has kicker copy.
- Conversion band: dark variant, centered, serif heading, primary + ghost-dark buttons.
