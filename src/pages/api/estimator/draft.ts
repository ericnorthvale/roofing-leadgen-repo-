import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { ESTIMATOR_COOKIE, isEstimatorEnabled, verifyEstimatorToken } from "~/lib/estimator-auth";
import {
  DRAFT_SCHEMA,
  buildConversationPrompt,
  buildDraftSystem,
  validateDraft,
  type EstimateDraft,
} from "~/lib/estimate-draft";

export const prerender = false;

/**
 * Transcript in, draft estimate out.
 *
 * WHY THIS ROUTE CHECKS ITS OWN COOKIE. The middleware gate covers /estimator
 * and /estimator/*; this lives under /api/, so it is NOT behind that gate. An
 * endpoint that spends the company's API budget cannot be left open because a
 * reader assumed the middleware had it. It verifies the signed session itself.
 *
 * BEST-EFFORT, LIKE EVERY OTHER INTEGRATION HERE (see src/lib/notify.ts). No
 * ANTHROPIC_API_KEY means a clean, explicit skip, not a crash — the rep types
 * the estimate the way they did yesterday. A provider outage must never be the
 * reason a lead goes unquoted, so every failure path returns a short reason the
 * UI can show rather than a stack trace.
 *
 * THE MODEL IS GIVEN NO CUSTOMER DATA. Only the transcript the rep dictated and
 * the fixed catalogue. The name, address, phone and email stay in the browser.
 */

const MAX_TRANSCRIPT = 8_000;
/** How many things the rep has said we carry back. Plenty for one estimate. */
const MAX_TURNS = 40;

/**
 * Low effort on purpose. This is extraction against a fixed vocabulary, not a
 * judgement call, and the rep is standing in a driveway on a phone — the right
 * trade is a fast answer they then correct, not a slow one they still correct.
 */
const MODEL = "claude-opus-5-5";

export const POST: APIRoute = async ({ request, cookies }) => {
  const env = {
    ESTIMATOR_PIN: import.meta.env.ESTIMATOR_PIN,
    ADMIN_SESSION_SECRET: import.meta.env.ADMIN_SESSION_SECRET,
  };

  // Same answer an unknown route gives, so probing learns nothing.
  if (!isEstimatorEnabled(env)) return new Response("Not found", { status: 404 });

  const session = await verifyEstimatorToken(
    cookies.get(ESTIMATOR_COOKIE)?.value,
    env.ADMIN_SESSION_SECRET!,
    Math.floor(Date.now() / 1000),
  );
  if (!session) return json({ ok: false, reason: "locked" }, 401);

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ ok: false, reason: "unconfigured" }, 503);

  let turns: string[] = [];
  let current: EstimateDraft | null = null;
  try {
    const body = await request.json();
    const raw = Array.isArray(body?.turns) ? body.turns : [];
    turns = raw
      .filter((t: unknown): t is string => typeof t === "string")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .slice(-MAX_TURNS);
    // Re-validated rather than trusted: it came back from a browser, and the
    // only thing standing between a tampered line and a customer's estimate
    // is this call.
    current = body?.current ? validateDraft(body.current, turns.join(" ")) : null;
  } catch {
    return json({ ok: false, reason: "bad-request" }, 400);
  }

  const transcript = turns.join("\n").slice(0, MAX_TRANSCRIPT);
  if (transcript.length < 3) return json({ ok: false, reason: "empty" }, 400);

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: DRAFT_SCHEMA },
      },
      system: [
        {
          type: "text",
          text: buildDraftSystem(),
          // Identical on every call — free to cache, no-op if it is under the
          // model's minimum cacheable length.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildConversationPrompt(turns, current) }],
    });

    // Guard before reading content: a refusal returns 200 with no usable text.
    if (response.stop_reason === "refusal") {
      return json({ ok: false, reason: "refused" }, 502);
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ ok: false, reason: "unreadable" }, 502);
    }

    // Everything the model said is re-checked here before it reaches a screen.
    return json({ ok: true, draft: validateDraft(parsed, transcript) });
  } catch (err) {
    /**
     * THE REP GETS A SENTENCE; THE PAGE ALSO GETS THE REASON.
     *
     * This used to swallow the error entirely, on the grounds that a rep
     * cannot act on an API error code. That was right about the rep and wrong
     * about everything else: the first time the live call failed, "Couldn't
     * take that in" was all anyone had, and the actual cause — which is
     * usually one of three boring billing or access problems — was invisible
     * from the only place it could be observed.
     *
     * So the cause travels back as `detail` and is shown in small print. This
     * page is behind the crew code and no customer ever sees it. Anthropic's
     * error bodies carry a type and a human-readable message, neither of which
     * contains the key; the message is truncated anyway.
     */
    const detail = describeApiError(err);
    // Also to the server log, where it survives the rep closing the page.
    console.error("[estimator/draft] call failed:", detail);
    return json({ ok: false, reason: "failed", detail }, 502);
  }
};

/** A short, safe description of why a call failed. Never includes the key. */
function describeApiError(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    const body = err.error as { error?: { type?: string; message?: string } } | undefined;
    const type = body?.error?.type ?? "api_error";
    const message = body?.error?.message ?? err.message ?? "";
    return `${err.status ?? "?"} ${type}: ${message}`.slice(0, 300);
  }
  if (err instanceof Error) return `${err.name}: ${err.message}`.slice(0, 300);
  return "unknown error";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
