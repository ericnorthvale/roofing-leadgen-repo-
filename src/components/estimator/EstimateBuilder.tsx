/**
 * The crew estimator — what a rep fills in standing in a driveway.
 *
 * THE DIVISION THAT MAKES THIS SAFE. The rep types every figure; this file
 * supplies the words. Descriptions come from src/lib/estimate-items.ts, money
 * comes from a human, and the only arithmetic here is multiplication and
 * addition of what was typed. Nothing invents a price, and the narrative
 * assistant (phase 2) will not be allowed near these fields either.
 *
 * WHY MONEY IS HELD AS TEXT, NOT AS A NUMBER. A controlled input that reformats
 * while you type fights you on a phone keyboard — it eats the decimal point and
 * reorders digits mid-entry. The raw string is kept exactly as typed and parsed
 * only when totalling, so what the rep sees is what the rep wrote. Totals are
 * computed in whole cents because 0.1 + 0.2 is not 0.3 in floating point and an
 * estimate that is a penny out looks like a company that cannot add up.
 *
 * THE PER-SQUARE READBACK IS A TYPO TRAP, NOT A FEATURE. Replacement prices are
 * usually thought of per square, so showing the implied per-square beside a
 * lump sum catches the fat-fingered zero before the customer sees it. A rep who
 * meant $450 a square sees "$38/square" and stops.
 */
import { useMemo, useState } from "react";
import {
  BLOCK_LABEL,
  ESTIMATE_ITEMS,
  REPLACEMENT_DEFAULTS,
  type EstimateBlock,
  type EstimateItem,
} from "~/lib/estimate-items";
import type { EstimateDraft } from "~/lib/estimate-draft";

interface Line {
  key: string;
  item: EstimateItem;
  qty: string;
  price: string;
  /** Filled from speech and not yet confirmed by the rep. Cleared on first edit. */
  fromSpeech?: boolean;
  /** A figure here could not be found in what the rep said. Worth a second look. */
  unverified?: boolean;
}

const ITEM_BY_ID = new Map(ESTIMATE_ITEMS.map((i) => [i.id, i]));

const BLOCKS: EstimateBlock[] = ["replacement", "repair", "gutters", "ventilation", "maintenance"];

/** Parse a typed money string to whole cents. Blank or nonsense → 0. */
function toCents(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function toQty(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function EstimateBuilder() {
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", email: "" });
  const [squares, setSquares] = useState("");
  const [measuring, setMeasuring] = useState(false);
  const [measureNote, setMeasureNote] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>(() =>
    ESTIMATE_ITEMS.filter((i) => REPLACEMENT_DEFAULTS.includes(i.id)).map((item) => ({
      key: `${item.id}-${Math.random().toString(36).slice(2, 8)}`,
      item,
      qty: "",
      price: "",
    })),
  );
  const [notes, setNotes] = useState("");
  const [deposit, setDeposit] = useState("");
  const [picker, setPicker] = useState<EstimateBlock>("replacement");
  const [transcript, setTranscript] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + Math.round(toQty(l.qty) * toCents(l.price)), 0),
    [lines],
  );

  /** Replacement subtotal only — the per-square readback must not include gutters. */
  const replacementCents = useMemo(
    () =>
      lines
        .filter((l) => l.item.block === "replacement")
        .reduce((sum, l) => sum + Math.round(toQty(l.qty) * toCents(l.price)), 0),
    [lines],
  );

  const sq = toQty(squares);
  const perSquare = sq > 0 && replacementCents > 0 ? replacementCents / sq : null;

  function addLine(item: EstimateItem) {
    setLines((prev) => [
      ...prev,
      { key: `${item.id}-${Math.random().toString(36).slice(2, 8)}`, item, qty: "", price: "" },
    ]);
  }

  /** Any edit by the rep means the line has been looked at — drop the flags. */
  function update(key: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l) =>
        l.key === key ? { ...l, ...patch, fromSpeech: false, unverified: false } : l,
      ),
    );
  }

  function remove(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  /**
   * Fold a draft into the form.
   *
   * THE RULE IS FILL, NEVER OVERWRITE. Anything the rep has already typed wins
   * over anything the model heard — so running this twice, or after correcting
   * a line by hand, cannot undo their work. That also means there is no "are
   * you sure" dialog to tap through in a driveway: the action is always safe.
   */
  function applyDraft(d: EstimateDraft) {
    if (d.squares !== null && !squares.trim()) setSquares(String(d.squares));

    setLines((prev) => {
      const next = [...prev];
      for (const dl of d.lines) {
        const item = ITEM_BY_ID.get(dl.id);
        if (!item) continue; // already guaranteed server-side; cheap to re-check
        const at = next.findIndex((l) => l.item.id === dl.id);
        const qty = dl.qty !== null ? String(dl.qty) : "";
        const price = dl.price !== null ? String(dl.price) : "";

        if (at !== -1) {
          const existing = next[at];
          const filledQty = existing.qty.trim() ? existing.qty : qty;
          const filledPrice = existing.price.trim() ? existing.price : price;
          // Only mark the line as touched by speech if speech actually added
          // something; otherwise leave the rep's own line completely alone.
          if (filledQty !== existing.qty || filledPrice !== existing.price) {
            next[at] = {
              ...existing,
              qty: filledQty,
              price: filledPrice,
              fromSpeech: true,
              unverified: dl.unverified === true,
            };
          }
        } else {
          next.push({
            key: `${item.id}-${Math.random().toString(36).slice(2, 8)}`,
            item,
            qty,
            price,
            fromSpeech: true,
            unverified: dl.unverified === true,
          });
        }
      }
      return next;
    });

    if (d.notes) setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${d.notes}` : d.notes));
    setUnmatched(d.unmatched);

    const blanks = d.lines.filter((l) => l.price === null).length;
    setDraftNote(
      d.lines.length === 0
        ? "Nothing picked up from that. Try naming the work — “tear off, thirty squares, four fifty a square”."
        : blanks > 0
          ? `Added ${d.lines.length} item${d.lines.length === 1 ? "" : "s"}. ${blanks} still need${blanks === 1 ? "s" : ""} a price — only what you said out loud gets filled in.`
          : `Added ${d.lines.length} item${d.lines.length === 1 ? "" : "s"}. Check every figure before you send.`,
    );
  }

  /** Send what the rep said to the draft endpoint. */
  async function buildFromSpeech() {
    if (transcript.trim().length < 3 || drafting) return;
    setDrafting(true);
    setDraftNote(null);
    try {
      const res = await fetch("/api/estimator/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok && data.draft) {
        applyDraft(data.draft as EstimateDraft);
        return;
      }
      setDraftNote(
        data?.reason === "unconfigured"
          ? "The assistant isn't switched on yet. Fill the estimate in below as usual."
          : data?.reason === "locked"
            ? "Your session timed out. Reload the page and put the code in again."
            : "Couldn't read that just now. Fill it in below, or try saying it again.",
      );
    } catch {
      setDraftNote("No signal for that. Fill it in below, or try again once you're back on data.");
    } finally {
      setDrafting(false);
    }
  }

  /** Measure the roof from the address, reusing the public calculator's endpoint. */
  async function measure() {
    if (!customer.address.trim()) return;
    setMeasuring(true);
    setMeasureNote(null);
    try {
      const res = await fetch(`/api/roof-measure?address=${encodeURIComponent(customer.address)}`);
      const data = await res.json();
      if (data?.available && typeof data.squares === "number") {
        setSquares(String(Math.round(data.squares * 10) / 10));
        setMeasureNote("Measured from aerial imagery — check it against the roof.");
      } else {
        setMeasureNote("No measurement for this address. Type the squares yourself.");
      }
    } catch {
      setMeasureNote("Could not measure right now. Type the squares yourself.");
    } finally {
      setMeasuring(false);
    }
  }

  const ready = customer.name.trim() && customer.address.trim() && total > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32">
      {/* ── Talk it through ──────────────────────────────────────────
          No speech code here on purpose. Every phone keyboard already has a
          microphone button that dictates into any box, it works offline-ish on
          bad signal, it needs no permission prompt we have to design around,
          and it cannot fail to attach the way a script can. The rep taps the
          mic they already know; this box just collects the words. */}
      <section className="mt-6 rounded-xl border border-[color:var(--color-gold-600)]/40 bg-white p-4">
        <h2 className="m-0 text-[15px] font-bold text-[color:var(--color-navy-900,#1b2437)]">
          Talk it through
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-[color:var(--color-ink-500)]">
          Tap the microphone on your keyboard and say what you&rsquo;re doing and what you&rsquo;re
          charging &mdash; &ldquo;tear off and replace, thirty squares, four fifty a square, two
          pipe boots at ninety.&rdquo; Only numbers you actually say get filled in.
        </p>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={4}
          placeholder="Hold the mic on your keyboard and talk…"
          aria-label="What you're quoting, in your own words"
          className="w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] p-3 text-[15px]"
        />
        <button
          type="button"
          onClick={buildFromSpeech}
          disabled={drafting || transcript.trim().length < 3}
          className="mt-3 w-full rounded-lg bg-[color:var(--color-navy-900,#1b2437)] px-5 py-3 text-[15px] font-bold text-white disabled:opacity-40"
        >
          {drafting ? "Building…" : "Build the estimate"}
        </button>
        {draftNote && (
          <p role="status" className="mt-3 mb-0 text-[13px] text-[color:var(--color-ink-700)]">
            {draftNote}
          </p>
        )}
        {unmatched.length > 0 && (
          <p className="mt-2 mb-0 text-[13px] text-[#8a5a00]">
            Not on the list, add it yourself if you need it: {unmatched.join(", ")}
          </p>
        )}
      </section>

      {/* ── Customer ─────────────────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          Customer
        </h2>
        <div className="mt-3 grid gap-3">
          <Field
            label="Name"
            value={customer.name}
            onChange={(v) => setCustomer({ ...customer, name: v })}
            autoComplete="name"
          />
          <Field
            label="Property address"
            value={customer.address}
            onChange={(v) => setCustomer({ ...customer, address: v })}
            autoComplete="street-address"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone"
              type="tel"
              value={customer.phone}
              onChange={(v) => setCustomer({ ...customer, phone: v })}
              autoComplete="tel"
            />
            <Field
              label="Email"
              type="email"
              value={customer.email}
              onChange={(v) => setCustomer({ ...customer, email: v })}
              autoComplete="email"
            />
          </div>
        </div>
      </section>

      {/* ── Roof size ────────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          Roof size
        </h2>
        <div className="mt-3 flex items-end gap-3">
          <div className="w-32">
            <Field
              label="Squares"
              type="text"
              value={squares}
              onChange={setSquares}
              inputMode="decimal"
            />
          </div>
          <button
            type="button"
            onClick={measure}
            disabled={measuring || !customer.address.trim()}
            className="mb-[2px] rounded-lg border border-[color:var(--color-navy-300,#9aa3b5)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-navy-900,#1b2437)] disabled:opacity-40"
          >
            {measuring ? "Measuring…" : "Measure from address"}
          </button>
        </div>
        {measureNote && (
          <p className="mt-2 text-[13px] text-[color:var(--color-ink-500)]">{measureNote}</p>
        )}
      </section>

      {/* ── Line items ───────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          What we'll do
        </h2>

        <ul className="mt-3 list-none space-y-3 p-0">
          {lines.map((l) => {
            const lineCents = Math.round(toQty(l.qty) * toCents(l.price));
            return (
              <li
                key={l.key}
                className="rounded-xl border border-[color:var(--color-ink-200,#e4e6e9)] bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="m-0 text-[15px] font-semibold text-[color:var(--color-navy-900,#1b2437)]">
                    {l.item.label}
                    {l.unverified ? (
                      <span className="ml-2 align-middle text-[11px] font-bold text-[#8a5a00]">
                        CHECK THIS
                      </span>
                    ) : l.fromSpeech ? (
                      <span className="ml-2 align-middle text-[11px] font-bold text-[color:var(--color-ink-500)]">
                        FROM SPEECH
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(l.key)}
                    aria-label={`Remove ${l.item.label}`}
                    className="shrink-0 rounded px-2 text-[color:var(--color-ink-500)]"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={l.qty}
                    onChange={(e) => update(l.key, { qty: e.target.value })}
                    inputMode="decimal"
                    placeholder="Qty"
                    aria-label={`Quantity for ${l.item.label}`}
                    className="w-20 rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] px-2 py-2 text-[15px]"
                  />
                  <span className="text-[13px] text-[color:var(--color-ink-500)]">
                    {l.item.unit}
                  </span>
                  <span className="text-[color:var(--color-ink-500)]">×</span>
                  <input
                    value={l.price}
                    onChange={(e) => update(l.key, { price: e.target.value })}
                    inputMode="decimal"
                    placeholder="$ each"
                    aria-label={`Price for ${l.item.label}`}
                    className="w-28 rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] px-2 py-2 text-[15px]"
                  />
                  <span className="ml-auto text-[15px] font-bold tabular-nums">
                    {lineCents > 0 ? money(lineCents) : "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Picker */}
        <div className="mt-5 rounded-xl border border-dashed border-[color:var(--color-ink-200,#e4e6e9)] p-3">
          <div className="flex flex-wrap gap-1.5">
            {BLOCKS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setPicker(b)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                  picker === b
                    ? "bg-[color:var(--color-navy-900,#1b2437)] text-white"
                    : "bg-[color:var(--color-sand-100,#f0ece5)] text-[color:var(--color-ink-700)]"
                }`}
              >
                {BLOCK_LABEL[b]}
              </button>
            ))}
          </div>
          <ul className="mt-3 list-none space-y-1 p-0">
            {ESTIMATE_ITEMS.filter((i) => i.block === picker).map((item) => (
              <li key={item.id} className="m-0 p-0">
                <button
                  type="button"
                  onClick={() => addLine(item)}
                  className="w-full rounded-lg px-2 py-2 text-left text-[14px] hover:bg-[color:var(--color-sand-50,#faf8f5)]"
                >
                  <span className="font-semibold text-[color:var(--color-navy-800,#243049)]">
                    + {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Notes + deposit ──────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-[13px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
          What you found
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="What you saw on the roof, in your own words. This prints on the estimate."
          className="mt-3 w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] p-3 text-[15px]"
        />
        <div className="mt-3 w-40">
          <Field
            label="Deposit (optional)"
            value={deposit}
            onChange={setDeposit}
            inputMode="decimal"
          />
        </div>
      </section>

      {/* ── Sticky total ─────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[color:var(--color-ink-200,#e4e6e9)] bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div>
            <p className="m-0 text-[12px] text-[color:var(--color-ink-500)]">Total</p>
            <p className="m-0 text-2xl font-bold text-[color:var(--color-navy-900,#1b2437)] tabular-nums">
              {money(total)}
            </p>
            {perSquare !== null && (
              <p className="m-0 text-[12px] text-[color:var(--color-ink-500)]">
                {money(perSquare)}/square on {sq} squares
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
  type?: string;
  autoComplete?: string;
  inputMode?: "decimal" | "text";
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-[color:var(--color-ink-700)]">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] px-3 py-2.5 text-[15px]"
      />
    </label>
  );
}
