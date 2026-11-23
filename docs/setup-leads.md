# Lead alerts — setup (owner manual steps)

Every time someone submits the website form, the site can **text and email you
instantly** — so you see and can call every lead within seconds, even before
HighLevel (your CRM) is connected. This is your day-one safety net.

The code is already built. You just create two accounts and paste the keys into
Vercel. **Claude never touches secrets, billing, or DNS** — these are your steps.

## 1. Text alerts (Twilio) — ~$1/mo number + ~1¢/text

1. Sign up at https://www.twilio.com and verify your email/phone.
2. Buy a phone number: **Phone Numbers → Buy a number** (a local 281/832/713
   number with SMS enabled). ~$1.15/month.
3. From the Twilio **Console dashboard**, copy your **Account SID** and **Auth Token**.
4. In **Vercel → your project → Settings → Environment Variables**, add:
   - `TWILIO_ACCOUNT_SID` = the Account SID (starts `AC...`)
   - `TWILIO_AUTH_TOKEN` = the Auth Token
   - `TWILIO_FROM` = the Twilio number you bought, in `+1...` format (e.g. `+12815551234`)
   - `LEAD_ALERT_SMS_TO` = your cell number(s) in `+1...` format. For both owners,
     separate with a comma: `+12815550111,+18325550222`
5. Redeploy (Vercel does this automatically when you save env vars).

## 2. Email alerts (Resend) — free to start

**You only need to set ONE value in Vercel.** The recipient and sender both
have built-in defaults in `src/lib/notify.ts` (`greg@northvaleroofing.com` and
Resend's sandbox sender `onboarding@resend.dev`), because neither is a secret.
The API key is the only thing that genuinely cannot live in the repository.

> ⚠️ **Sign up to Resend with `greg@northvaleroofing.com`.** Resend's sandbox
> sender only delivers to the address the account is registered under. Register
> with a different address and the alerts will be rejected rather than
> delivered — and the rejection is quiet. This limit disappears once a domain
> is verified (below).

1. Sign up at https://resend.com with `greg@northvaleroofing.com` (the free
   tier covers plenty of lead emails).
2. **API Keys → Create API Key**, copy it (starts `re_...`).
3. In **Vercel → Settings → Environment Variables**, add just:
   - `RESEND_API_KEY` = the key
4. Redeploy. Emails now go to `greg@northvaleroofing.com`.

### Then get off the sandbox

The sandbox is a stepping stone, not the finished setup. It can only reach one
address, and `onboarding@resend.dev` is a shared sender, so mail is more likely
to land in spam. Once alerts are working:

1. In Resend, **Domains → Add Domain** → `northvaleroofing.com`.
2. Add the DNS records it gives you at your domain registrar — **the owner's
   action, not Claude's.**
3. Once verified, set `LEAD_ALERT_EMAIL_FROM` in Vercel to a sender on that
   domain, e.g. `leads@northvaleroofing.com`, and redeploy.

That lifts the one-recipient limit (so `LEAD_ALERT_EMAIL_TO` can hold several
addresses) and improves deliverability.

Optional, only if you want to change the defaults:

- `LEAD_ALERT_EMAIL_TO` = a different address, or several comma-separated
  (e.g. `greg@…,eric@…`). **An env value always wins over the default**, so if
  this is already set somewhere, that is where mail is going — check it before
  assuming the default applies.
- `LEAD_ALERT_EMAIL_FROM` = your own verified sender. Better deliverability,
  but it needs `northvaleroofing.com` added under **Domains** in Resend and
  verified with DNS records — **your** action, not Claude's.

### Where is it actually sending?

Every lead now logs its routing, so you never have to guess. In
**Vercel → your project → Logs**, each submission prints one of:

```
[lead] delivered to: storage, email | email → greg@northvaleroofing.com (built-in default)
[lead] ⚠ CRITICAL: this lead reached NO destination … email → NOT SENDING (no RESEND_API_KEY set)
```

The second line also prints the full lead, so even a completely unconfigured
site leaves a recoverable record rather than losing the customer silently.

## 3. Google Sheet of every lead — free, ~10 minutes once

A running list you can sort and filter, instead of digging through an inbox.
Free: no Zapier, no third-party service, and no Google credential in this
codebase. The sheet owns a small script that accepts a POST and appends a row;
the site holds only that script's URL.

The sheet already exists: **Northvale Roofing — Website Leads**.

1. Open the sheet → **Extensions → Apps Script**.
2. Delete whatever is in the editor and paste the whole of
   `docs/leads-sheet-apps-script.gs` from this repository.
3. Click the **save** icon.
4. Click **Deploy → New deployment**.
5. Click the gear next to "Select type" and choose **Web app**.
6. Set **Execute as:** `Me`, and **Who has access:** `Anyone`.
   "Anyone" means anyone holding the URL, and the URL is long and random.
   It is the only thing standing between the internet and a new row, which is
   why it is stored as a secret and never logged.
7. Click **Deploy**. Google asks you to authorise it the first time — it is
   your own script writing to your own sheet, so allow it. If it warns the app
   is unverified, choose **Advanced → Go to (project name)**.
8. Copy the **Web app URL** (ends in `/exec`).
9. In **Vercel → Settings → Environment Variables**, add
   `LEADS_SHEET_WEBHOOK_URL` = that URL, ticked for all three environments.
10. **Redeploy**, then submit a test lead. A row appears within a second or two.

The header row writes itself on the first lead, so the sheet starts empty.

**If you change the script later**, use **Deploy → Manage deployments → edit →
New version**, which keeps the same URL. A brand-new deployment issues a NEW
URL and rows stop appearing until you update the variable in Vercel.

> The sheet is a view, not the safety net. If Google is down or the script is
> redeployed, rows are skipped and nothing else about the lead is affected.
> For a guaranteed durable record, turn on Blob storage below as well.

## 4. Never-lose-a-lead storage (Vercel Blob) — free tier, 2 minutes

Every valid lead (form **and** tracked phone call) can also be written to a
private file store as a permanent record — so even if SMS, email, and HighLevel
are all unconfigured or down, the lead is still saved and recoverable.

1. In **Vercel → your project → Storage → Create Database → Blob**, create a
   store and choose **Private** access (lead records contain customer PII —
   private means no public URLs, ever).
2. **Connect** the store to this project. Vercel adds the
   `BLOB_READ_WRITE_TOKEN` env var automatically — there is no key to copy.
3. Redeploy. Done.

Recovery: each lead is one JSON file at `leads/<year-month>/…json` in the
store — browse or download them from **Vercel → Storage → your Blob store**.

## How it behaves

- Set **all**, **some**, or **none** — each channel (SMS, email, Blob storage)
  turns on only when its keys are present. With no keys, the form still works;
  the extras are simply skipped.
- Alerts are **best-effort**: if a text/email provider hiccups, the lead still
  submits and still goes to HighLevel (once connected). Nothing blocks a lead.
- Once **HighLevel** is connected, it becomes your system of record + nurture;
  these alerts stay on as your instant heads-up (or you can switch alerting into
  HighLevel later and remove these keys).

## Test it

Submit the form on the live site (or preview) with your own info. You should get
a text and/or an email within a few seconds. If not, double-check the env values
and that you redeployed.
