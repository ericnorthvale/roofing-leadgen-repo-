import type { APIRoute } from "astro";
import { pushLeadToHighLevel } from "~/lib/highlevel";
import { notifyNewLead } from "~/lib/notify";
import { rateLimit, clientKey } from "~/lib/rate-limit";
import { deserializeUtm } from "~/lib/utm";

export const prerender = false;

interface FormShape {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  service?: string;
  notes?: string;
  source?: string;
  consent?: string;
  website?: string;
  utm?: string;
}

function readForm(form: FormData): FormShape {
  const out: FormShape = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") (out as Record<string, string>)[k] = v;
  }
  return out;
}

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  // Vercel geo — only meaningful at request time, so captured here rather than
  // in middleware (where prerender emits a build-time warning).
  const h = request.headers;

  // Best-effort rate limit (lightweight; honeypot is the primary spam defense).
  if (!rateLimit(clientKey(h)).allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  const geo = {
    city: h.get("x-vercel-ip-city") ?? undefined,
    region: h.get("x-vercel-ip-country-region") ?? undefined,
    country: h.get("x-vercel-ip-country") ?? undefined,
    zip: h.get("x-vercel-ip-postal-code") ?? undefined,
  };
  if (geo.city || geo.region || geo.country || geo.zip) {
    locals.geo = { ...geo, city: geo.city ? decodeURIComponent(geo.city) : undefined };
  }

  let body: FormShape;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as FormShape;
    } else {
      body = readForm(await request.formData());
    }
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Honeypot: filled = bot. Silent 200 (don't tell the bot we caught it).
  if (body.website && body.website.length > 0) {
    return redirect("/thank-you", 303);
  }

  if (!body.firstName || !body.phone || !body.address || !body.city || !body.zip || !body.consent) {
    return new Response("Missing required fields", { status: 422 });
  }

  const utm = { ...deserializeUtm(body.utm), ...(locals.utm ?? {}) };

  const tags = [
    `source:${body.source ?? "unknown"}`,
    `service:${body.service ?? "inspection"}`,
    utm.source ? `utm_source:${utm.source}` : "utm_source:direct",
    utm.campaign ? `utm_campaign:${utm.campaign}` : "",
  ].filter(Boolean);

  const hl = await pushLeadToHighLevel(
    {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      zip: body.zip,
      source: body.source ?? "website",
      tags,
      customFields: {
        service: body.service ?? "inspection",
        notes: body.notes ?? "",
        utm_source: utm.source ?? "",
        utm_medium: utm.medium ?? "",
        utm_campaign: utm.campaign ?? "",
        utm_content: utm.content ?? "",
        utm_term: utm.term ?? "",
        gclid: utm.gclid ?? "",
        fbclid: utm.fbclid ?? "",
        landing_path: utm.landingPath ?? "",
        first_touch_at: utm.firstTouchAt ?? "",
      },
    },
    {
      HIGHLEVEL_API_KEY: import.meta.env.HIGHLEVEL_API_KEY,
      HIGHLEVEL_LOCATION_ID: import.meta.env.HIGHLEVEL_LOCATION_ID,
    },
  );

  // If HighLevel fails, we still redirect — the lead is in GA4/GTM via the thank-you
  // page, and an alerting Vercel log is enough. Losing a lead to a 500 is the worst outcome.
  if (!hl.ok) {
    console.error("[lead] HighLevel push failed:", hl.error);
  }

  // Instant owner alert + safety net (SMS/email). Best-effort; never blocks the
  // redirect. Works even when HighLevel isn't configured, so no lead is ever lost.
  const notify = await notifyNewLead(
    {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      zip: body.zip,
      service: body.service,
      notes: body.notes,
      source: body.source ?? "website",
      utmSource: utm.source ?? "direct",
    },
    {
      TWILIO_ACCOUNT_SID: import.meta.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: import.meta.env.TWILIO_AUTH_TOKEN,
      TWILIO_FROM: import.meta.env.TWILIO_FROM,
      LEAD_ALERT_SMS_TO: import.meta.env.LEAD_ALERT_SMS_TO,
      RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
      LEAD_ALERT_EMAIL_TO: import.meta.env.LEAD_ALERT_EMAIL_TO,
      LEAD_ALERT_EMAIL_FROM: import.meta.env.LEAD_ALERT_EMAIL_FROM,
    },
  );
  if (notify.errors.length > 0) {
    console.error("[lead] alert errors:", notify.errors.join("; "));
  }

  return redirect("/thank-you", 303);
};
