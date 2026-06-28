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

This is what lets the panel commit your edits to the repo. **You do not create the
GitHub App by hand** — Keystatic has a **guided wizard** that builds it for you and
generates the secrets. The catch: that wizard only appears when Keystatic is in
"GitHub mode," and we keep dev in local mode by default — so you flip it on with a
flag just for setup.

### Generate the credentials (one time, ~10 min, on a computer with the repo)

> This step needs the repo checked out and `pnpm dev` — it's a developer-ish task.
> If you're not comfortable in a terminal, hand this section to whoever set up the
> repo (or ask Claude to walk you through it live). You'll still be the one clicking
> "Create app" on GitHub, because it must be created under an account with access to
> `ericnorthvale/roofing-leadgen-repo-`.

1. In the project's `.env`, set `PUBLIC_KEYSTATIC_GITHUB_SETUP=true`.
2. Run `pnpm dev` and open <http://localhost:4321/keystatic>.
3. Keystatic shows a **"Create GitHub App"** button. Click it, **name the app**
   (anything, e.g. `northvale-roofing-cms`), and proceed. GitHub walks you through
   creating it and **installing it on the `ericnorthvale/roofing-leadgen-repo-`
   repo** (grant it access to that repo).
4. GitHub redirects back and Keystatic **writes four values into your `.env`**:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
5. Remove (or set to empty) `PUBLIC_KEYSTATIC_GITHUB_SETUP` — it was only for setup.

### Turn it on in production

6. In **Vercel → Settings → Environment Variables**, add the **four** values from
   step 4 (all four — `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is required and is the one
   most setups forget). Do **not** set `PUBLIC_KEYSTATIC_GITHUB_SETUP` in Vercel —
   production is already in GitHub mode.
7. Redeploy. Now signing in at `/keystatic` and hitting **Save** writes a commit to
   the repo (which triggers a Vercel deploy of your change).

> The GitHub App's **callback URL** must match the site it runs on. The wizard sets
> it for localhost during setup; for production, open the app at
> **GitHub → Settings → Developer settings → GitHub Apps → (your app) → Callback URL**
> and add `https://<your-prod-domain>/api/keystatic/github/oauth/callback`.

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
