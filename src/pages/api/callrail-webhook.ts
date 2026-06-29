import type { APIRoute } from "astro";
import {
  verifyCallRailSignature,
  isActionableCall,
  phoneLeadName,
  type CallRailCallEvent,
} from "~/lib/callrail";
import { pushLeadToHighLevel } from "~/lib/highlevel";
import { notifyNewLead } from "~/lib/notify";
import { canonicalLeadSource } from "~/lib/lead-source";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

  return new Response("ok", { status: 200 });
};
