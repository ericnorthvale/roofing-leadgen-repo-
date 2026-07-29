# Visual Reskin — Content-Protection Verification (Phase 1)

Date: 2026-07-29 · Compared: production state (`main` @ `4b1b225`) vs `northvale-visual-preview`

## Method

Automated Playwright capture of a content signature for 10 representative pages
(homepage, service, city, neighborhood, projects, educational article, about,
contact, financing, insurance-claims), each comparing:

- Full rendered visible text (`body.innerText`)
- Every heading (h1–h4, tag + text)
- Every link (text + href)
- Every form (action, method, every field name/type/required)
- Every form label
- Title, meta description, canonical, all `og:` tags, JSON-LD `@type`s, robots
- Every image alt attribute

## Results

| Category                                                                 | Differences     |
| ------------------------------------------------------------------------ | --------------- |
| **Unauthorized content differences**                                     | **0**           |
| **Functional differences** (forms, fields, actions, links)               | **0**           |
| **SEO differences** (title/description/canonical/og/JSON-LD/robots/alts) | **0**           |
| Authorized presentational differences                                    | 1 class (below) |

### The one authorized presentational difference

`innerText` reports button labels in capitals (e.g. "BOOK INSPECTION") because
the new `.btn` style applies CSS `text-transform: uppercase`. The HTML wording
is byte-identical ("Book inspection"); link text, accessibility tree, and
`textContent` are unchanged. A case-insensitive re-diff confirms **zero**
remaining differences of any kind on all 10 pages.

## Production safety confirmation

- Production branch: `main` · production commit (live at northvaleroofing.com): `4b1b225`
- All work is on `northvale-visual-preview`; `main` untouched; no deploy commands run.
- Restore point: commit `4b1b225` (redeploy or `git revert` target). Local tag
  `restore-point-pre-reskin` also marks it (tag push was rejected by the git
  proxy — the immutable commit hash is the authoritative restore point).
