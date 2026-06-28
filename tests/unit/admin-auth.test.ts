import { describe, it, expect } from "vitest";
import { evaluateEmailAccess, isAdminPath } from "~/lib/admin-auth";

describe("evaluateEmailAccess", () => {
  it("blocks an empty identity (fail-closed)", () => {
    const r = evaluateEmailAccess("", {});
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("no-identity");
  });

  it("allows the default Northvale domain", () => {
    const r = evaluateEmailAccess("greg@northvaleroofing.com", {});
    expect(r.allowed).toBe(true);
    expect(r.reason).toBe("domain-allowlist");
    expect(r.email).toBe("greg@northvaleroofing.com");
  });

  it("normalizes case", () => {
    const r = evaluateEmailAccess("Greg@NorthvaleRoofing.com", {});
    expect(r.allowed).toBe(true);
    expect(r.email).toBe("greg@northvaleroofing.com");
  });

  it("blocks a non-allowed domain", () => {
    const r = evaluateEmailAccess("someone@gmail.com", {});
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("not-allowlisted");
  });

  it("honors an explicit email allowlist (e.g. a contractor)", () => {
    const r = evaluateEmailAccess("dev@agency.com", { ADMIN_ALLOWED_EMAILS: "dev@agency.com" });
    expect(r.allowed).toBe(true);
    expect(r.reason).toBe("email-allowlist");
  });

  it("honors a custom domain allowlist", () => {
    const r = evaluateEmailAccess("a@example.com", { ADMIN_ALLOWED_DOMAINS: "example.com" });
    expect(r.allowed).toBe(true);
  });
});

describe("isAdminPath", () => {
  it("matches keystatic UI + API, not public pages", () => {
    expect(isAdminPath("/keystatic")).toBe(true);
    expect(isAdminPath("/keystatic/collection/reviews")).toBe(true);
    expect(isAdminPath("/api/keystatic/github/oauth")).toBe(true);
    expect(isAdminPath("/")).toBe(false);
    expect(isAdminPath("/spring")).toBe(false);
  });
});
