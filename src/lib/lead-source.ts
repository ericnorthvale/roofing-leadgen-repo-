/**
 * Canonical Lead Source — the single attribution field that travels with a lead
 * across every system (website → HighLevel → JobNimbus → QuickBooks).
 *
 * The audit named the dropped/inconsistent source field as the seam where
 * marketing ROI leaks. This function produces ONE normalized value so the same
 * string keys reporting in every tool. Keep the mapping here as the single
 * source of truth; CRM custom fields should map to it 1:1.
 */

export interface LeadSourceInput {
  /** utm_source from the marketing link (google, facebook, lsa, bing, ...). */
  utmSource?: string;
  /** Google Ads click id — presence implies paid Google. */
  gclid?: string;
  /** Meta click id — presence implies paid Meta. */
  fbclid?: string;
  /** The on-site form location tag (e.g. "area:spring", "service:repair"). */
  formSource?: string;
}

/**
 * Returns a normalized, lowercase channel string suitable for cross-system
 * attribution. Never empty — defaults to "website" (direct/organic on-site)
 * so every lead is attributable.
 */
export function canonicalLeadSource(input: LeadSourceInput): string {
  const utm = input.utmSource?.trim().toLowerCase();
  if (utm) return utm;
  if (input.gclid?.trim()) return "google-ads";
  if (input.fbclid?.trim()) return "facebook";
  // No marketing parameters → arrived directly/organically on the site.
  return "website";
}
