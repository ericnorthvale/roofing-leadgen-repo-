/**
 * Turning a rep's spoken notes into a DRAFT estimate.
 *
 * THE ONE DISTINCTION THIS WHOLE FILE EXISTS TO PROTECT. Transcribing a price
 * the rep said is not the same as choosing a price. "Tear off, thirty squares,
 * four fifty a square" came from a human standing on the roof; the model's only
 * job is to put 30 and 450 in the right boxes. The moment it fills an empty box
 * with a figure nobody said, it has invented a fact about what Northvale will
 * charge — Hard Rule #2 — and the estimate is worthless.
 *
 * So the rule is: a number the rep did not say comes back as null, always.
 * A blank field is a correct answer. A plausible field is not.
 *
 * WHAT IS GUARANTEED HERE VS. WHAT IS MERELY ASKED FOR. Be honest about which
 * is which, because they are not the same strength:
 *
 *   GUARANTEED by validateDraft() below, regardless of what the model returns —
 *   every line id exists in ESTIMATE_ITEMS, every quantity and price is a
 *   finite positive number inside sane bounds, nothing is duplicated, and no
 *   field outside the schema survives. A model that returns garbage produces an
 *   empty draft, never a corrupt one.
 *
 *   ASKED FOR in the prompt, and NOT verifiable from here — that each number
 *   was actually spoken. No validator can see the driveway. The backstops are
 *   (a) the grounding check below, which flags any figure whose digits do not
 *   appear in the transcript, and (b) the rep, who reads every line in an
 *   editable field with the total on screen before anything is sent.
 *
 * THE MODEL NEVER TOUCHES CUSTOMER DETAILS. There is no name, address, phone or
 * email in the schema and none is requested. The owner drew that line and it is
 * the right one: a misheard price is visible in the total, a misheard street
 * number is not.
 */
import { ESTIMATE_ITEMS } from "./estimate-items";
import { STUDIO_LINES } from "./design-studio";

/**
 * Every shingle the rep can name, as one closed vocabulary.
 *
 * Same safety model as the line items: the model picks an id from this list or
 * it picks nothing. It cannot name a colour IKO does not make, or put a Nordic
 * colour on a Dynasty roof, because the pairing is baked into the id.
 */
export const SHINGLE_CHOICES = STUDIO_LINES.flatMap((line) =>
  line.colors.map((c) => ({
    id: `${line.key}:${c.slug}`,
    label: `${line.name} — ${c.name}`,
  })),
);

const VALID_SHINGLES = new Set(SHINGLE_CHOICES.map((s) => s.id));

/** One line the model proposes. Nulls are expected and fine. */
export interface DraftLine {
  id: string;
  qty: number | null;
  price: number | null;
  /** True when a figure on this line could not be found in the transcript. */
  unverified?: boolean;
}

export interface EstimateDraft {
  lines: DraftLine[];
  squares: number | null;
  /** Optional, and only when the rep says one — deposits are case by case. */
  deposit: number | null;
  /** "<line>:<colour>" from SHINGLE_CHOICES, when the rep named one. */
  shingle: string | null;
  notes: string;
  /** Things the rep mentioned that match no catalogue item. Shown, never dropped. */
  unmatched: string[];
}

/**
 * Bounds exist to reject NaN, Infinity and negatives — not to second-guess the
 * rep. A genuinely unusual job must still go through.
 */
const MAX_QTY = 100_000;
const MAX_PRICE = 1_000_000;
const MAX_NOTES = 4_000;
const MAX_UNMATCHED = 20;

const VALID_IDS = new Set(ESTIMATE_ITEMS.map((i) => i.id));

/* ── The contract sent to the model ──────────────────────────────── */

/**
 * A strict JSON schema, so `id` cannot come back as anything but a real
 * catalogue id and the shape cannot drift. The validator still re-checks all of
 * it: a schema is the model's instruction sheet, not our guarantee.
 */
export const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["lines", "squares", "deposit", "shingle", "notes", "unmatched"],
  properties: {
    squares: {
      type: ["number", "null"],
      description: "Roof size in squares, ONLY if the rep said a number. Otherwise null.",
    },
    deposit: {
      type: ["number", "null"],
      description:
        "Deposit in dollars, ONLY if the rep asked for one and said the amount. Otherwise null.",
    },
    shingle: {
      type: ["string", "null"],
      enum: [...SHINGLE_CHOICES.map((s) => s.id), null],
      description:
        "The shingle line and colour the rep named, e.g. IKO Dynasty in Granite Black. Null if they did not name one. Never guess a colour.",
    },
    lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "qty", "price"],
        properties: {
          id: { type: "string", enum: ESTIMATE_ITEMS.map((i) => i.id) },
          qty: {
            type: ["number", "null"],
            description: "How many units, ONLY if the rep said a number. Otherwise null.",
          },
          price: {
            type: ["number", "null"],
            description:
              "Dollars per unit, ONLY if the rep said a price for this item. Otherwise null. Never estimate.",
          },
        },
      },
    },
    notes: {
      type: "string",
      description:
        "What the rep described finding on the roof, in plain English. Empty string if they described nothing.",
    },
    unmatched: {
      type: "array",
      items: { type: "string" },
      description: "Work the rep mentioned that matches no catalogue item.",
    },
  },
} as const;

/** The catalogue, as the model sees it. Ids are the only vocabulary it may use. */
export function buildCatalogue(): string {
  return ESTIMATE_ITEMS.map((i) => `${i.id} | ${i.label} | per ${i.unit} | ${i.detail}`).join("\n");
}

export const DRAFT_SYSTEM_PROMPT = `You turn a roofing sales rep's spoken notes into a DRAFT estimate for them to check.

You are a transcriber, not an estimator.

Every number you return must have been said out loud by the rep in the notes. You do not price work. You do not estimate quantities. You do not fill an empty field with a typical, reasonable or industry-standard figure. If the rep did not say a number, return null for it. A null is always a correct answer; a number nobody said is never a correct answer, even when it is obviously about right.

Rules:
1. Choose line items only from the catalogue, by id, exactly as spelled. If the rep mentions work that no catalogue id covers, put a short phrase in "unmatched" instead of forcing it onto a line that does not fit.
2. "qty" is how many units, in the unit the catalogue gives for that id. "price" is dollars for ONE unit. If the rep gave a lump sum for an item, put the lump sum in "price" and 1 in "qty".
3. If the rep says a price that clearly covers several items at once, put it on the item it best fits and leave the others' prices null. Do not split a figure across lines; you would be inventing the split.
4. List an item the rep asked for even when they gave no numbers for it. Nulls are expected.
5. "notes" is what the rep described seeing on the roof, written plainly for a homeowner to read. Use only what the rep said. Add no findings, no causes, no recommendations and no sales language of your own. No prices in the notes. If the rep described nothing, return an empty string.
6. Never return the customer's name, address, phone number or email anywhere in your answer, even if the rep says them.
7. If the rep names a shingle line and colour ("IKO Dynasty in Granite Black"), set "shingle" to the matching id. If they name a line but no colour, or a colour you cannot match exactly, leave it null — a colour the customer did not choose is as wrong as a price nobody said.
8. You are given everything the rep has said so far and the estimate as it stands. Return the COMPLETE updated estimate every time, not just what changed. Carry forward every line and figure that is still correct. When the rep corrects something, use the new value. When they say to take something off, leave it out. When they say nothing about a line, leave it exactly as it was.

The shingles you may name:
__SHINGLE_LIST__

The catalogue:
`;

export function buildDraftSystem(): string {
  return (
    DRAFT_SYSTEM_PROMPT.replace(
      "__SHINGLE_LIST__",
      SHINGLE_CHOICES.map((s) => `${s.id} | ${s.label}`).join("\n"),
    ) + buildCatalogue()
  );
}

/**
 * The conversation, as one message.
 *
 * Every turn re-derives the WHOLE estimate from the WHOLE conversation rather
 * than applying a patch. It costs a few more tokens and buys two things worth
 * far more: removing a line is expressible ("take the gutters off" simply
 * yields an estimate without them), and nothing accumulates silently across
 * turns, because there is no running state for an error to hide in.
 */
export function buildConversationPrompt(turns: string[], current: EstimateDraft | null): string {
  const said = turns
    .map((t, i) => `${i + 1}. ${t.trim()}`)
    .filter((t) => t.length > 3)
    .join("\n");

  const standing =
    current && (current.lines.length > 0 || current.notes)
      ? `\n\nThe estimate as it stands:\n${JSON.stringify(current, null, 1)}`
      : "\n\nThere is no estimate yet.";

  return `What the rep has said, oldest first:\n${said}${standing}\n\nReturn the complete estimate reflecting everything above.`;
}

/* ── Grounding: do these figures appear in what the rep said? ─────── */

const UNIT_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS_WORDS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fourty: 40, // dictation gets this wrong often enough to be worth catching
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/**
 * Every number a listener could reasonably hear in this transcript.
 *
 * Deliberately GENEROUS — it over-collects. A number wrongly judged "grounded"
 * costs nothing (the rep reads the line anyway); a correct price wrongly
 * flagged trains the rep to ignore the flag, which is worse than having none.
 */
export function numbersSpokenIn(transcript: string): Set<number> {
  const found = new Set<number>();
  const text = transcript.toLowerCase();

  // Digits as typed or dictated: 450, 1,250, 30.5
  for (const m of text.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = Number.parseFloat(m[0].replace(/,/g, ""));
    if (Number.isFinite(n)) found.add(n);
  }

  const words = text.split(/[^a-z]+/).filter(Boolean);

  // Standard spoken numbers: "four hundred and fifty", "forty five hundred".
  let current = 0;
  let total = 0;
  let open = false;
  const close = () => {
    if (open) found.add(total + current);
    current = 0;
    total = 0;
    open = false;
  };
  for (const w of words) {
    if (w in UNIT_WORDS) {
      current += UNIT_WORDS[w];
      open = true;
    } else if (w in TENS_WORDS) {
      current += TENS_WORDS[w];
      open = true;
    } else if (w === "hundred" && open) {
      current = (current || 1) * 100;
    } else if (w === "thousand" && open) {
      total += (current || 1) * 1000;
      current = 0;
    } else if (w === "and" && open) {
      // "four hundred and fifty" — keep the run open.
    } else {
      close();
    }
  }
  close();

  // How prices are actually said: "four fifty" = 450, "twelve fifty" = 1250.
  for (let i = 0; i < words.length - 1; i++) {
    const a = UNIT_WORDS[words[i]];
    const b = TENS_WORDS[words[i + 1]];
    if (a !== undefined && a > 0 && b !== undefined) found.add(a * 100 + b);
  }

  return found;
}

/** Is this figure traceable to something in the transcript? */
function grounded(value: number, spoken: Set<number>): boolean {
  if (spoken.has(value)) return true;
  // "four fifty a square" for a $450.00 price, or 30 for "30.0 squares".
  for (const n of spoken) if (Math.abs(n - value) < 0.001) return true;
  return false;
}

/* ── The guarantee ───────────────────────────────────────────────── */

function cleanNumber(raw: unknown, max: number): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw <= 0 || raw > max) return null;
  return raw;
}

/**
 * Whatever the model returned → something this app can safely render.
 *
 * Never throws. Anything unrecognisable becomes an empty draft, which the UI
 * shows as "nothing picked up" — the rep is no worse off than before they
 * spoke, which is the correct failure mode for a tool used in a driveway.
 */
export function validateDraft(raw: unknown, transcript = ""): EstimateDraft {
  const empty: EstimateDraft = {
    lines: [],
    squares: null,
    deposit: null,
    shingle: null,
    notes: "",
    unmatched: [],
  };
  if (!raw || typeof raw !== "object") return empty;

  const obj = raw as Record<string, unknown>;
  const spoken = numbersSpokenIn(transcript);

  const lines: DraftLine[] = [];
  const seen = new Set<string>();
  const unmatched: string[] = [];

  if (Array.isArray(obj.lines)) {
    for (const entry of obj.lines) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const id = typeof e.id === "string" ? e.id.trim() : "";

      // An id outside the catalogue is not silently dropped — the rep asked for
      // something, and losing it without a word is how a quote goes out missing
      // the work the customer actually wanted.
      if (!VALID_IDS.has(id)) {
        if (id && unmatched.length < MAX_UNMATCHED) unmatched.push(id);
        continue;
      }
      if (seen.has(id)) continue; // one transcript, one line per item
      seen.add(id);

      const qty = cleanNumber(e.qty, MAX_QTY);
      const price = cleanNumber(e.price, MAX_PRICE);

      // A quantity of 1 is exempt, and it has to be: rule 2 of the prompt
      // TELLS the model to use 1 for a lump sum ("gutter guards for twelve
      // fifty" — one of them, $1,250). Nobody says "one", so checking it
      // against the transcript marks a perfectly honest line. A flag that
      // cries wolf on correct lines is worse than no flag, because the rep
      // learns to scroll past it — and then misses the one that matters.
      const qtyWrong = qty !== null && qty !== 1 && !grounded(qty, spoken);
      const priceWrong = price !== null && !grounded(price, spoken);
      const unverified = qtyWrong || priceWrong;

      lines.push(unverified ? { id, qty, price, unverified } : { id, qty, price });
    }
  }

  if (Array.isArray(obj.unmatched)) {
    for (const u of obj.unmatched) {
      if (typeof u === "string" && u.trim() && unmatched.length < MAX_UNMATCHED) {
        unmatched.push(u.trim().slice(0, 120));
      }
    }
  }

  const squaresRaw = cleanNumber(obj.squares, MAX_QTY);
  const squares = squaresRaw !== null && grounded(squaresRaw, spoken) ? squaresRaw : null;

  // A deposit is money the customer is asked to hand over. If it cannot be
  // traced to something the rep said, it does not go on the estimate at all —
  // unlike a line price, there is no box for them to notice it in.
  const depositRaw = cleanNumber(obj.deposit, MAX_PRICE);
  const deposit = depositRaw !== null && grounded(depositRaw, spoken) ? depositRaw : null;

  // A shingle outside the catalogue is dropped, not corrected: a colour the
  // customer did not choose is as wrong as a price nobody said.
  const shingle =
    typeof obj.shingle === "string" && VALID_SHINGLES.has(obj.shingle) ? obj.shingle : null;

  const notes = typeof obj.notes === "string" ? obj.notes.trim().slice(0, MAX_NOTES) : "";

  return { lines, squares, deposit, shingle, notes, unmatched };
}
