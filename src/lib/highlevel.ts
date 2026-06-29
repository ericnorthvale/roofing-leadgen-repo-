/**
 * HighLevel (GoHighLevel) contact + opportunity push.
 *
 * Scaffold built to spec against the HighLevel v2 API. Once the Private
 * Integration token is issued, verify the exact endpoint/field shapes against
 * the live account (see docs/setup-highlevel.md) — the field keys below must
 * match the custom fields created in the HighLevel location.
 *
 * Best-effort by design: every call is env-gated and wrapped so a failure (or
 * missing keys) never blocks the lead submission. Missing keys = clean skip.
 */

const HL_BASE = "https://services.leadconnectorhq.com";
const HL_VERSION = "2021-07-28";

export interface LeadPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  source: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface HighLevelEnv {
  HIGHLEVEL_API_KEY?: string;
  HIGHLEVEL_LOCATION_ID?: string;
  /** Optional — when both are set, a pipeline opportunity is created per lead. */
  HIGHLEVEL_PIPELINE_ID?: string;
  HIGHLEVEL_PIPELINE_STAGE_ID?: string;
}

export interface HighLevelResult {
  ok: boolean;
  contactId?: string;
  opportunityId?: string;
  error?: string;
}

const has = (v?: string) => !!v && v.trim().length > 0;

function hlHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Version: HL_VERSION,
  };
}

/**
 * Upsert a contact (de-dupes by phone/email within the location, so a returning
 * visitor updates their record instead of spawning a duplicate). Returns the
 * contact id on success.
 */
export async function upsertContact(
  lead: LeadPayload,
  env: HighLevelEnv,
): Promise<HighLevelResult> {
  if (!has(env.HIGHLEVEL_API_KEY) || !has(env.HIGHLEVEL_LOCATION_ID)) {
    return { ok: false, error: "HighLevel not configured" };
  }
  try {
    const res = await fetch(`${HL_BASE}/contacts/upsert`, {
      method: "POST",
      headers: hlHeaders(env.HIGHLEVEL_API_KEY!),
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        address1: lead.address,
        city: lead.city,
        postalCode: lead.zip,
        locationId: env.HIGHLEVEL_LOCATION_ID,
        source: lead.source,
        tags: lead.tags ?? [],
        customFields: Object.entries(lead.customFields ?? {}).map(([key, value]) => ({
          key,
          field_value: value,
        })),
      }),
    });
    if (!res.ok) return { ok: false, error: `HighLevel contacts ${res.status}` };
    const data = (await res.json()) as { contact?: { id?: string } };
    return { ok: true, contactId: data.contact?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown" };
  }
}

/**
 * Create a pipeline opportunity for a contact. Gated on the pipeline env vars —
 * if they're absent we skip (graceful degradation: the contact still exists, it
 * just doesn't enter the sales pipeline). Returns the opportunity id on success.
 */
export async function createOpportunity(
  contactId: string,
  lead: LeadPayload,
  env: HighLevelEnv,
): Promise<HighLevelResult> {
  if (!has(env.HIGHLEVEL_API_KEY) || !has(env.HIGHLEVEL_LOCATION_ID)) {
    return { ok: false, error: "HighLevel not configured" };
  }
  if (!has(env.HIGHLEVEL_PIPELINE_ID) || !has(env.HIGHLEVEL_PIPELINE_STAGE_ID)) {
    // No pipeline configured — intentional clean skip, not an error for the lead.
    return { ok: true };
  }
  try {
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || lead.phone;
    const res = await fetch(`${HL_BASE}/opportunities/`, {
      method: "POST",
      headers: hlHeaders(env.HIGHLEVEL_API_KEY!),
      body: JSON.stringify({
        locationId: env.HIGHLEVEL_LOCATION_ID,
        pipelineId: env.HIGHLEVEL_PIPELINE_ID,
        pipelineStageId: env.HIGHLEVEL_PIPELINE_STAGE_ID,
        contactId,
        name,
        status: "open",
        monetaryValue: 0,
        source: lead.source,
      }),
    });
    if (!res.ok) return { ok: false, error: `HighLevel opportunities ${res.status}` };
    const data = (await res.json()) as { opportunity?: { id?: string } };
    return { ok: true, opportunityId: data.opportunity?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown" };
  }
}

/**
 * Push a lead into HighLevel: upsert the contact, then (if a pipeline is
 * configured) create an opportunity for it. Best-effort — a failed opportunity
 * does not fail the contact, and the caller tolerates a fully failed push.
 */
export async function pushLeadToHighLevel(
  lead: LeadPayload,
  env: HighLevelEnv,
): Promise<HighLevelResult> {
  const contact = await upsertContact(lead, env);
  if (!contact.ok || !contact.contactId) return contact;

  const opp = await createOpportunity(contact.contactId, lead, env);
  return {
    ok: true,
    contactId: contact.contactId,
    opportunityId: opp.opportunityId,
    // Surface an opportunity failure for logging without failing the contact.
    error: opp.ok ? undefined : opp.error,
  };
}
