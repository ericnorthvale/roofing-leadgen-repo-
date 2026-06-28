import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, clientKey, _resetRateLimit } from "~/lib/rate-limit";

beforeEach(() => _resetRateLimit());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const opts = { limit: 3, windowMs: 1000, now: 1000 };
    expect(rateLimit("ip1", opts).allowed).toBe(true);
    expect(rateLimit("ip1", opts).allowed).toBe(true);
    expect(rateLimit("ip1", opts).allowed).toBe(true);
    expect(rateLimit("ip1", opts).allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    expect(rateLimit("ip2", { limit: 1, windowMs: 1000, now: 1000 }).allowed).toBe(true);
    expect(rateLimit("ip2", { limit: 1, windowMs: 1000, now: 1500 }).allowed).toBe(false);
    expect(rateLimit("ip2", { limit: 1, windowMs: 1000, now: 2001 }).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const opts = { limit: 1, windowMs: 1000, now: 1000 };
    expect(rateLimit("a", opts).allowed).toBe(true);
    expect(rateLimit("b", opts).allowed).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for IP", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKey(h)).toBe("1.2.3.4");
  });

  it("falls back to unknown", () => {
    expect(clientKey(new Headers())).toBe("unknown");
  });
});
