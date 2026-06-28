# Admin Panel — setup (owner manual steps)

The admin panel lets you edit the site (Business Info / NAP / certs / experience,
and Reviews) from a friendly web form — no code. It lives at:

```
https://northvaleroofing.com/keystatic
```

Editing there commits the change to GitHub, which triggers a Vercel preview/deploy.
Two one-time setups are required, and **both are yours — Claude never sets secrets,
DNS, or billing.** Until they're done, the panel is locked (fail-closed by design).

## Layer 1 — Google sign-in (who can OPEN the panel): Cloudflare Access

Recommended because it's Google Workspace SSO with near-zero code.

1. Put the site behind **Cloudflare** (add the domain to Cloudflare, proxied). DNS
   change — your action.
2. **Cloudflare Zero Trust → Access → Applications → Add a self-hosted app.**
   - Application domain: `northvaleroofing.com`, path: `/keystatic` (add `/api/keystatic` too).
   - Identity provider: **Google** (connect Google Workspace).
   - Policy: **Allow** where email domain `= northvaleroofing.com` (add specific
     emails if you want tighter control).
3. That's it — Cloudflare injects a verified `Cf-Access-Authenticated-User-Email`
   header; our middleware (`src/lib/admin-auth.ts`) only allows
   `@northvaleroofing.com` (or whatever you set in `ADMIN_ALLOWED_DOMAINS` /
   `ADMIN_ALLOWED_EMAILS` in Vercel — optional; defaults to northvaleroofing.com).

> Security note: the panel must sit behind this provider. Without it, the gate
> still blocks no-identity requests, but the only way to truly prevent header
> spoofing is to keep Cloudflare Access (or Google IAP) in front. Layer 2 below is
> a second lock regardless.

## Layer 2 — Saving (who can WRITE): Keystatic GitHub App

This is what lets the panel commit your edits to the repo.

1. Go to **keystatic.com → connect to GitHub** (or create a GitHub App manually) for
   the repo `ericnorthvale/roofing-leadgen-repo-`. It generates three values.
2. In **Vercel → Settings → Environment Variables**, add:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
3. Redeploy. Now "Save" in the panel writes a commit (you authorize GitHub once).

## Optional env (Vercel)

- `ADMIN_ALLOWED_DOMAINS` — comma-separated (default `northvaleroofing.com`)
- `ADMIN_ALLOWED_EMAILS` — comma-separated specific emails (e.g. a contractor)

## What you can edit today

- **Business Info** — phone, address, email, hours, founded year, **experience**,
  **cert status**, **warranties**, **financing**. This is your single source of
  truth for NAP (it shows identically everywhere).
- **Reviews** — add REAL customer reviews only. (Inventing reviews is illegal under
  the FTC 2024 rule and an SEO risk — the panel reminds you.)

City/service SEO pages stay Claude-crafted; you give the facts/photos, Claude writes them.

## Local editing (developers)

`pnpm dev` → http://localhost:4321/keystatic runs in local mode (no SSO, writes to
your local files). Production uses GitHub mode automatically.
