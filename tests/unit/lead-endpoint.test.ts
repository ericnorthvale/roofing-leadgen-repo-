import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { POST } from "~/pages/api/lead";
import { _resetRateLimit } from "~/lib/rate-limit";

/**
 * Integration test for the lead endpoint (the money path). No network: with no
 * env keys, HighLevel + notify no-op, so we exercise validation, honeypot, the
 * rate limiter, and the success redirect in isolation.
 */

function ctx(body: Record<string, string>, headers: Record<string, string> = {}) {
  const request = new Request("https://northvaleroofing.com/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const redirect = (url: string, status = 302) =>
    new Response(null, { status, headers: { location: url } });
  return { request, redirect, locals: {} } as unknown as Parameters<typeof POST>[0];
}

const validLead = {
  firstName: "Jane",
  phone: "+12815550123",
  address: "1 Main St",
  city: "Spring",
  zip: "77379",
  consent: "yes",
};

beforeEach(() => _resetRateLimit());
afterEach(() => vi.unstubAllGlobals());

describe("POST /api/lead", () => {
  it("redirects to /thank-you (303) on a valid submission", async () => {
    const res = await POST(ctx(validLead, { "x-forwarded-for": "1.1.1.1" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/thank-you");
  });

  it("makes no outbound calls when no integration keys are set (all gated no-ops)", async () => {
    // HighLevel, notify (Twilio/Resend), and Meta CAPI must all cleanly skip
    // with no env keys — so a valid lead never touches the network.
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(ctx(validLead, { "x-forwarded-for": "9.9.9.9" }));
    expect(res.status).toBe(303);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a submission missing required fields (422)", async () => {
    const res = await POST(ctx({ firstName: "Jane" }, { "x-forwarded-for": "2.2.2.2" }));
    expect(res.status).toBe(422);
  });

  it("rejects a malformed phone (422) — server never trusts the browser", async () => {
    const res = await POST(
      ctx({ ...validLead, phone: "not-a-phone" }, { "x-forwarded-for": "2.2.2.3" }),
    );
    expect(res.status).toBe(422);
  });

  it("rejects a malformed zip and email (422)", async () => {
    const badZip = await POST(ctx({ ...validLead, zip: "773" }, { "x-forwarded-for": "2.2.2.4" }));
    expect(badZip.status).toBe(422);
    const badEmail = await POST(
      ctx({ ...validLead, email: "nope" }, { "x-forwarded-for": "2.2.2.5" }),
    );
    expect(badEmail.status).toBe(422);
  });

  it("rejects oversized notes (422) — length caps before anything goes downstream", async () => {
    const res = await POST(
      ctx({ ...validLead, notes: "x".repeat(2001) }, { "x-forwarded-for": "2.2.2.6" }),
    );
    expect(res.status).toBe(422);
  });

  it("sends TCPA consent evidence + the browser event id to HighLevel when configured", async () => {
    vi.stubEnv("HIGHLEVEL_API_KEY", "test-key");
    vi.stubEnv("HIGHLEVEL_LOCATION_ID", "loc-1");
    const fetchSpy = vi.fn(
      async () => new Response(JSON.stringify({ contact: { id: "c-1" } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(
      ctx(
        { ...validLead, eventId: "123e4567-e89b-42d3-a456-426614174000" },
        { "x-forwarded-for": "5.5.5.5" },
      ),
    );
    expect(res.status).toBe(303);
    expect(fetchSpy).toHaveBeenCalledOnce();

    const body = JSON.parse(
      (fetchSpy.mock.calls[0] as unknown as [string, RequestInit])[1]!.body as string,
    );
    const fields = Object.fromEntries(
      (body.customFields as { key: string; field_value: string }[]).map((f) => [
        f.key,
        f.field_value,
      ]),
    );
    expect(fields.consent_given).toBe("true");
    expect(fields.consent_ip).toBe("5.5.5.5");
    expect(fields.consent_text_version).toMatch(/^\d{4}-\d{2}-\d{2}\.v\d+$/);
    expect(Date.parse(fields.consent_timestamp)).not.toBeNaN();

    vi.unstubAllEnvs();
  });

  it("silently accepts (303) when the honeypot is filled — no tell to the bot", async () => {
    const res = await POST(
      ctx({ ...validLead, website: "spam" }, { "x-forwarded-for": "3.3.3.3" }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/thank-you");
  });

  it("rate-limits a flood from one IP (429)", async () => {
    const ip = { "x-forwarded-for": "4.4.4.4" };
    let last: Response | undefined;
    for (let i = 0; i < 12; i++) last = await POST(ctx(validLead, ip));
    expect(last!.status).toBe(429);
  });
});
