/**
 * Append every lead to a Google Sheet — the readable running log.
 *
 * WHY A SHEET AT ALL. An inbox is a poor place to track leads: alerts get read
 * and buried, and there is no way to sort, filter, or see this month against
 * last. The sheet is the list you actually work from. It is deliberately NOT
 * the safety net — that is lead-store.ts, which writes a durable private
 * record. If Google is down, or the script is redeployed and its URL changes,
 * nothing here is load-bearing.
 *
 * HOW IT WORKS. The sheet owns a Google Apps Script Web App that accepts a
 * POST and appends a row. We hold only its URL. That keeps the whole thing
 * free, puts no Google credential in this codebase, and means the owner can
 * change the columns without a deploy.
 *
 * SAME BEST-EFFORT CONTRACT AS EVERY OTHER INTEGRATION (see notify.ts):
 * env-gated, never throws, missing config is a clean skip, and a failure here
 * can never block or fail a lead submission. A spreadsheet row is the least
 * important thing that happens to a lead; it must never be the reason one is
 * lost.
 *
 * THE URL IS A SECRET in the sense that matters: anyone holding it can append
 * rows. It lives in the environment, never in the repository, and is never
 * logged — describeSheetRouting() reports only whether one is configured.
 */

export interface SheetLead {
  receivedAt: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  service?: string;
  notes?: string;
  /** Where the form was, e.g. "area:spring". */
  source: string;
  /** Marketing source if known (utm_source / "direct"). */
  utmSource?: string;
  /** The page the visitor landed on, when known. */
  landingPath?: string;
  /** "form" or "phone call" — so one sheet can hold both one day. */
  channel: string;
}

export interface SheetsEnv {
  LEADS_SHEET_WEBHOOK_URL?: string;
}

export type SheetStatus = "sent" | "skipped" | "error";

export interface SheetResult {
  status: SheetStatus;
  error?: string;
}

const has = (v?: string) => !!v && v.trim().length > 0;

/** Whether rows are being written, without ever revealing the URL. */
export function describeSheetRouting(env: SheetsEnv): string {
  return has(env.LEADS_SHEET_WEBHOOK_URL)
    ? "sheet → configured"
    : "sheet → not configured (no LEADS_SHEET_WEBHOOK_URL)";
}

/**
 * Append one lead. Resolves to a status; never rejects.
 *
 * Apps Script answers a POST with a 302 to googleusercontent.com, which fetch
 * follows. A non-ok response is recorded and dropped — there is nothing useful
 * to do about it in the request path, and the lead has already been delivered
 * by other channels.
 *
 * WHY THE BODY IS CHECKED AND NOT JUST THE STATUS (2026-11-23). A 200 from
 * Apps Script does not mean a row was written. If the Web App is deployed with
 * "Who has access" set to anything other than Anyone, Google answers a
 * server-to-server POST by redirecting to a SIGN-IN PAGE — which is HTML, and
 * which returns 200. Trusting res.ok there reports "sent" on every lead while
 * the sheet stays empty forever, and the logs look perfect. That is the worst
 * kind of failure, so success now means the script's own {"ok":true} came
 * back; anything else, HTML included, is an error that says what arrived.
 */
export async function appendLeadToSheet(
  lead: SheetLead,
  env: SheetsEnv,
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<SheetResult> {
  const url = env.LEADS_SHEET_WEBHOOK_URL;
  if (!has(url)) return { status: "skipped" };

  const doFetch = deps.fetchImpl ?? fetch;
  try {
    const res = await doFetch(url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receivedAt: lead.receivedAt,
        channel: lead.channel,
        firstName: lead.firstName,
        lastName: lead.lastName ?? "",
        phone: lead.phone,
        email: lead.email ?? "",
        address: lead.address ?? "",
        city: lead.city ?? "",
        zip: lead.zip ?? "",
        service: lead.service ?? "",
        notes: lead.notes ?? "",
        source: lead.source,
        utmSource: lead.utmSource ?? "",
        landingPath: lead.landingPath ?? "",
      }),
    });
    if (!res.ok) return { status: "error", error: `sheet: HTTP ${res.status}` };

    const text = await res.text();
    let parsed: { ok?: boolean; error?: string } | undefined;
    try {
      parsed = JSON.parse(text) as { ok?: boolean; error?: string };
    } catch {
      // Not JSON. Overwhelmingly this is Google's sign-in page, which means
      // the Web App is not deployed with "Who has access: Anyone".
      const looksLikeLogin = /accounts\.google\.com|sign in|<html/i.test(text);
      return {
        status: "error",
        error: looksLikeLogin
          ? "sheet: got a Google sign-in page, not the script — redeploy the Web App with 'Who has access: Anyone'"
          : `sheet: unexpected non-JSON reply (${text.slice(0, 80)})`,
      };
    }
    if (parsed?.ok !== true) {
      return {
        status: "error",
        error: `sheet: script replied ${parsed?.error ?? JSON.stringify(parsed)}`,
      };
    }
    return { status: "sent" };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "unknown" };
  }
}
