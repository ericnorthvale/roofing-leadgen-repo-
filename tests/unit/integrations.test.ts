import { describe, it, expect } from "vitest";
import { fetchGoogleReviews } from "~/lib/google-reviews";
import { fetchCompanyCamPhotos } from "~/lib/companycam";

describe("fetchGoogleReviews (env-gated)", () => {
  it("returns [] with no keys (no network call)", async () => {
    expect(await fetchGoogleReviews({})).toEqual([]);
  });
  it("returns [] when only one of the two keys is set", async () => {
    expect(await fetchGoogleReviews({ GOOGLE_PLACES_API_KEY: "x" })).toEqual([]);
    expect(await fetchGoogleReviews({ GOOGLE_PLACE_ID: "x" })).toEqual([]);
  });
});

describe("fetchCompanyCamPhotos (env-gated)", () => {
  it("returns [] with no API key (no network call)", async () => {
    expect(await fetchCompanyCamPhotos({})).toEqual([]);
  });
});
