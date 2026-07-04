import { useEffect, useMemo, useState } from "react";
import { IKO_SHINGLES } from "~/lib/iko-products";
import { colorsForLine, type ShingleLine } from "~/lib/iko-colors";
import { LEGAL } from "~/lib/legal";
import { getSelection, onSelection } from "./store";

const UPGRADES = [
  {
    key: "class4",
    label: "Class 4 impact (IKO Nordic)",
    note: "Highest hail rating; ask your carrier about a premium discount.",
  },
  {
    key: "ventilation",
    label: "Upgraded ridge ventilation",
    note: "Balanced intake/exhaust to fight Gulf-Coast attic heat.",
  },
  {
    key: "icewater",
    label: "Extra ice-and-water coverage",
    note: "Beyond valleys/penetrations for added leak protection.",
  },
  {
    key: "solar",
    label: "Solar-ready flashing",
    note: "Pre-flash key locations if panels are in your plans.",
  },
] as const;

const PHONE_PATTERN = "[0-9\\s\\(\\)\\-\\+\\.]{10,}";
const ZIP_PATTERN = "\\d{5}(-\\d{4})?";

export default function RoofConfigurator() {
  const [step, setStep] = useState(1);
  const [line, setLine] = useState<ShingleLine>("dynasty");
  const [color, setColor] = useState<string>("");
  const [upgrades, setUpgrades] = useState<string[]>([]);

  // Preselect from a gallery/visualizer/recommender handoff.
  useEffect(() => {
    const apply = (sel: { line?: ShingleLine; color?: string }) => {
      if (sel.line) setLine(sel.line);
      if (sel.color) setColor(sel.color);
    };
    apply(getSelection());
    return onSelection(apply);
  }, []);

  const colors = useMemo(() => colorsForLine(line), [line]);
  // Keep the chosen color valid for the chosen line.
  useEffect(() => {
    if (color && !colors.some((c) => c.name === color)) setColor("");
  }, [colors, color]);

  const shingle = IKO_SHINGLES.find((s) => s.slug === line)!;
  const chosenUpgrades = UPGRADES.filter((u) => upgrades.includes(u.key)).map((u) => u.label);
  const notes = [
    `Roof Design Center selection`,
    `Shingle: ${shingle.name} (${shingle.impactLabel})`,
    `Color: ${color || "undecided"}`,
    `Upgrades: ${chosenUpgrades.length ? chosenUpgrades.join("; ") : "none selected"}`,
  ].join(" — ");

  const stepLabels = ["Shingle", "Color", "Upgrades", "Review", "Request"];

  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-white p-6">
      <ol className="flex flex-wrap gap-2 text-xs font-semibold">
        {stepLabels.map((label, i) => (
          <li
            key={label}
            className={`rounded-[var(--radius-pill)] px-3 py-1 ${
              step === i + 1
                ? "bg-[color:var(--color-navy-900)] text-white"
                : step > i + 1
                  ? "bg-[color:var(--color-navy-50)] text-[color:var(--color-navy-900)]"
                  : "text-[color:var(--color-ink-500)]"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {step === 1 && (
          <div>
            <h3 className="text-xl">Choose your shingle</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {IKO_SHINGLES.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setLine(s.slug)}
                  aria-pressed={line === s.slug}
                  className={`rounded-[var(--radius-card)] border p-4 text-left transition ${
                    line === s.slug
                      ? "border-[color:var(--color-gold-600)] ring-2 ring-[color:var(--color-gold-600)]"
                      : "border-[color:var(--color-navy-100)] hover:border-[color:var(--color-navy-300)]"
                  }`}
                >
                  <span className="block font-semibold">{s.name}</span>
                  <span className="mt-1 block text-sm text-[color:var(--color-ink-500)]">
                    {s.impactLabel} · {s.windWarrantyMph}-mph wind warranty
                  </span>
                  <span className="mt-2 block text-sm text-[color:var(--color-ink-800)]">
                    {s.bestFor}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-xl">Pick a color for {shingle.name}</h3>
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {colors.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setColor(c.name)}
                    aria-pressed={color === c.name}
                    title={c.name}
                    className={`block w-full overflow-hidden rounded-[var(--radius-card)] border-2 ${
                      color === c.name
                        ? "border-[color:var(--color-gold-600)]"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      className="block h-14 w-full"
                      style={{ backgroundColor: c.swatch }}
                      aria-hidden="true"
                    />
                    <span className="block px-1 py-1 text-[11px] font-semibold">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-xl">Any upgrades?</h3>
            <ul className="mt-4 grid gap-3">
              {UPGRADES.map((u) => (
                <li key={u.key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] p-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={upgrades.includes(u.key)}
                      onChange={(e) =>
                        setUpgrades((prev) =>
                          e.target.checked ? [...prev, u.key] : prev.filter((k) => k !== u.key),
                        )
                      }
                    />
                    <span>
                      <span className="block font-semibold">{u.label}</span>
                      <span className="block text-sm text-[color:var(--color-ink-500)]">
                        {u.note}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-xl">Review your roof</h3>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-[color:var(--color-navy-100)] py-2">
                <dt className="text-[color:var(--color-ink-500)]">Shingle</dt>
                <dd className="font-semibold">
                  {shingle.name} ({shingle.impactLabel})
                </dd>
              </div>
              <div className="flex justify-between border-b border-[color:var(--color-navy-100)] py-2">
                <dt className="text-[color:var(--color-ink-500)]">Color</dt>
                <dd className="font-semibold">{color || "Undecided — we'll bring samples"}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-[color:var(--color-ink-500)]">Upgrades</dt>
                <dd className="font-semibold">
                  {chosenUpgrades.length ? chosenUpgrades.join(", ") : "None"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-[color:var(--color-ink-500)]">
              Next: your details, and we'll bring this exact selection (and real samples) to a free
              inspection with a written estimate.
            </p>
          </div>
        )}

        {step === 5 && (
          <form method="POST" action="/api/lead" className="grid gap-4">
            <h3 className="text-xl">Request a free inspection</h3>
            <input type="hidden" name="source" value="roof-design-center" />
            <input type="hidden" name="service" value="replacement" />
            <input type="hidden" name="notes" value={notes} />
            <input type="hidden" name="utm" value="" data-utm-field />
            <input type="hidden" name="eventId" value="" data-event-id-field />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">First name</span>
                <input
                  required
                  name="firstName"
                  maxLength={100}
                  autoComplete="given-name"
                  className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Last name</span>
                <input
                  name="lastName"
                  maxLength={100}
                  autoComplete="family-name"
                  className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Phone</span>
              <input
                required
                name="phone"
                type="tel"
                maxLength={30}
                inputMode="tel"
                pattern={PHONE_PATTERN}
                autoComplete="tel"
                className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">
                Email <span className="text-[color:var(--color-ink-500)]">(optional)</span>
              </span>
              <input
                name="email"
                type="email"
                maxLength={200}
                autoComplete="email"
                className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Street address</span>
              <input
                required
                name="address"
                maxLength={200}
                autoComplete="street-address"
                className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">City</span>
                <input
                  required
                  name="city"
                  maxLength={100}
                  autoComplete="address-level2"
                  className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">ZIP</span>
                <input
                  required
                  name="zip"
                  maxLength={10}
                  inputMode="numeric"
                  pattern={ZIP_PATTERN}
                  autoComplete="postal-code"
                  className="rounded border border-[color:var(--color-navy-200)] px-3 py-2"
                />
              </label>
            </div>

            {/* Honeypot */}
            <label className="sr-only" aria-hidden="true">
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <label className="flex items-start gap-2 text-xs text-[color:var(--color-ink-500)]">
              <input required name="consent" type="checkbox" className="mt-1" />
              <span>{LEGAL.consentDisclaimer}</span>
            </label>

            <p className="rounded-[var(--radius-card)] bg-[color:var(--color-navy-50)] p-3 text-xs text-[color:var(--color-ink-800)]">
              We'll bring: <strong>{shingle.name}</strong>
              {color ? `, ${color}` : ""}
              {chosenUpgrades.length ? `, ${chosenUpgrades.join(", ")}` : ""}.
            </p>

            <button type="submit" className="btn btn-primary justify-self-start">
              Book my free inspection
            </button>
          </form>
        )}
      </div>

      {/* Step navigation (hidden on the final form step, which has its own submit) */}
      {step < 5 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-sm font-semibold underline disabled:opacity-40"
          >
            ← Back
          </button>
          <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary">
            {step === 4 ? "Continue to request" : "Next"}
          </button>
        </div>
      )}
      {step === 5 && (
        <div className="mt-6">
          <button onClick={() => setStep(4)} className="text-sm font-semibold underline">
            ← Back to review
          </button>
        </div>
      )}
    </div>
  );
}
