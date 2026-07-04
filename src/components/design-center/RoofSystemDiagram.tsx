import { useState } from "react";
import { IKO_SYSTEM_PARTS } from "~/lib/iko-products";

export default function RoofSystemDiagram() {
  const [active, setActive] = useState(IKO_SYSTEM_PARTS[0].key);
  const part = IKO_SYSTEM_PARTS.find((p) => p.key === active)!;

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <ul className="grid gap-2">
        {IKO_SYSTEM_PARTS.map((p, i) => (
          <li key={p.key}>
            <button
              onClick={() => setActive(p.key)}
              aria-pressed={active === p.key}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left transition ${
                active === p.key
                  ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white"
                  : "border-[color:var(--color-navy-100)] bg-white hover:border-[color:var(--color-navy-300)]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  active === p.key
                    ? "bg-[color:var(--color-gold-400)] text-[color:var(--color-navy-900)]"
                    : "bg-[color:var(--color-navy-50)] text-[color:var(--color-navy-900)]"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-semibold">{p.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-white p-6">
        <h3 className="text-2xl">{part.label}</h3>
        <p className="mt-1 text-sm font-semibold tracking-wide text-[color:var(--color-gold-600)] uppercase">
          What Northvale installs: {part.product}
        </p>
        <p className="mt-4 text-[color:var(--color-ink-800)]">{part.role}</p>
        <p className="mt-6 text-sm text-[color:var(--color-ink-500)]">
          A roof is a system — the shingle is the visible part, but the starter, underlayment,
          ice-and-water protector, ventilation, and flashing are what decide whether it lasts. We
          install a complete IKO system and document every layer in your 40-photo packet.
        </p>
      </div>
    </div>
  );
}
