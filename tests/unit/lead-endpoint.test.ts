import { describe, it, expect, beforeEach } from "vitest";
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

describe("POST /api/lead", () => {
  it("redirects to /thank-you (303) on a valid submission", async () => {
    const res = await POST(ctx(validLead, { "x-forwarded-for": "1.1.1.1" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/thank-you");
  });

  it("rejects a submission missing required fields (422)", async () => {
    const res = await POST(ctx({ firstName: "Jane" }, { "x-forwarded-for": "2.2.2.2" }));
    expect(res.status).toBe(422);
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
