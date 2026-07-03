import { describe, it, expect } from "vitest";
import { validateLead, isValidPhone, isValidEventId, LEAD_LIMITS } from "~/lib/lead-validation";

const valid = {
  firstName: "Jane",
  phone: "(281) 555-0123",
  address: "1 Main St",
  city: "Spring",
  zip: "77379",
  consent: "yes",
};

describe("validateLead", () => {
  it("accepts a valid lead and returns it narrowed", () => {
    const res = validateLead(valid);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.lead.firstName).toBe("Jane");
  });

  it("rejects when required fields are missing", () => {
    const res = validateLead({ firstName: "Jane" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain("phone: required");
      expect(res.errors).toContain("consent: required");
    }
  });

  it("rejects a whitespace-only required field", () => {
    const res = validateLead({ ...valid, firstName: "   " });
    expect(res.ok).toBe(false);
  });

  it.each(["123", "555-0123", "abcdefghij", "12345678901234567890"])(
    "rejects bad phone %s",
    (phone) => {
      expect(validateLead({ ...valid, phone }).ok).toBe(false);
    },
  );

  it.each(["(281) 555-0123", "2815550123", "+1 281 555 0123"])("accepts phone %s", (phone) => {
    expect(validateLead({ ...valid, phone }).ok).toBe(true);
  });

  it.each(["7737", "773790", "abcde", "77379-12"])("rejects bad zip %s", (zip) => {
    expect(validateLead({ ...valid, zip }).ok).toBe(false);
  });

  it("accepts ZIP+4", () => {
    expect(validateLead({ ...valid, zip: "77379-1234" }).ok).toBe(true);
  });

  it("accepts a missing email (optional) but rejects a malformed one", () => {
    expect(validateLead({ ...valid }).ok).toBe(true);
    expect(validateLead({ ...valid, email: "" }).ok).toBe(true);
    expect(validateLead({ ...valid, email: "not-an-email" }).ok).toBe(false);
    expect(validateLead({ ...valid, email: "jane@example.com" }).ok).toBe(true);
  });

  it("caps oversized notes and utm blobs", () => {
    expect(validateLead({ ...valid, notes: "x".repeat(LEAD_LIMITS.notes + 1) }).ok).toBe(false);
    expect(validateLead({ ...valid, utm: "x".repeat(LEAD_LIMITS.utm + 1) }).ok).toBe(false);
    expect(validateLead({ ...valid, notes: "roof leaks at the chimney" }).ok).toBe(true);
  });

  it("caps oversized identity fields", () => {
    expect(validateLead({ ...valid, firstName: "x".repeat(101) }).ok).toBe(false);
    expect(validateLead({ ...valid, address: "x".repeat(201) }).ok).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts 10-digit and 1-prefixed 11-digit numbers", () => {
    expect(isValidPhone("2815550123")).toBe(true);
    expect(isValidPhone("+12815550123")).toBe(true);
  });
  it("rejects 11 digits not starting with 1", () => {
    expect(isValidPhone("22815550123")).toBe(false);
  });
});

describe("isValidEventId", () => {
  it("accepts a UUID", () => {
    expect(isValidEventId("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
  });
  it("rejects short, long, or unsafe values", () => {
    expect(isValidEventId("short")).toBe(false);
    expect(isValidEventId("x".repeat(65))).toBe(false);
    expect(isValidEventId("abc<script>def")).toBe(false);
  });
});
