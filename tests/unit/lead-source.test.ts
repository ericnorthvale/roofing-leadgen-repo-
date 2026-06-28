import { describe, it, expect } from "vitest";
import { canonicalLeadSource } from "~/lib/lead-source";

describe("canonicalLeadSource", () => {
  it("prefers utm_source, normalized to lowercase", () => {
    expect(canonicalLeadSource({ utmSource: "Google" })).toBe("google");
    expect(canonicalLeadSource({ utmSource: "facebook", gclid: "x" })).toBe("facebook");
  });

  it("infers google-ads from gclid when no utm_source", () => {
    expect(canonicalLeadSource({ gclid: "abc123" })).toBe("google-ads");
  });

  it("infers facebook from fbclid when no utm_source", () => {
    expect(canonicalLeadSource({ fbclid: "abc123" })).toBe("facebook");
  });

  it("defaults to website (never empty) so every lead is attributable", () => {
    expect(canonicalLeadSource({})).toBe("website");
    expect(canonicalLeadSource({ formSource: "area:spring" })).toBe("website");
  });
});
