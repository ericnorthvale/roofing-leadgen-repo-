import type { APIRoute } from "astro";
import { pushLeadToHighLevel } from "~/lib/highlevel";
import { notifyNewLead } from "~/lib/notify";
import { sendMetaLeadEvent } from "~/lib/meta-capi";
import { rateLimit, clientKey } from "~/lib/rate-limit";
import { canonicalLeadSource } from "~/lib/lead-source";
import { deserializeUtm } from "~/lib/utm";
import { validateLead, isValidEventId } from "~/lib/lead-validation";
import { CONSENT_TEXT_VERSION } from "~/lib/legal";
import { persistLead } from "~/lib/lead-store";

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
  /** Browser-generated id shared with the client pixel for CAPI dedup. */
  eventId?: string;
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

  const validation = validateLead(body);
  if (!validation.ok) {
    return new Response(`Invalid fields — ${validation.errors.join(", ")}`, { status: 422 });
  }

  const lead = validation.lead;
  const clientIp = h.get("x-forwarded-for")?.split(",")[0]?.trim();

  const utm = { ...deserializeUtm(body.utm), ...(locals.utm ?? {}) };

  // Canonical Lead Source — one normalized attribution field carried across every
  // system (HighLevel → JobNimbus → QuickBooks). See src/lib/lead-source.ts.
  const leadSource = canonicalLeadSource({
    utmSource: utm.source,
    gclid: utm.gclid,
    fbclid: utm.fbclid,
    formSource: body.source,
  });

  const tags = [
    `lead_source:${leadSource}`,
    `source:${body.source ?? "unknown"}`,
    `service:${body.service ?? "inspection"}`,
    utm.source ? `utm_source:${utm.source}` : "utm_source:direct",
    utm.campaign ? `utm_campaign:${utm.campaign}` : "",
  ].filter(Boolean);

  const receivedAt = new Date().toISOString();

  // Durable safety net FIRST (best-effort, env-gated): persist the lead to the
  // private Blob store before any other integration runs, so it can never be
  // lost to an unconfigured or failing CRM/SMS/email stack. See lead-store.ts.
  const stored = await persistLead(
    {
      channel: "form",
      receivedAt,
      lead: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        city: lead.city,
        zip: lead.zip,
        service: lead.service,
        notes: lead.notes,
        source: lead.source ?? "website",
        lead_source: leadSource,
        utm,
        consent: {
          given: true,
          timestamp: receivedAt,
          ip: clientIp ?? "",
          textVersion: CONSENT_TEXT_VERSION,
        },
        geo: locals.geo ?? {},
      },
    },
    { BLOB_READ_WRITE_TOKEN: import.meta.env.BLOB_READ_WRITE_TOKEN },
  );
  if (stored.status === "error") {
    console.error("[lead] blob persistence failed:", stored.error);
  }

  const hl = await pushLeadToHighLevel(
    {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
      zip: lead.zip,
      source: lead.source ?? "website",
      tags,
      customFields: {
        service: lead.service ?? "inspection",
        notes: lead.notes ?? "",
        lead_source: leadSource,
        utm_source: utm.source ?? "",
        utm_medium: utm.medium ?? "",
        utm_campaign: utm.campaign ?? "",
        utm_content: utm.content ?? "",
        utm_term: utm.term ?? "",
        gclid: utm.gclid ?? "",
        fbclid: utm.fbclid ?? "",
        landing_path: utm.landingPath ?? "",
        first_touch_at: utm.firstTouchAt ?? "",
        // TCPA "prior express written consent" evidence — what was agreed to,
        // when, and from where. The disclaimer text itself is versioned in
        // src/lib/legal.ts (CONSENT_TEXT_VERSION).
        consent_given: "true",
        consent_timestamp: receivedAt,
        consent_ip: clientIp ?? "",
        consent_text_version: CONSENT_TEXT_VERSION,
        // Vercel request geo — coarse anti-fraud / service-area signal.
        ip_city: locals.geo?.city ?? "",
        ip_region: locals.geo?.region ?? "",
      },
    },
    {
      HIGHLEVEL_API_KEY: import.meta.env.HIGHLEVEL_API_KEY,
      HIGHLEVEL_LOCATION_ID: import.meta.env.HIGHLEVEL_LOCATION_ID,
      HIGHLEVEL_PIPELINE_ID: import.meta.env.HIGHLEVEL_PIPELINE_ID,
      HIGHLEVEL_PIPELINE_STAGE_ID: import.meta.env.HIGHLEVEL_PIPELINE_STAGE_ID,
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
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      zip: lead.zip,
      service: lead.service,
      notes: lead.notes,
      source: lead.source ?? "website",
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

  // Server-side Meta conversion (best-effort; env-gated). Gives Meta ad
  // optimization a Lead signal even when the browser pixel is blocked. The
  // browser generates the event id (hidden field) and fires the pixel Lead
  // with the same id on /thank-you, so Meta de-dupes the two.
  const meta = await sendMetaLeadEvent(
    {
      email: lead.email,
      phone: lead.phone,
      firstName: lead.firstName,
      lastName: lead.lastName,
      city: lead.city,
      zip: lead.zip,
      fbclid: utm.fbclid,
      clientIp,
      userAgent: h.get("user-agent") ?? undefined,
      eventSourceUrl: utm.landingPath ?? h.get("referer") ?? undefined,
      leadSource,
      eventId: lead.eventId && isValidEventId(lead.eventId) ? lead.eventId : undefined,
    },
    {
      META_PIXEL_ID: import.meta.env.META_PIXEL_ID,
      META_CAPI_TOKEN: import.meta.env.META_CAPI_TOKEN,
    },
  );
  if (meta.status === "error") {
    console.error("[lead] Meta CAPI error:", meta.error);
  }

  return redirect("/thank-you", 303);
};
