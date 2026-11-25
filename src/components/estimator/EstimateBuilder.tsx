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

interface Line {
  key: string;
  item: EstimateItem;
  qty: string;
  price: string;
}

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

  function update(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function remove(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
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
