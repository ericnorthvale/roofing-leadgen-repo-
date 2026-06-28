/**
 * Instant lead alerts + safety net.
 *
 * Sends an SMS (Twilio) and/or email (Resend) to the owners the moment a lead
 * comes in — independent of HighLevel. This guarantees you SEE every lead even
 * before the CRM is connected, and gives you speed-to-lead on day one.
 *
 * Best-effort by design: every channel is env-gated and wrapped so a failure
 * (or missing keys) never blocks the lead submission. Missing keys = clean skip.
 */

export interface LeadAlert {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  service?: string;
  notes?: string;
  /** Where the form was (page/source tag). */
  source: string;
  /** Marketing source if known (utm_source / "direct"). */
  utmSource?: string;
}

export interface NotifyEnv {
  // SMS (Twilio)
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM?: string;
  LEAD_ALERT_SMS_TO?: string; // comma-separated list of owner numbers (E.164)
  // Email (Resend)
  RESEND_API_KEY?: string;
  LEAD_ALERT_EMAIL_TO?: string; // comma-separated list of owner emails
  LEAD_ALERT_EMAIL_FROM?: string; // verified sender, e.g. "leads@northvaleroofing.com"
}

export type ChannelStatus = "sent" | "skipped" | "error";

export interface NotifyResult {
  sms: ChannelStatus;
  email: ChannelStatus;
  errors: string[];
}

const has = (v?: string) => !!v && v.trim().length > 0;
const fullName = (l: LeadAlert) => [l.firstName, l.lastName].filter(Boolean).join(" ").trim();
const splitList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Short, scannable SMS body. */
export function buildSmsBody(lead: LeadAlert): string {
  const where = [lead.city, lead.zip].filter(Boolean).join(" ");
  const src = lead.utmSource ? `${lead.source}/${lead.utmSource}` : lead.source;
  return [
    `New roofing lead: ${fullName(lead)}`,
    `${lead.phone}`,
    lead.service ? `Service: ${lead.service}` : "",
    where ? `Area: ${where}` : "",
    `Source: ${src}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Fuller email body (HTML). */
export function buildEmailHtml(lead: LeadAlert): string {
  const row = (label: string, value?: string) =>
    has(value) ? `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value!)}</td></tr>` : "";
  return `<h2>New lead — Northvale Roofing</h2>
<table cellpadding="6">
${row("Name", fullName(lead))}
${row("Phone", lead.phone)}
${row("Email", lead.email)}
${row("Address", [lead.address, lead.city, lead.zip].filter(Boolean).join(", "))}
${row("Service", lead.service)}
${row("Notes", lead.notes)}
${row("Form source", lead.source)}
${row("Marketing source", lead.utmSource ?? "direct")}
</table>
<p>Call them fast — speed-to-lead wins jobs.</p>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendSms(lead: LeadAlert, env: NotifyEnv, errors: string[]): Promise<ChannelStatus> {
  if (
    !has(env.TWILIO_ACCOUNT_SID) ||
    !has(env.TWILIO_AUTH_TOKEN) ||
    !has(env.TWILIO_FROM) ||
    !has(env.LEAD_ALERT_SMS_TO)
  ) {
    return "skipped";
  }
  const body = buildSmsBody(lead);
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  let anyError = false;
  for (const to of splitList(env.LEAD_ALERT_SMS_TO!)) {
    try {
      const form = new URLSearchParams({ From: env.TWILIO_FROM!, To: to, Body: body });
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      if (!res.ok) {
        anyError = true;
        errors.push(`sms ${to}: ${res.status}`);
      }
    } catch (err) {
      anyError = true;
      errors.push(`sms ${to}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }
  return anyError ? "error" : "sent";
}

async function sendEmail(
  lead: LeadAlert,
  env: NotifyEnv,
  errors: string[],
): Promise<ChannelStatus> {
  if (
    !has(env.RESEND_API_KEY) ||
    !has(env.LEAD_ALERT_EMAIL_TO) ||
    !has(env.LEAD_ALERT_EMAIL_FROM)
  ) {
    return "skipped";
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.LEAD_ALERT_EMAIL_FROM,
        to: splitList(env.LEAD_ALERT_EMAIL_TO!),
        subject: `New lead: ${fullName(lead)} — ${lead.service ?? "roofing"}`,
        html: buildEmailHtml(lead),
        reply_to: lead.email,
      }),
    });
    if (!res.ok) {
      errors.push(`email: ${res.status}`);
      return "error";
    }
    return "sent";
  } catch (err) {
    errors.push(`email: ${err instanceof Error ? err.message : "unknown"}`);
    return "error";
  }
}

/**
 * Fire SMS + email alerts. Never throws. Returns per-channel status so the
 * caller can log it. Channels with missing keys are "skipped".
 */
export async function notifyNewLead(lead: LeadAlert, env: NotifyEnv): Promise<NotifyResult> {
  const errors: string[] = [];
  const [sms, email] = await Promise.all([
    sendSms(lead, env, errors).catch((e) => {
      errors.push(`sms: ${e instanceof Error ? e.message : "unknown"}`);
      return "error" as ChannelStatus;
    }),
    sendEmail(lead, env, errors).catch((e) => {
      errors.push(`email: ${e instanceof Error ? e.message : "unknown"}`);
      return "error" as ChannelStatus;
    }),
  ]);
  return { sms, email, errors };
}
