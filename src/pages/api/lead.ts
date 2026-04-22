import type { APIRoute } from "astro";
import { pushLeadToHighLevel } from "~/lib/highlevel";
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

  return redirect("/thank-you", 303);
};
