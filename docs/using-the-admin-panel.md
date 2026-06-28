# Using the admin panel (fill in info & test it)

This is the "how do I actually use it" guide. For the one-time technical setup, see
`setup-admin-panel.md` first — until that's done, sign-in won't work.

## What the panel is for

A web form where you (Eric/Greg) edit parts of the site yourself — no code:

- **Business Info** — your phone, address, email, hours, experience, certifications,
  warranties, financing. (This is the single source of truth; it updates everywhere.)
- **Reviews** — add **real** customer reviews.

City/service SEO pages stay Claude-built — you give the facts, Claude writes them.

## How to access it

**Requires the one-time setup in `setup-admin-panel.md`** (Google sign-in + the
Keystatic GitHub app). Once that's done:

1. Go to **`https://northvaleroofing.com/keystatic`**.
2. You'll be asked to **sign in with Google** — use your `@northvaleroofing.com`
   Workspace account. (Other accounts are blocked.)
3. The first time, you'll also authorize **GitHub** once (this is what lets your
   edits save). After that it just works.

> No setup yet? A developer can preview it instantly with `pnpm dev` →
> `http://localhost:4321/keystatic` (local mode, no sign-in) to show you the screens.

## How to fill in your info (do this first)

1. Open the panel → click **Business Info**.
2. Fill in:
   - **Phone (display)** e.g. `(281) 555-1234` and **Phone (dialable)** `+12815551234`
   - **Street address**, **City**, **State**, **ZIP**
   - **Email**, **Business hours**, **Founded year**
   - **Experience** — a TRUE line, e.g. "Crews with 20+ years across Houston"
   - **Certification status** — only what's real (e.g. "GAF Master Elite applicant")
   - **Warranties** and **Financing** you actually offer
3. Click **Save**.

## How to test it (safe)

1. Make a small, obvious edit (e.g., change hours), **Save**.
2. Saving creates a **commit** → Vercel builds a **preview link** in a minute or two.
3. Open the preview and confirm your change shows (the phone/address appears in the
   header/footer and on contact pages — it's the single source).
4. Happy? It goes live on the next deploy. Not happy? Just edit again and save — or
   ask Claude to revert. Nothing you do here can break the site; bad data is caught
   before it goes live.

## Adding a review (real only)

**Reviews → + Create** → enter the customer name, source (Google/etc.), rating,
"when" (e.g. "2 weeks ago"), and the review text → **Save**.
⚠️ Only enter reviews a customer actually wrote. Inventing reviews violates the FTC's
2024 rule and Google's policy — the form reminds you.

## If something looks off

Tell Claude what you changed and what you expected. Because every edit is a tracked
commit, anything can be reviewed or rolled back cleanly.
