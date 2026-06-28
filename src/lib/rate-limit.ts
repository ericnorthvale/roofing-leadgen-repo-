/**
 * Best-effort, in-memory rate limiter for the lead endpoint.
 *
 * Lightweight by design (per the "lightweight security now" decision): it caps
 * obvious abuse per IP within a warm serverless instance. It is NOT a hard,
 * distributed guarantee — that's a hardening-phase upgrade (shared store like
 * Vercel KV / Upstash). The honeypot + required-field checks remain the primary
 * spam defenses.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Current time (injectable for tests). */
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/** Returns whether this key is allowed, and decrements the remaining budget. */
export function rateLimit(key: string, opts: RateLimitOptions = {}): RateLimitResult {
  const limit = opts.limit ?? 8;
  const windowMs = opts.windowMs ?? 60_000;
  const now = opts.now ?? Date.now();

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

/** Derive a client key from request headers (Vercel/Proxy aware). */
export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Test helper — clears all buckets. */
export function _resetRateLimit(): void {
  buckets.clear();
}
