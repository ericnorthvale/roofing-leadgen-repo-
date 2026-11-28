import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "~/lib/google-maps";

/**
 * The property address, with Google's suggestions underneath it.
 *
 * WHY NOT GOOGLE'S OWN <gmp-place-autocomplete>, WHICH THE ROOF CALCULATOR
 * USES. That element keeps its real <input> inside a shadow root, so React
 * cannot see what is typed into it — only a *selected* suggestion fires an
 * event. On the calculator that is fine, because the page only ever cares
 * about a selection. Here it is a trap: a rep who types the whole address and
 * does not tap a suggestion leaves the field looking full while the app holds
 * an empty string, so Review & send stays dead with nothing on screen to say
 * why. That is the pre-hydration bug wearing a different hat, and this page
 * has had enough of those. So the input is an ordinary controlled one and the
 * suggestions hang below it, which also means it matches the other fields
 * rather than Google's styling.
 *
 * SUGGESTIONS ARE A BONUS, NEVER A DEPENDENCY. The box works fully before
 * Maps loads, if Maps never loads, and if Google refuses the request — the
 * list simply does not appear. That is not theoretical: the browser key is
 * referrer-locked to northvaleroofing.com, so on localhost every lookup comes
 * back PERMISSION_DENIED and the plain box is what you get. Suggestions can
 * therefore only be verified on a deployed domain.
 */

type Suggestion = { id: string; text: string };

const MIN_CHARS = 4;
const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 5;

export default function AddressField(props: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  name: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  // Google's places namespace once it is available; null while unavailable.
  const placesRef = useRef<Record<string, unknown> | null>(null);
  // One session token per lookup-then-pick cycle: Google bills a session, and
  // a fresh token per keystroke is billed as a fresh session each time.
  const tokenRef = useRef<unknown>(null);
  // Guards against a slow response for "118 Red" landing after "118 Red Cedar".
  const seqRef = useRef(0);
  const justPickedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(async (google) => {
        const places = (await google!.maps!.importLibrary!("places")) as Record<string, unknown>;
        if (!cancelled) placesRef.current = places;
      })
      .catch(() => {
        // Plain box. Nothing to tell the rep — there is nothing they can do.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const typed = props.value.trim();

    // Picking a suggestion sets the value; don't turn that into a new lookup.
    if (justPickedRef.current) {
      justPickedRef.current = false;
      return;
    }
    if (!placesRef.current || typed.length < MIN_CHARS) {
      setSuggestions([]);
      return;
    }

    const seq = ++seqRef.current;
    const timer = setTimeout(async () => {
      try {
        const places = placesRef.current as {
          AutocompleteSuggestion: {
            fetchAutocompleteSuggestions: (r: unknown) => Promise<{ suggestions: unknown[] }>;
          };
          AutocompleteSessionToken: new () => unknown;
        };
        if (!tokenRef.current) tokenRef.current = new places.AutocompleteSessionToken();

        const res = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: typed,
          includedRegionCodes: ["us"],
          sessionToken: tokenRef.current,
        });

        if (seq !== seqRef.current) return; // a newer keystroke already won

        const list: Suggestion[] = [];
        for (const s of res.suggestions ?? []) {
          const pred = (s as { placePrediction?: { text?: unknown } }).placePrediction;
          const text = pred?.text == null ? "" : String(pred.text);
          if (text) list.push({ id: `${list.length}-${text}`, text });
          if (list.length >= MAX_SUGGESTIONS) break;
        }
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
        // Denied, offline, out of quota — all the same to the rep: no list.
        setSuggestions([]);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [props.value]);

  function pick(text: string) {
    justPickedRef.current = true;
    tokenRef.current = null; // the session ends at the selection
    props.onChange(text);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <label className="relative block">
      <span className="text-[13px] font-semibold text-[color:var(--color-ink-700)]">
        {props.label}
      </span>
      <input
        type="text"
        name={props.name}
        value={props.value}
        autoComplete="street-address"
        onChange={(e) => props.onChange(e.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        // Delayed so a tap on a suggestion registers before the list closes.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="mt-1 w-full rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] px-3 py-2.5 text-[15px]"
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 list-none overflow-auto rounded-lg border border-[color:var(--color-ink-200,#e4e6e9)] bg-white p-0 shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id} className="m-0 p-0">
              <button
                type="button"
                // onMouseDown, not onClick: blur fires first on a click and
                // would close the list out from under the tap.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s.text);
                }}
                className="w-full px-3 py-3 text-left text-[14px] text-[color:var(--color-ink-700)] hover:bg-[color:var(--color-sand-50,#faf8f5)]"
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
