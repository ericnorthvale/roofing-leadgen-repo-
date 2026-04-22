import type { APIRoute } from "astro";
import { verifyCallRailSignature } from "~/lib/callrail";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  const signature = request.headers.get("signature");
  const secret = import.meta.env.CALLRAIL_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const ok = await verifyCallRailSignature(raw, signature, secret);
  if (!ok) return new Response("Invalid signature", { status: 401 });

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Scaffold: persist, de-dupe, push to HighLevel as a contact + call log.
  // Left as a console log for now so CI passes; wire to HighLevel in the
  // follow-up task (see TASKS_FOR_ERIC.md: CallRail webhook wiring).
  console.log("[callrail-webhook]", {
    id: event.id,
    direction: event.direction,
    duration: event.duration,
    tracking_phone: event.tracking_phone_number,
    customer_phone: event.customer_phone_number,
    source: event.source_name,
    utm_source: event.utm_source,
  });

  return new Response("ok", { status: 200 });
};
