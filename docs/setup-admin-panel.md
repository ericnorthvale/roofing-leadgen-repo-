# Admin Panel — setup (owner manual steps)

The admin panel lets you edit the site (Business Info / NAP / certs / experience,
and Reviews) from a friendly web form — no code. It lives at:

```
https://northvaleroofing.com/keystatic
```

Editing there commits the change to GitHub, which triggers a Vercel preview/deploy.
Two one-time setups are required, and **both are yours — Claude never sets secrets,
DNS, or billing.** Until they're done, the panel is locked (fail-closed by design).

## Layer 1 — Google sign-in (who can OPEN the panel): built in

The sign-in is built into the site — **no Cloudflare, no DNS changes.** When
anyone visits `/keystatic` they're sent to a "Sign in with Google" screen; only
verified `@northvaleroofing.com` accounts (or emails you allow) get in. After
sign-in we set a signed, http-only session cookie that lasts 12 hours; the site
re-checks it on every admin request, so a forged cookie is rejected.

You provision a Google OAuth client once:

1. Go to **Google Cloud Console → APIs & Services → Credentials** (sign in with
   your Workspace admin account).
2. **Configure the OAuth consent screen**: User type **Internal** (so it's limited
   to your Workspace org), app name "Northvale Roofing Admin". Save.
3. **Create credentials → OAuth client ID → Web application.**
   - **Authorized redirect URIs**, add your production URL:
     `https://northvaleroofing.com/api/auth/callback`
     (and, if you want sign-in to work on Vercel preview links too, add the
     preview origin's `/api/auth/callback` — optional).
   - Click Create. Google shows a **Client ID** and **Client secret**.
4. In **Vercel → Settings → Environment Variables**, add:
   - `GOOGLE_OAUTH_CLIENT_ID` — the Client ID from step 3
   - `GOOGLE_OAUTH_CLIENT_SECRET` — the Client secret from step 3
   - `ADMIN_SESSION_SECRET` — a long random string. Generate one with
     `openssl rand -base64 48` (or any 40+ random characters). This signs the
     session cookie; keep it secret, never commit it.
5. Redeploy. Visiting `/keystatic` now prompts "Sign in with Google."

To sign out, visit `/api/auth/logout`. To revoke someone, remove them from the
Workspace org (or from `ADMIN_ALLOWED_EMAILS`) — access is re-checked on the next
request, so it takes effect immediately even if their cookie is still valid.

> Security note: the only accepted identity is the signed session cookie minted
> after a real Google sign-in. The site does **not** trust any upstream identity
> header, so no proxy is required and there's nothing spoofable to leak. Layer 2
> below is a second, independent lock on _writing_.

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
- `ADMIN_ALLOWED_EMAILS` — comma-separated specific emails (e.g. a contractor).
  Handy to grant a non-Workspace account access without adding a Workspace seat.

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
