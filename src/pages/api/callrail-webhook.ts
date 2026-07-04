import type { APIRoute } from "astro";
import {
  verifyCallRailSignature,
  isActionableCall,
  phoneLeadName,
  type CallRailCallEvent,
} from "~/lib/callrail";
import { pushLeadToHighLevel } from "~/lib/highlevel";
import { notifyNewLead } from "~/lib/notify";
import { sendMetaLeadEvent } from "~/lib/meta-capi";
import { canonicalLeadSource } from "~/lib/lead-source";
import { rateLimit, clientKey } from "~/lib/rate-limit";
import { persistLead } from "~/lib/lead-store";
import { maskPhone } from "~/lib/phone";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Best-effort rate limit, same policy as /api/lead — caps abuse before any
  // signature work. Real CallRail traffic is far below the limit.
  if (!rateLimit(clientKey(request.headers)).allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  const raw = await request.text();
  const signature = request.headers.get("signature");
  const secret = import.meta.env.CALLRAIL_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const ok = await verifyCallRailSignature(raw, signature, secret);
  if (!ok) return new Response("Invalid signature", { status: 401 });

  let event: CallRailCallEvent;
  try {
    event = JSON.parse(raw) as CallRailCallEvent;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Masked diagnostic log (PR #16): the customer number is the caller's PII, so
  // it is masked to last-4 before it reaches Vercel logs; tracking_phone is our
  // CallRail pool number (not personal data), logged as-is for routing.
  console.log("[callrail-webhook]", {
    id: event.id,
    direction: event.direction,
    duration: event.duration,
    tracking_phone: event.tracking_phone_number,
    customer_phone: maskPhone(event.customer_phone_number),
    source: event.source_name,
    utm_source: event.utm_source,
  });

  // De-dupe: ignore pre-call/outbound noise; act once per completed inbound call.
  if (!isActionableCall(event)) {
    return new Response("ignored", { status: 200 });
  }

  // Same canonical lead source the form uses, so phone + form leads report alike.
  const leadSource = canonicalLeadSource({
    utmSource: event.utm_source,
    gclid: event.gclid,
    fbclid: event.fbclid,
    formSource: "phone-call",
  });

  const tags = [
    `lead_source:${leadSource}`,
    "channel:phone",
    "source:callrail",
    `service:inspection`,
    event.utm_source ? `utm_source:${event.utm_source}` : "utm_source:direct",
    event.utm_campaign ? `utm_campaign:${event.utm_campaign}` : "",
  ].filter(Boolean);

  // Durable safety net FIRST (best-effort, env-gated): persist the call lead to
  // the private Blob store before any other integration runs. See lead-store.ts.
  const stored = await persistLead(
    {
      channel: "phone",
      receivedAt: new Date().toISOString(),
      lead: {
        callrail_call_id: event.id,
        phone: event.customer_phone_number,
        tracking_number: event.tracking_phone_number ?? "",
        duration: event.duration ?? null,
        recording: event.recording ?? "",
        callrail_source: event.source_name ?? "",
        lead_source: leadSource,
        utm_source: event.utm_source ?? "",
        utm_medium: event.utm_medium ?? "",
        utm_campaign: event.utm_campaign ?? "",
        gclid: event.gclid ?? "",
        fbclid: event.fbclid ?? "",
      },
    },
    { BLOB_READ_WRITE_TOKEN: import.meta.env.BLOB_READ_WRITE_TOKEN },
  );
  if (stored.status === "error") {
    console.error("[callrail-webhook] blob persistence failed:", stored.error);
  }

  // Push the call as a contact (+ opportunity when a pipeline is configured).
  // Best-effort — a webhook must still 200 so CallRail doesn't retry forever.
  const hl = await pushLeadToHighLevel(
    {
      firstName: phoneLeadName(event.customer_phone_number),
      phone: event.customer_phone_number,
      source: "callrail",
      tags,
      customFields: {
        lead_source: leadSource,
        channel: "phone",
        callrail_call_id: event.id,
        tracking_number: event.tracking_phone_number ?? "",
        call_duration: event.duration != null ? String(event.duration) : "",
        call_recording: event.recording ?? "",
        callrail_source: event.source_name ?? "",
        utm_source: event.utm_source ?? "",
        utm_medium: event.utm_medium ?? "",
        utm_campaign: event.utm_campaign ?? "",
        gclid: event.gclid ?? "",
        fbclid: event.fbclid ?? "",
      },
    },
    {
      HIGHLEVEL_API_KEY: import.meta.env.HIGHLEVEL_API_KEY,
      HIGHLEVEL_LOCATION_ID: import.meta.env.HIGHLEVEL_LOCATION_ID,
      HIGHLEVEL_PIPELINE_ID: import.meta.env.HIGHLEVEL_PIPELINE_ID,
      HIGHLEVEL_PIPELINE_STAGE_ID: import.meta.env.HIGHLEVEL_PIPELINE_STAGE_ID,
    },
  );
  if (!hl.ok) {
    console.error("[callrail-webhook] HighLevel push failed:", hl.error);
  }

  // Instant owner alert for tracked calls, same safety net as form leads.
  const notify = await notifyNewLead(
    {
      firstName: phoneLeadName(event.customer_phone_number),
      phone: event.customer_phone_number,
      service: "phone call",
      source: "callrail",
      utmSource: leadSource,
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
    console.error("[callrail-webhook] alert errors:", notify.errors.join("; "));
  }

  // Server-side Meta conversion for phone leads (best-effort; env-gated), so
  // ad optimization sees tracked calls, not just form fills. The CallRail call
  // id is the event id — deterministic, so webhook retries de-dupe at Meta.
  const meta = await sendMetaLeadEvent(
    {
      phone: event.customer_phone_number,
      fbclid: event.fbclid,
      leadSource,
      actionSource: "phone_call",
      eventId: event.id,
    },
    {
      META_PIXEL_ID: import.meta.env.META_PIXEL_ID,
      META_CAPI_TOKEN: import.meta.env.META_CAPI_TOKEN,
    },
  );
  if (meta.status === "error") {
    console.error("[callrail-webhook] Meta CAPI error:", meta.error);
  }

  return new Response("ok", { status: 200 });
};
