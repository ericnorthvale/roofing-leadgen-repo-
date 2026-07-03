/**
 * Lead-persistence fallback — the never-lose-a-lead safety net.
 *
 * Writes every valid lead (form submission or tracked call) to a PRIVATE
 * Vercel Blob store as one JSON file per lead. This is the durable record that
 * survives an unconfigured or failing CRM/SMS/email stack: even with zero other
 * integration keys, a lead is recoverable from the store instead of being only
 * a console line in ephemeral function logs.
 *
 * Best-effort by design, exactly like src/lib/notify.ts: env-gated (missing
 * token = clean skip), never throws, and a storage failure never blocks the
 * lead's redirect/response. Uses the official @vercel/blob SDK — the one
 * documented exception to the native-fetch integration rule, because the
 * private-store REST surface is not a stable public API and a silently broken
 * safety net would defeat its purpose.
 *
 * Setup (owner): Vercel dashboard → Storage → create a **private** Blob store →
 * connect it to the project. Vercel injects BLOB_READ_WRITE_TOKEN automatically.
 * Recovery: download `leads/<YYYY-MM>/...json` files from the store UI or CLI.
 */

import { put } from "@vercel/blob";

export interface LeadRecord {
  /** Which pipeline produced the lead. */
  channel: "form" | "phone";
  /** ISO timestamp the server received it. */
  receivedAt: string;
  /** Full normalized lead payload (fields, lead_source, utm, consent, geo…). */
  lead: Record<string, unknown>;
}

export interface LeadStoreEnv {
  BLOB_READ_WRITE_TOKEN?: string;
}

export type LeadStoreStatus = "saved" | "skipped" | "error";

export interface LeadStoreResult {
  status: LeadStoreStatus;
  /** Blob pathname when saved — logged so a lead is findable from the logs. */
  pathname?: string;
  error?: string;
}

const has = (v?: string) => !!v && v.trim().length > 0;

/** `leads/<YYYY-MM>/<channel>-<receivedAt>-<uuid>.json` — browseable by month. */
export function leadPathname(record: LeadRecord, uuid: string): string {
  const month = record.receivedAt.slice(0, 7);
  const stamp = record.receivedAt.replace(/[:.]/g, "-");
  return `leads/${month}/${record.channel}-${stamp}-${uuid}.json`;
}

/**
 * Persist a lead record to the private Blob store. Never throws. Returns
 * "skipped" when the store token is not configured.
 */
export async function persistLead(record: LeadRecord, env: LeadStoreEnv): Promise<LeadStoreResult> {
  if (!has(env.BLOB_READ_WRITE_TOKEN)) {
    return { status: "skipped" };
  }
  try {
    const pathname = leadPathname(record, crypto.randomUUID());
    await put(pathname, JSON.stringify(record, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return { status: "saved", pathname };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Unknown" };
  }
}
