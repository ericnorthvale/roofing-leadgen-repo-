import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "~/pages/api/callrail-webhook";

/**
 * Webhook tests: signature gate, the unconfigured 503, the pre-call de-dupe
 * skip, and a real Post-Call event reaching HighLevel (mocked fetch).
 */

const SECRET = "test-secret";

/** Same HMAC-SHA1 hex the lib verifies against, so we can sign test bodies. */
async function sign(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function ctx(rawBody: string, signature?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signature) headers.signature = signature;
  const request = new Request("https://northvaleroofing.com/api/callrail-webhook", {
    method: "POST",
    headers,
    body: rawBody,
  });
  return { request } as unknown as Parameters<typeof POST>[0];
}

const postCall = JSON.stringify({
  id: "CAL123",
  direction: "inbound",
  answered: true,
  duration: 95,
  customer_phone_number: "+12815550123",
  tracking_phone_number: "+17134497661",
  source_name: "Google Organic",
  utm_source: "google",
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/callrail-webhook", () => {
  it("returns 503 when the webhook secret is not configured", async () => {
    const res = await POST(ctx(postCall, "whatever"));
    expect(res.status).toBe(503);
  });

  it("returns 401 on an invalid signature", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    const res = await POST(ctx(postCall, "deadbeef"));
    expect(res.status).toBe(401);
  });

  it("ignores a pre-call event (no duration) without pushing", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const preCall = JSON.stringify({
      id: "CAL124",
      direction: "inbound",
      customer_phone_number: "+12815550123",
      tracking_phone_number: "+17134497661",
    });
    const res = await POST(ctx(preCall, await sign(preCall, SECRET)));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("pushes a completed inbound call to HighLevel", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("HIGHLEVEL_API_KEY", "tok");
    vi.stubEnv("HIGHLEVEL_LOCATION_ID", "loc");
    const fetchSpy = vi.fn(
      async (_url: string) =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ contact: { id: "c1" } }),
        }) as unknown as Response,
    );
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(ctx(postCall, await sign(postCall, SECRET)));
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0]).toContain("/contacts/upsert");
  });
});
