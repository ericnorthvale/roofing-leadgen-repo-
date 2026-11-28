import type { APIRoute } from "astro";
import {
  ESTIMATOR_COOKIE,
  ESTIMATOR_MAX_AGE_SECONDS,
  checkPin,
  createEstimatorToken,
  isEstimatorEnabled,
} from "~/lib/estimator-auth";

export const prerender = false;

/**
 * Exchange the shared code for a signed estimator session.
 *
 * WORKS WITH NO JAVASCRIPT, DELIBERATELY. The first version was a fetch() from
 * a client script, and it shipped broken: Astro emitted the script's template
 * literal wrapper verbatim, so the handler never attached and the Unlock button
 * silently did nothing. Rewriting the script fixed it locally and the owner
 * still got nothing on the deployed site — at which point the right move was to
 * delete the mechanism rather than keep debugging a thing I could not observe.
 *
 * A native form POST cannot be inert. There is no handler to fail to attach, no
 * bundle to mis-emit, nothing to hydrate, and it still works on the kind of
 * signal you get in a driveway behind a house. The endpoint therefore accepts
 * BOTH shapes: a normal form submission (redirect back, cookie set) and JSON
 * (for anything programmatic later).
 *
 * FAIL CLOSED WHERE IT COUNTS. No ESTIMATOR_PIN configured → 404, the same
 * answer an unknown route gives, so probing cannot distinguish "disabled" from
 * "does not exist". A wrong code is refused with no detail.
 *
 * NO LOCKOUT — THE OWNER'S CALL, MADE KNOWINGLY (2026-11-25). An earlier
 * version locked an address out for fifteen minutes after five wrong codes,
 * and it was removed because it locks out the crew too.
 *
 * THE CONSEQUENCE, RECORDED SO NOBODY RE-DERIVES IT: with no lockout, the
 * length of the code is the ONLY thing standing between this page and anyone
 * who scripts it. Unlimited guesses against six digits is a million
 * combinations — hours, not years. If this door is ever worth hardening again,
 * lengthening ESTIMATOR_PIN is the cheapest fix and needs no code change; a
 * short delay on a wrong answer would be the next one, since it costs a human
 * nothing and costs a script everything.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const env = {
    ESTIMATOR_PIN: import.meta.env.ESTIMATOR_PIN,
    ADMIN_SESSION_SECRET: import.meta.env.ADMIN_SESSION_SECRET,
  };

  if (!isEstimatorEnabled(env)) {
    return new Response("Not found", { status: 404 });
  }

  // How the caller asked decides how we answer.
  const contentType = request.headers.get("content-type") ?? "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  const fail = () =>
    isForm ? redirect("/estimator?e=wrong", 303) : json({ ok: false, error: "wrong" }, 401);

  let submitted = "";
  try {
    if (isForm) {
      const form = await request.formData();
      submitted = String(form.get("pin") ?? "");
    } else {
      const body = await request.json();
      submitted = typeof body?.pin === "string" ? body.pin : "";
    }
  } catch {
    return isForm ? redirect("/estimator?e=wrong", 303) : json({ ok: false }, 400);
  }

  if (!checkPin(submitted, env)) return fail();

  cookies.set(
    ESTIMATOR_COOKIE,
    await createEstimatorToken(env.ADMIN_SESSION_SECRET!, Math.floor(Date.now() / 1000)),
    { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: ESTIMATOR_MAX_AGE_SECONDS },
  );

  // 303 so the browser follows with GET; the middleware then sees the cookie.
  return isForm ? redirect("/estimator", 303) : json({ ok: true });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
