import { describe, it, expect } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_MAX_AGE_SECONDS,
} from "~/lib/admin-session";

const SECRET = "test-secret-do-not-use-in-prod";
const NOW = 1_700_000_000;

describe("admin session token", () => {
  it("round-trips a valid token and returns the email", async () => {
    const token = await createSessionToken("Greg@Northvaleroofing.com", SECRET, NOW);
    const payload = await verifySessionToken(token, SECRET, NOW);
    expect(payload?.email).toBe("greg@northvaleroofing.com");
    expect(payload?.exp).toBe(NOW + SESSION_MAX_AGE_SECONDS);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("greg@northvaleroofing.com", SECRET, NOW);
    expect(await verifySessionToken(token, "other-secret", NOW)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken("greg@northvaleroofing.com", SECRET, NOW);
    const [, sig] = token.split(".");
    // Swap in a forged payload (admin@evil.com) keeping the old signature.
    const forgedPayload = Buffer.from(JSON.stringify({ email: "admin@evil.com", exp: NOW + 999 }))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(await verifySessionToken(`${forgedPayload}.${sig}`, SECRET, NOW)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken("greg@northvaleroofing.com", SECRET, NOW);
    const later = NOW + SESSION_MAX_AGE_SECONDS + 1;
    expect(await verifySessionToken(token, SECRET, later)).toBeNull();
  });

  it("rejects empty / malformed input and an empty secret", async () => {
    expect(await verifySessionToken("", SECRET, NOW)).toBeNull();
    expect(await verifySessionToken("garbage", SECRET, NOW)).toBeNull();
    expect(await verifySessionToken("a.b.c", SECRET, NOW)).toBeNull();
    const token = await createSessionToken("greg@northvaleroofing.com", SECRET, NOW);
    expect(await verifySessionToken(token, "", NOW)).toBeNull();
  });
});
