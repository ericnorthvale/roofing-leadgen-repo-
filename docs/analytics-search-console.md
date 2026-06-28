# Analytics & Google Search Console — setup (owner manual steps)

Claude wired the _code_. The steps below are account setup only — they require
logging into Google/Vercel and **no DNS or secret changes are made by Claude**.

## Google Analytics 4 (GA4) — already wired

The GA4 snippet is in `src/layouts/BaseLayout.astro` and fires automatically
once the measurement ID is present.

1. Create a GA4 property at https://analytics.google.com → Admin → Create
   property → add a **Web** data stream for `northvaleroofing.com`.
2. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).
3. In **Vercel → Project → Settings → Environment Variables**, set
   `PUBLIC_GA4_ID` to that value (Production + Preview). Redeploy.
4. (Optional) For server-side Google Tag Manager, set `PUBLIC_GTM_ID`
   (`GTM-XXXXXXX`) the same way. GTM is wired but only loads when the ID is set.

## Google Search Console (GSC) — verify with NO DNS change

The site supports the **HTML-tag** verification method, so you do not need to
touch DNS.

1. Go to https://search.google.com/search-console → Add property →
   **URL prefix** → enter `https://northvaleroofing.com`.
2. Choose the **HTML tag** verification method. Google shows a meta tag like
   `<meta name="google-site-verification" content="ABC123..." />`.
3. Copy only the **content value** (`ABC123...`).
4. In **Vercel → Project → Settings → Environment Variables**, set
   `PUBLIC_GSC_VERIFICATION` to that value. Redeploy.
5. Back in GSC, click **Verify**. (BaseLayout renders the meta tag on every
   page once the env var is set.)

> Alternative: the DNS-TXT method also works but requires editing DNS records,
> which is an owner action — Claude will not change DNS.

## Submit the sitemap

After verifying, in GSC → **Sitemaps**, submit:

```
https://northvaleroofing.com/sitemap-index.xml
```

The sitemap is generated automatically and **excludes any page that fails the
quality gate** (draft/`noindex` city pages), so only real, indexable pages are
submitted. As Phase 2/3 pages go live, they appear in the sitemap automatically.

## What's connected vs. pending

- ✅ GA4 + GTM snippets (need IDs in Vercel env)
- ✅ GSC HTML-tag verification support (need token in Vercel env)
- ⏳ Real `PUBLIC_GA4_ID`, `PUBLIC_GTM_ID`, `PUBLIC_GSC_VERIFICATION` values — owner
