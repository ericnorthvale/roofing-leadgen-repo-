/**
 * CompanyCam photo pull — env-gated, best-effort.
 *
 * When COMPANYCAM_API_KEY is set, fetches real, geotagged job photos to display
 * on the site (gallery / city-page proof). With no key it returns [] (no network
 * call). Never throws. Real photos only — original local imagery is a top local-
 * SEO + trust signal.
 *
 * Note: this is a build-time pull (refreshes on rebuild/ISR). A scheduled sync →
 * preview PR is the Phase-2/n8n upgrade.
 */

export interface CompanyCamPhoto {
  id: string;
  url: string;
  /** Descriptive, truthful alt. CompanyCam photos lack per-photo descriptions,
   *  so we use an honest generic alt rather than keyword-stuffing. */
  alt: string;
  capturedAt?: string;
}

export interface CompanyCamEnv {
  COMPANYCAM_API_KEY?: string;
}

interface RawCompanyCamPhoto {
  id?: string | number;
  captured_at?: number | string;
  uris?: { type?: string; uri?: string }[];
}

function pickUri(photo: RawCompanyCamPhoto): string | undefined {
  const uris = photo.uris ?? [];
  // Prefer a web-optimized rendition, fall back to the first available.
  const web = uris.find((u) => u.type === "web" || u.type === "original");
  return (web ?? uris[0])?.uri;
}

export async function fetchCompanyCamPhotos(
  env: CompanyCamEnv,
  opts: { limit?: number } = {},
): Promise<CompanyCamPhoto[]> {
  const key = env.COMPANYCAM_API_KEY?.trim();
  if (!key) return [];
  const limit = opts.limit ?? 12;

  try {
    const res = await fetch(`https://api.companycam.com/v2/photos?per_page=${limit}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RawCompanyCamPhoto[];
    if (!Array.isArray(data)) return [];
    return data
      .map((p): CompanyCamPhoto | null => {
        const url = pickUri(p);
        if (!url || p.id == null) return null;
        return {
          id: String(p.id),
          url,
          alt: "Roofing work by Northvale Roofing",
          capturedAt: p.captured_at ? String(p.captured_at) : undefined,
        };
      })
      .filter((p): p is CompanyCamPhoto => p !== null);
  } catch {
    return [];
  }
}
