# Switching on the crew estimator

**Time: about 10 minutes, plus a few minutes waiting for a rebuild.**
**You will need: a credit card, and the login for the Vercel account that hosts the site.**

The estimator lives at `northvaleroofing.com/estimator`, behind the crew code.

What this turns on is the estimator itself. The rep types the customer's details, taps the
microphone on their phone keyboard, and talks through the job; the estimate builds as they
speak, and they keep talking to change it. Until you do this, it answers "The assistant
isn't switched on yet" and no estimate can be built.

---

## What it costs

You are paying Anthropic for the reading, per estimate. At the rates published for the
model this uses, a single estimate costs well under a cent — it is a short piece of text in
and a short piece of text out. A hundred estimates a month will not reach a dollar.

The part worth watching is not the per-estimate cost but the card you put on file, so set a
spend limit in step 5. If you'd rather see real numbers before committing, do steps 1–6,
use it for a week, then look at the usage page.

---

## Part 1 — Get the key (about 5 minutes)

A "key" here is just a long password that proves the website is allowed to use the service.

1. Go to **https://platform.claude.com** and sign in, or create an account if you don't
   have one. Use a company email address you'll still have in two years.
2. If you're asked to create or name an organization, call it **Northvale Roofing**.
3. Find **Billing** in the settings menu and add a payment method. This is separate from
   any Claude subscription you may already pay for — a chat subscription does not cover
   this, so you do need to add a card here even if you're already paying for Claude.
4. Add a small starting credit if it asks for one. The minimum is fine.
5. While you're in Billing, look for a **spend limit** or **usage limit** setting and set
   it to something you'd be relaxed about — **$20 a month** is far more than this will
   use, and it means a mistake can never become a big bill.
6. Go to **https://platform.claude.com/settings/keys** and click **Create Key**.
   - Name it **northvale-estimator** so you know later what it was for.
   - Click create.
7. **Copy the key now.** It is shown once and never again. It starts with `sk-ant-`.
   Paste it somewhere safe for the next five minutes — a password manager if you use one.
   If you lose it, no harm done: delete that key and make another.

> Do not paste this key into an email, a text message, or a chat with me. It belongs only
> in the box in Part 2. Anyone who has it can spend money on your account.

---

## Part 2 — Put the key in Vercel (about 5 minutes)

Vercel is the company that runs the website. This is where the site keeps its passwords.

1. Go to **https://vercel.com** and sign in.
2. Click the **northvale-roofing** project.
3. Click **Settings** along the top, then **Environment Variables** in the left menu.
4. Click **Add Environment Variable** (on some screens the button just says **Add**).
5. In **Key**, type exactly: `ANTHROPIC_API_KEY`
   - All capitals, with underscores. No spaces.
6. In **Value**, paste the key you copied in Part 1.
7. For the environments, tick **Production** _and_ **Preview**. (Preview is the test
   version of the site I send you links to. Ticking both means it works in both places.)
8. If there's a choice between **Secret** and **Config**, choose **Secret**. That means
   nobody can read the value back out afterwards, including you — which is what you want.
9. Click **Save**.
10. **Redeploy, or it won't take effect.** A new setting only reaches the live site on the
    next deployment. Go to the **Deployments** tab, find the one at the top, click the
    **⋯** menu on its right, and choose **Redeploy**. Wait for it to go green — usually
    one to two minutes.

---

## Part 3 — Check it worked (1 minute)

1. On your phone, go to **northvaleroofing.com/estimator** and put in the code.
2. In **The job** box, tap the microphone on your keyboard and say:

   > "Tear off and replace, thirty squares, four fifty a square. Two pipe boots at ninety
   > each."

3. Tap **Build the estimate**.

Under **The estimate** you should see two lines — 30 square × $450.00 and 2 each × $90.00 —
and a total of **$13,680.00** at the bottom of the screen.

Then say _"add gutter guards for twelve fifty"_ and tap **Add this**. The gutter guards
should appear and the total should go up, without you touching anything else. That is the
part worth checking: it changes the estimate rather than starting a new one.

If it says _"The assistant isn't switched on yet"_, the key didn't reach the site — the
redeploy in step 10 is the usual culprit. If it says _"Couldn't take that in"_, the key
arrived but the service rejected it; check in Billing that the payment method went
through.

---

## What it will and won't do

**It only uses numbers you actually said.** Name a job without a price and the line says
**needs a price** until you say one. It does not know Northvale's prices and is not allowed
to guess — a made-up price on a document with your name on it is the one thing this must
never do. Anything it couldn't trace back to your words is marked **CHECK THIS**.

**You change it by talking, not by typing.** "Make the tear-off four seventy-five." "Take
the gutters off." "Add two more pipe boots." Each time, it rebuilds the whole estimate from
everything you've said, so taking something off is as easy as putting it on. There's also
an **Undo** on the last thing you said, if it mishears you.

**You are still the one quoting.** The total is on screen the whole time and nothing sends
itself. Read it before it goes out, the same as if you'd written it by hand.

**It won't touch customer details.** Name, address, phone and email are typed, always. A
wrong price is obvious in the total; a wrong house number is not.

---

## Turning it off

Delete the `ANTHROPIC_API_KEY` variable in Vercel and redeploy, or delete the key at
`https://platform.claude.com/settings/keys`, which stops it immediately everywhere.

Be aware this switches the estimator **off**, not back to a manual mode — there is no
longer a by-hand version to fall back on. Reps would be back to whatever they used before
the estimator existed until you put a key back.

---

_Written 2026-11-25 against the setup steps published at the time:
[Claude Console — get started](https://platform.claude.com/docs/en/get-started) and
[API keys](https://platform.claude.com/settings/keys) for Part 1;
[Vercel — managing environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
for Part 2. Both companies move their menus about, so if a button isn't where this says,
the thing you're looking for is "add a variable to this project" and "create an API key" —
the names may have changed but the task hasn't._
