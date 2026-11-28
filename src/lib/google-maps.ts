/**
 * Loading Google Maps once, for whoever asks first.
 *
 * THE KEY IS COMMITTED ON PURPOSE, and this is the single place it lives.
 * It is Northvale's PUBLIC browser key: it ships in the page HTML on every
 * load regardless, and it is locked in the Google console to this site's
 * domains and to the Maps JS / Places / Solar APIs, with quota caps. Setting
 * PUBLIC_GOOGLE_MAPS_BROWSER_KEY in Vercel overrides it. NEVER commit a
 * server/secret key this way — the geocoding key in GOOGLE_GEOCODING_API_KEY
 * is a different animal and belongs in an env var only.
 *
 * It used to sit as a literal inside roof-size-calculator.astro. The crew
 * estimator needs the same key, and a committed credential copied into a
 * second file is one that gets rotated in one place and not the other.
 */
export const MAPS_BROWSER_KEY =
  (import.meta.env.PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? "").trim() ||
  "AIzaSyBjYX0eqE0U1oMRtoQoSaTRxgab-S4zQFI";

declare global {
  interface Window {
    google?: { maps?: { importLibrary?: (n: string) => Promise<unknown> } };
    __nvMapsReady?: () => void;
  }
}

let pending: Promise<typeof window.google> | null = null;

/**
 * Resolve with the Maps namespace, or reject.
 *
 * Memoised: two components asking at once must not inject the script twice —
 * Google's loader complains loudly and the second include can clobber the
 * first. Already-loaded resolves immediately, so a remount costs nothing.
 */
export function loadGoogleMaps(key: string = MAPS_BROWSER_KEY): Promise<typeof window.google> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
  if (pending) return pending;

  pending = new Promise((resolve, reject) => {
    window.__nvMapsReady = () => resolve(window.google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__nvMapsReady`;
    s.async = true;
    s.onerror = () => {
      // Let a later attempt retry rather than caching the failure for the life
      // of the page — a rep in a driveway loses signal and gets it back.
      pending = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(s);
  });
  return pending;
}
