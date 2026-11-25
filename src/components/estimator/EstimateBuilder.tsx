/**
 * The crew estimator — what a rep does standing in a driveway.
 *
 * THERE IS NO LONGER A FORM TO FILL IN. The owner's call (2026-11-25): the
 * only things needed are the customer's details and a conversation about the
 * job. The rep talks; the estimate gets built. An earlier version had the rep
 * tick items off a list and type a quantity and price into every one, and that
 * was work the rep was doing on the software's behalf.
 *
 * WHAT STAYS TYPED, AND WHY. Name, address, phone, email. A misheard price is
 * visible in the total; a misheard house number is not, and it is the one
 * mistake that sends a crew to the wrong roof.
 *
 * CORRECTIONS ARE SPOKEN, NOT EDITED. "Make the tear-off four seventy-five",
 * "take the gutters off" — each turn re-derives the whole estimate from the
 * whole conversation, so removing something is as sayable as adding it, and no
 * running state accumulates an error quietly between turns.
 *
 * THE ESTIMATE IS READ-ONLY ON PURPOSE. Not to stop the rep changing it — they
 * change it by talking — but because an editable box invites a figure to be
 * typed in that was never said, which is the one thing this tool must not
 * make easy. Every number shown traces to a sentence in the conversation
 * above it, and anything that does not is marked.
 *
 * MONEY IS TOTALLED IN WHOLE CENTS. 0.1 + 0.2 is not 0.3 in floating point and
 * an estimate a penny out looks like a company that cannot add up.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ESTIMATE_ITEMS } from "~/lib/estimate-items";
import type { EstimateDraft } from "~/lib/estimate-draft";

const ITEM_BY_ID = new Map(ESTIMATE_ITEMS.map((i) => [i.id, i]));

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const toCents = (dollars: number) => Math.round(dollars * 100);

const EMPTY: EstimateDraft = {
  lines: [],
  squares: null,
  deposit: null,
  notes: "",
  unmatched: [],
};

export default function EstimateBuilder() {
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", email: "" });
  const [turns, setTurns] = useState<string[]>([]);
  const [saying, setSaying] = useState("");
  const [draft, setDraft] = useState<EstimateDraft>(EMPTY);
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  /**
   * THE PRE-HYDRATION TRAP.
   *
   * This page is server-rendered and then hydrated, so there is a window in
   * which the boxes are real but React is not yet behind them. Anything typed
   * in that window lives only in the DOM — and worse than being ignored, it is
   * destroyed, because these are controlled inputs and React's first render
   * after hydration writes its own empty state over whatever is there. The rep
   * watches their words vanish.
   *
   * It is the silent dead button from the unlock screen in another costume,
   * and on a cheap phone on bad signal the window is wide. Adopting the DOM on
   * mount — before React can overwrite it — is the fix. Reading the live value
   * again at send time is a second guard and is NOT a substitute: by then
   * React has already blanked the box.
   */
  const rootRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const read = (name: string) =>
      rootRef.current
        ?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="nv-${name}"]`)
        ?.value?.trim() ?? "";

    const early = {
      name: read("name"),
      address: read("address"),
      phone: read("phone"),
      email: read("email"),
    };
    if (early.name || early.address || early.phone || early.email) {
      setCustomer((prev) => ({
        name: early.name || prev.name,
        address: early.address || prev.address,
        phone: early.phone || prev.phone,
        email: early.email || prev.email,
      }));
    }

    const said = read("saying");
    if (said) setSaying(said);

    setHydrated(true);
  }, []);

  /** Only priced lines count. A line awaiting a price is not worth zero. */
  const total = useMemo(
    () =>
      draft.lines.reduce(
        (sum, l) => (l.price === null ? sum : sum + Math.round((l.qty ?? 1) * toCents(l.price))),
        0,
      ),
    [draft],
  );

  const awaitingPrice = draft.lines.filter((l) => l.price === null).length;
  const perSquare = draft.squares && total > 0 ? total / draft.squares : null;

  async function send() {
    if (working) return;
    const live =
      rootRef.current?.querySelector<HTMLTextAreaElement>('[name="nv-saying"]')?.value ?? "";
    const text = (live || saying).trim();
    if (text.length < 3) {
      setNote("Say something about the job first.");
      return;
    }

    const next = [...turns, text];
    setTurns(next);
    setSaying("");
    setWorking(true);
    setNote(null);

    try {
      const res = await fetch("/api/estimator/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ turns: next, current: draft }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok && data.draft) {
        setDraft(data.draft as EstimateDraft);
        return;
      }
      setNote(
        data?.reason === "unconfigured"
          ? "The assistant isn't switched on yet — nothing can be built until it is."
          : data?.reason === "locked"
            ? "Your session timed out. Reload the page and put the code in again."
            : "Couldn't take that in. Say it again, or try once you're back on data.",
      );
    } catch {
      setNote("No signal. Say it again once you're back on data — nothing is lost.");
    } finally {
      setWorking(false);
    }
  }

  function undoLastTurn() {
    setTurns((prev) => prev.slice(0, -1));
    setNote("Taken off the list. Say the correction and it'll rebuild.");
  }

  const ready = customer.name.trim() && customer.address.trim() && total > 0;

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl px-4 pb-36">
      {/* ── Customer — the only thing still typed ──────────────────── */}
      <section className="mt-6">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          Customer
        </h2>
        <div className="mt-3 grid gap-3">
          <Field
            label="Name"
            name="nv-name"
            value={customer.name}
            onChange={(v) => setCustomer({ ...customer, name: v })}
            autoComplete="name"
          />
          <Field
            label="Property address"
            name="nv-address"
            value={customer.address}
            onChange={(v) => setCustomer({ ...customer, address: v })}
            autoComplete="street-address"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone"
              name="nv-phone"
              type="tel"
              value={customer.phone}
              onChange={(v) => setCustomer({ ...customer, phone: v })}
              autoComplete="tel"
            />
            <Field
              label="Email"
              name="nv-email"
              type="email"
              value={customer.email}
              onChange={(v) => setCustomer({ ...customer, email: v })}
              autoComplete="email"
            />
          </div>
        </div>
      </section>

      {/* ── The conversation ───────────────────────────────────────── */}
      <section
        data-hydrated={hydrated ? "true" : "false"}
        className="mt-8 rounded-xl border border-[color:var(--color-gold-600)]/40 bg-white p-4"
      >
        <h2 className="m-0 text-[15px] font-bold text-[color:var(--color-navy-900,#1b2437)]">
          The job
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-[color:var(--color-ink-500)]">
          Tap the microphone on your keyboard and talk &mdash; &ldquo;tear off and replace, thirty
          squares, four fifty a square, two pipe boots at ninety.&rdquo; Keep going to add to it or
          change it.
        </p>

        {turns.length > 0 && (
          <ul className="mt-3 mb-3 list-none space-y-2 p-0">
            {turns.map((t, i) => (
              <li
                key={`${i}-${t.slice(0, 12)}`}
                className="m-0 flex items-start gap-2 rounded-lg bg-[color:var(--color-sand-50,#faf8f5)] px-3 py-2 text-[14px] text-[color:var(--color-ink-700)]"
              >
                <span className="flex-1">{t}</span>
                {i === turns.length - 1 && !working && (
                  <button
                    type="button"
                    onClick={undoLastTurn}
                    aria-label="Take back what I just said"
                    className="shrink-0 text-[12px] font-semibold text-[color:var(--color-ink-500)]"
                  >
                    Undo
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <textarea
          name="nv-saying"
          value={saying}
          onChange={(e) => setSaying(e.target.value)}
          rows={3}
          placeholder={
            turns.length === 0
              ? "Hold the mic on your keyboard and talk…"
              : "Anything to add or change?"
          }
          aria-label="What you're quoting, in your own words"
          className="w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] p-3 text-[15px]"
        />
        <button
          type="button"
          onClick={send}
          disabled={working}
          className="mt-3 w-full rounded-lg bg-[color:var(--color-navy-900,#1b2437)] px-5 py-3 text-[15px] font-bold text-white disabled:opacity-40"
        >
          {working ? "Building…" : turns.length === 0 ? "Build the estimate" : "Add this"}
        </button>
        {note && (
          <p role="status" className="mt-3 mb-0 text-[13px] text-[color:var(--color-ink-700)]">
            {note}
          </p>
        )}
      </section>

      {/* ── The estimate ───────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          The estimate
        </h2>

        {draft.lines.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-[color:var(--color-ink-200,#e4e6e9)] p-5 text-center text-[14px] text-[color:var(--color-ink-500)]">
            Nothing yet. Talk about the job above and it&rsquo;ll appear here.
          </p>
        ) : (
          <ul className="mt-3 list-none space-y-2 p-0">
            {draft.lines.map((l) => {
              const item = ITEM_BY_ID.get(l.id);
              if (!item) return null;
              const cents = l.price === null ? null : Math.round((l.qty ?? 1) * toCents(l.price));
              return (
                <li
                  key={l.id}
                  className="m-0 rounded-xl border border-[color:var(--color-ink-200,#e4e6e9)] bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-[15px] font-semibold text-[color:var(--color-navy-900,#1b2437)]">
                      {item.label}
                      {l.unverified && (
                        <span className="ml-2 align-middle text-[11px] font-bold text-[#8a5a00]">
                          CHECK THIS
                        </span>
                      )}
                    </p>
                    <p className="m-0 shrink-0 text-[15px] font-bold tabular-nums">
                      {cents === null ? (
                        <span className="text-[13px] font-semibold text-[#8a5a00]">
                          needs a price
                        </span>
                      ) : (
                        money(cents)
                      )}
                    </p>
                  </div>
                  <p className="m-0 mt-1 text-[13px] text-[color:var(--color-ink-500)] tabular-nums">
                    {l.qty !== null ? `${l.qty} ${item.unit}` : item.unit}
                    {l.price !== null && ` × ${money(toCents(l.price))}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {awaitingPrice > 0 && (
          <p className="mt-3 text-[13px] text-[#8a5a00]">
            {awaitingPrice} {awaitingPrice === 1 ? "line has" : "lines have"} no price. Say what
            you&rsquo;re charging and it&rsquo;ll fill in.
          </p>
        )}

        {draft.unmatched.length > 0 && (
          <p className="mt-2 text-[13px] text-[#8a5a00]">
            Not on the list, so not on the estimate:{" "}
            {draft.unmatched.map((u) => u.replace(/-/g, " ")).join(", ")}
          </p>
        )}

        {draft.notes && (
          <div className="mt-5 rounded-xl border border-[color:var(--color-ink-200,#e4e6e9)] bg-white p-4">
            <h3 className="m-0 text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
              What we found
            </h3>
            <p className="m-0 mt-2 text-[15px] whitespace-pre-line text-[color:var(--color-ink-700)]">
              {draft.notes}
            </p>
          </div>
        )}

        {draft.deposit !== null && (
          <p className="mt-3 text-[14px] text-[color:var(--color-ink-700)]">
            Deposit: <strong className="tabular-nums">{money(toCents(draft.deposit))}</strong>
          </p>
        )}
      </section>

      {/* ── Sticky total ───────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[color:var(--color-ink-200,#e4e6e9)] bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div>
            <p className="m-0 text-[12px] text-[color:var(--color-ink-500)]">Total</p>
            <p className="m-0 text-2xl font-bold text-[color:var(--color-navy-900,#1b2437)] tabular-nums">
              {money(total)}
            </p>
            {perSquare !== null && (
              <p className="m-0 text-[12px] text-[color:var(--color-ink-500)]">
                {money(perSquare)}/square on {draft.squares} squares
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() => window.print()}
            className="ml-auto rounded-lg bg-[color:var(--color-gold-600)] px-5 py-3 text-[15px] font-bold text-white disabled:opacity-40"
          >
            Review &amp; send
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Used to recover anything typed before hydration — see the mount effect. */
  name?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-[color:var(--color-ink-700)]">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        name={props.name}
        value={props.value}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] px-3 py-2.5 text-[15px]"
      />
    </label>
  );
}
