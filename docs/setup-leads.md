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

1. Sign up at https://resend.com (free tier covers plenty of lead emails).
2. Easiest start: send from Resend's shared domain — set the "from" to
   `leads@resend.dev`. (Better deliverability later: add `northvaleroofing.com`
   under **Domains** and verify it — that step needs DNS, which is **your** action,
   not Claude's.)
3. **API Keys → Create API Key**, copy it (starts `re_...`).
4. In **Vercel → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = the key
   - `LEAD_ALERT_EMAIL_TO` = your email(s), comma-separated (e.g. `eric@…,greg@…`)
   - `LEAD_ALERT_EMAIL_FROM` = `leads@resend.dev` (or your verified domain sender)
5. Redeploy.

## How it behaves

- Set **both**, **one**, or **neither** — each channel turns on only when its keys
  are present. With no keys, the form still works; alerts are simply skipped.
- Alerts are **best-effort**: if a text/email provider hiccups, the lead still
  submits and still goes to HighLevel (once connected). Nothing blocks a lead.
- Once **HighLevel** is connected, it becomes your system of record + nurture;
  these alerts stay on as your instant heads-up (or you can switch alerting into
  HighLevel later and remove these keys).

## Test it

Submit the form on the live site (or preview) with your own info. You should get
a text and/or an email within a few seconds. If not, double-check the env values
and that you redeployed.
