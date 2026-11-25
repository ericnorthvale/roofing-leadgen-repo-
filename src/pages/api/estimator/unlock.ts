import type { APIRoute } from "astro";
import { rateLimit, clientKey } from "~/lib/rate-limit";
import {
  ESTIMATOR_COOKIE,
  ESTIMATOR_MAX_AGE_SECONDS,
  MAX_PIN_ATTEMPTS,
  PIN_LOCKOUT_SECONDS,
  checkPin,
  createEstimatorToken,
  isEstimatorEnabled,
} from "~/lib/estimator-auth";

export const prerender = false;

/**
 * Exchange the shared code for a signed estimator session.
 *
 * FAIL CLOSED IN EVERY DIRECTION. No ESTIMATOR_PIN configured → 404, the same
 * answer an unknown route gives, so probing cannot distinguish "disabled" from
 * "does not exist". Wrong code → 401 with no detail. Too many wrong codes from
 * one address → 429 for fifteen minutes.
 *
 * WHY THE LOCKOUT MATTERS MORE HERE THAN ELSEWHERE. A six-digit numeric code
 * has a million combinations, which a script can exhaust in minutes if it is
 * allowed to ask freely. Five attempts per quarter-hour turns that into years.
 * The lockout is doing most of the security work on this door — not the code's
 * length.
 *
 * The response never says whether the code was close, how long the real code
 * is, or how many attempts remain.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const env = {
    ESTIMATOR_PIN: import.meta.env.ESTIMATOR_PIN,
    ADMIN_SESSION_SECRET: import.meta.env.ADMIN_SESSION_SECRET,
  };

  if (!isEstimatorEnabled(env)) {
    return new Response("Not found", { status: 404 });
  }

  const key = `estimator-pin:${clientKey(request.headers)}`;
  const limited = rateLimit(key, {
    limit: MAX_PIN_ATTEMPTS,
    windowMs: PIN_LOCKOUT_SECONDS * 1000,
  });
  if (!limited.allowed) {
    return json({ ok: false, error: "locked" }, 429);
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = typeof body?.pin === "string" ? body.pin : "";
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (!checkPin(submitted, env)) {
    return json({ ok: false, error: "wrong" }, 401);
  }

  const token = await createEstimatorToken(
    env.ADMIN_SESSION_SECRET!,
    Math.floor(Date.now() / 1000),
  );
  cookies.set(ESTIMATOR_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ESTIMATOR_MAX_AGE_SECONDS,
  });

  return json({ ok: true });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
