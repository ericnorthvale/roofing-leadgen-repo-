/**
 * Thin wrappers around GA4 / Meta pixel / Google Ads conversion pings.
 *
 * Called from the thank-you page and the lead API success branch. Keep the
 * client-side helpers zero-JS-friendly — each call is a small inline snippet
 * rendered from a component, not a framework event.
 */

export interface ConversionEvent {
  eventName: "lead_submitted" | "call_started" | "sms_sent" | "form_view";
  value?: number;
  currency?: string;
  transactionId?: string;
}

/**
 * Render the dataLayer push that GTM listens for. Returns a string of JS
 * meant to be inlined in a <script> tag on the thank-you page.
 */
export function renderDataLayerPush(evt: ConversionEvent): string {
  const payload = {
    event: evt.eventName,
    value: evt.value ?? null,
    currency: evt.currency ?? null,
    transaction_id: evt.transactionId ?? null,
  };
  return `window.dataLayer=window.dataLayer||[];window.dataLayer.push(${JSON.stringify(payload)});`;
}

/**
 * Hashed user data payload for Meta CAPI / Google Enhanced Conversions.
 * Server-side pixels only — never hash on the client.
 */
export async function hashPii(value: string): Promise<string> {
  const buf = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
