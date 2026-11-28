import { useState } from "react";
import type { EstimateDraft } from "~/lib/estimate-draft";
import { missingFacts } from "~/lib/proposal-copy";

/**
 * Turns the estimate into the document the customer keeps.
 *
 * THE COVER PHOTO FILLS ITSELF IN. /api/property-image already finds a
 * street-level shot of an address and falls back to an aerial, and it was
 * built picking sources that are licensed for print precisely because the
 * result goes in a PDF a homeowner keeps. So the rep gets a photo of the
 * house without doing anything, and can replace it with their own if the
 * street view is of next door's hedge.
 *
 * A MISSING PHOTO IS NEVER A FAILED DOWNLOAD. No image, no signal, a slow
 * lookup — the proposal builds without a cover photo rather than making a rep
 * stand in a driveway watching a spinner.
 *
 * THE BLANKS ARE SHOWN TO THE REP, NOT THE CUSTOMER. Anything the company has
 * not supplied (see missingFacts) is listed here on screen. It is never
 * printed: a homeowner should not read NEEDS DATA, and the rep seeing it is
 * what eventually gets it filled in.
 */
/**
 * HTTP headers are ISO-8859-1 by spec, so a UTF-8 credit line arrives mangled:
 * "©" (0xC2 0xA9) reads back as "Â©" and gets printed that way on the cover of
 * a document a customer keeps. Re-decode the bytes as UTF-8, and keep the
 * original if that does not produce something better.
 */
function decodeHeader(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded || raw;
  } catch {
    return raw; // already plain ASCII, or not UTF-8 after all
  }
}

export default function ProposalButton(props: {
  customer: { name: string; address: string; phone: string; email: string };
  draft: EstimateDraft;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const gaps = missingFacts();

  async function coverPhoto(): Promise<{
    image: { bytes: Uint8Array; type: "jpg" | "png" } | null;
    credit: string | null;
  }> {
    const address = props.customer.address.trim();
    if (!address) return { image: null, credit: null };
    try {
      // /api/property-image works in coordinates, not addresses, so the
      // address goes through the geocoder first — the same two-step the roof
      // calculator uses. Either step coming back empty just means no photo.
      const geo = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      if (!geo.ok) return { image: null, credit: null };
      const point = await geo.json().catch(() => null);
      if (!point?.available || typeof point.lat !== "number" || typeof point.lng !== "number") {
        return { image: null, credit: null };
      }

      const res = await fetch(`/api/property-image?lat=${point.lat}&lng=${point.lng}`);
      // 204 with no body is how it says "nothing for this address" — and 204
      // is a success status, so res.ok alone would wave it through.
      if (!res.ok || res.status === 204) return { image: null, credit: null };
      const type = res.headers.get("content-type") ?? "";
      if (type.includes("application/json")) return { image: null, credit: null };
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength < 1024) return { image: null, credit: null };
      return {
        image: { bytes, type: type.includes("png") ? "png" : "jpg" },
        credit: decodeHeader(res.headers.get("x-image-credit")),
      };
    } catch {
      return { image: null, credit: null };
    }
  }

  async function download(withPhoto: boolean) {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const { image, credit } = withPhoto ? await coverPhoto() : { image: null, credit: null };
      const { buildProposalPdf } = await import("~/lib/proposal-pdf");
      const bytes = await buildProposalPdf({
        customer: props.customer,
        draft: props.draft,
        coverImage: image,
        coverCredit: credit,
      });

      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const who = props.customer.name.trim().replace(/[^a-z0-9]+/gi, "-") || "proposal";
      a.href = url;
      a.download = `Northvale-proposal-${who}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoked late: Safari cancels the download if the URL dies too soon.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      if (withPhoto && !image) {
        setNote("No photo found for that address — the proposal is ready without one.");
      }
    } catch {
      setNote("Couldn't build the proposal. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ml-auto text-right">
      <button
        type="button"
        disabled={props.disabled || busy}
        onClick={() => download(true)}
        className="rounded-lg bg-[color:var(--color-gold-600)] px-5 py-3 text-[15px] font-bold text-white disabled:opacity-40"
      >
        {busy ? "Building…" : "Proposal"}
      </button>
      {note && (
        <p
          role="status"
          className="m-0 mt-1 max-w-[220px] text-[11px] text-[color:var(--color-ink-500)]"
        >
          {note}
        </p>
      )}
      {gaps.length > 0 && (
        <p className="m-0 mt-1 max-w-[220px] text-[11px] text-[#8a5a00]">
          Office still to supply: {gaps.map((g) => g.split("—")[0].trim()).join(", ")}
        </p>
      )}
    </div>
  );
}
