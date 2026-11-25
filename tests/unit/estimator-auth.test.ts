import { describe, it, expect } from "vitest";
import {
  ESTIMATOR_MAX_AGE_SECONDS,
  MIN_PIN_LENGTH,
  checkPin,
  createEstimatorToken,
  isEstimatorEnabled,
  isEstimatorPath,
  timingSafeEqual,
  verifyEstimatorToken,
} from "~/lib/estimator-auth";
import { createSessionToken } from "~/lib/admin-session";

/**
 * The crew estimator is guarded by a single shared code rather than a Google
 * account, because the people using it are in driveways on their own phones.
 * That is a weaker door than the admin panel's by design, so these tests pin
 * the properties that make it as strong as a shared code can be.
 *
 * What a failure here would cost: the estimator puts Northvale's name and
 * branding on a document and (phase 2) sends it to a customer. The realistic
 * harm is not someone reading prices — it is someone issuing a fraudulent
 * estimate in the company's name.
 */

const SECRET = "test-signing-secret-at-least-long-enough";
const ENV = { ESTIMATOR_PIN: "999999", ADMIN_SESSION_SECRET: SECRET };

describe("estimator is off unless deliberately configured", () => {
  it("is disabled with no code set, so the route can 404 instead of opening", () => {
    expect(isEstimatorEnabled({ ADMIN_SESSION_SECRET: SECRET })).toBe(false);
  });

  it("is disabled with no signing secret — an unsigned session is worse than none", () => {
    expect(isEstimatorEnabled({ ESTIMATOR_PIN: "999999" })).toBe(false);
  });

  it("refuses a code shorter than the minimum, including an empty string", () => {
    expect(isEstimatorEnabled({ ESTIMATOR_PIN: "", ADMIN_SESSION_SECRET: SECRET })).toBe(false);
    expect(isEstimatorEnabled({ ESTIMATOR_PIN: "12", ADMIN_SESSION_SECRET: SECRET })).toBe(false);
    expect(isEstimatorEnabled({ ESTIMATOR_PIN: "   ", ADMIN_SESSION_SECRET: SECRET })).toBe(false);
  });

  it("accepts a code at the minimum length", () => {
    const pin = "0".repeat(MIN_PIN_LENGTH);
    expect(isEstimatorEnabled({ ESTIMATOR_PIN: pin, ADMIN_SESSION_SECRET: SECRET })).toBe(true);
  });
});

describe("checkPin", () => {
  it("accepts the configured code", () => {
    expect(checkPin("999999", ENV)).toBe(true);
  });

  it("rejects a wrong code, a prefix, and a suffix", () => {
    expect(checkPin("999998", ENV)).toBe(false);
    expect(checkPin("99999", ENV)).toBe(false);
    expect(checkPin("9999999", ENV)).toBe(false);
  });

  it("tolerates whitespace a phone keyboard adds", () => {
    expect(checkPin(" 999999 ", ENV)).toBe(true);
  });

  it("never passes when the estimator is unconfigured, even with a blank guess", () => {
    expect(checkPin("", {})).toBe(false);
    expect(checkPin("999999", {})).toBe(false);
  });
});

describe("timingSafeEqual", () => {
  it("compares equal and unequal strings correctly", () => {
    expect(timingSafeEqual("999999", "999999")).toBe(true);
    expect(timingSafeEqual("999999", "999998")).toBe(false);
  });

  /**
   * Length is allowed to short-circuit (it leaks only the length), but content
   * must not: an early return on the first differing digit would let an
   * attacker recover a six-digit code one digit at a time.
   */
  it("examines every character of equal-length strings", () => {
    expect(timingSafeEqual("abcdef", "zbcdef")).toBe(false);
    expect(timingSafeEqual("abcdef", "abcdez")).toBe(false);
  });
});

describe("session tokens", () => {
  const NOW = 1_700_000_000;

  it("round-trips a freshly minted token", async () => {
    const token = await createEstimatorToken(SECRET, NOW);
    const payload = await verifyEstimatorToken(token, SECRET, NOW + 60);
    expect(payload?.scope).toBe("estimator");
  });

  it("rejects a token after it expires", async () => {
    const token = await createEstimatorToken(SECRET, NOW);
    const justBefore = NOW + ESTIMATOR_MAX_AGE_SECONDS - 1;
    const justAfter = NOW + ESTIMATOR_MAX_AGE_SECONDS + 1;
    expect(await verifyEstimatorToken(token, SECRET, justBefore)).not.toBeNull();
    expect(await verifyEstimatorToken(token, SECRET, justAfter)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createEstimatorToken(SECRET, NOW);
    expect(await verifyEstimatorToken(token, "some-other-secret", NOW + 60)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createEstimatorToken(SECRET, NOW);
    const [payload, sig] = token.split(".");
    const forged = btoa(JSON.stringify({ scope: "estimator", exp: NOW + 10 ** 9 }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(payload).not.toBe(forged);
    expect(await verifyEstimatorToken(`${forged}.${sig}`, SECRET, NOW + 60)).toBeNull();
  });

  it("rejects junk, empty and missing tokens", async () => {
    expect(await verifyEstimatorToken(undefined, SECRET, NOW)).toBeNull();
    expect(await verifyEstimatorToken("", SECRET, NOW)).toBeNull();
    expect(await verifyEstimatorToken("no-dot-here", SECRET, NOW)).toBeNull();
    expect(await verifyEstimatorToken(".onlyasig", SECRET, NOW)).toBeNull();
  });

  /**
   * THE CROSS-DOOR TEST. Estimator sessions are signed with the SAME key as
   * admin sessions, so the signature alone cannot tell them apart. Only the
   * scope marker stops a crew code holder presenting their cookie at the admin
   * panel, or an admin cookie unlocking the estimator. If this ever fails, the
   * two doors have become one.
   */
  it("will not accept an admin session token as an estimator session", async () => {
    const adminToken = await createSessionToken("greg@northvaleroofing.com", SECRET, NOW);
    expect(await verifyEstimatorToken(adminToken, SECRET, NOW + 60)).toBeNull();
  });
});

describe("isEstimatorPath", () => {
  it("covers the page and anything under it", () => {
    expect(isEstimatorPath("/estimator")).toBe(true);
    expect(isEstimatorPath("/estimator/")).toBe(true);
    expect(isEstimatorPath("/estimator/new")).toBe(true);
  });

  it("does not catch public pages that merely start with the same letters", () => {
    expect(isEstimatorPath("/estimators-guide")).toBe(false);
    expect(isEstimatorPath("/")).toBe(false);
    expect(isEstimatorPath("/services/roof-replacement")).toBe(false);
  });
});
