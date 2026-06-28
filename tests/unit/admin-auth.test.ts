import { describe, it, expect } from "vitest";
import { checkAdminAccess, ssoEmail, isAdminPath } from "~/lib/admin-auth";

const h = (obj: Record<string, string>) => new Headers(obj);

describe("checkAdminAccess", () => {
  it("allows in local dev (Keystatic local mode)", () => {
    expect(checkAdminAccess({ headers: h({}), env: {}, isDev: true }).allowed).toBe(true);
  });

  it("blocks in prod with no verified SSO identity (fail-closed)", () => {
    const r = checkAdminAccess({ headers: h({}), env: {}, isDev: false });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("no-sso-identity");
  });

  it("allows the default Northvale domain via Cloudflare Access header", () => {
    const r = checkAdminAccess({
      headers: h({ "cf-access-authenticated-user-email": "greg@northvaleroofing.com" }),
      env: {},
      isDev: false,
    });
    expect(r.allowed).toBe(true);
    expect(r.email).toBe("greg@northvaleroofing.com");
  });

  it("blocks a non-allowed domain", () => {
    const r = checkAdminAccess({
      headers: h({ "cf-access-authenticated-user-email": "someone@gmail.com" }),
      env: {},
      isDev: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("not-allowlisted");
  });

  it("honors an explicit email allowlist (e.g. a contractor)", () => {
    const r = checkAdminAccess({
      headers: h({ "cf-access-authenticated-user-email": "dev@agency.com" }),
      env: { ADMIN_ALLOWED_EMAILS: "dev@agency.com" },
      isDev: false,
    });
    expect(r.allowed).toBe(true);
  });
});

describe("ssoEmail", () => {
  it("reads Cloudflare Access header", () => {
    expect(ssoEmail(h({ "cf-access-authenticated-user-email": "A@B.com" }))).toBe("a@b.com");
  });
  it("strips the Google IAP prefix", () => {
    expect(ssoEmail(h({ "x-goog-authenticated-user-email": "accounts.google.com:a@b.com" }))).toBe(
      "a@b.com",
    );
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
