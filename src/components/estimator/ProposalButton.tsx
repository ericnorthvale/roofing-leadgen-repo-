import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EstimateDraft } from "~/lib/estimate-draft";
import { missingFacts } from "~/lib/proposal-copy";
import type { ProposalPhoto } from "~/lib/proposal-pdf";

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
  /**
   * PREVIEW, SO THE PROPOSAL CAN BE DIALLED IN BY TALKING.
   *
   * Before this the only way to see the document was to download it, which
   * means a file per attempt in a phone's downloads folder and no way to
   * judge a change without leaving the page. Now the same bytes render in a
   * panel: talk, rebuild, look, repeat, and download once at the end.
   *
   * The blob URL is revoked when it is replaced or the panel closes —
   * otherwise every rebuild leaks a whole PDF for the life of the page.
   */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const builtFrom = useRef<string>("");
  const [note, setNote] = useState<string | null>(null);
  const [cover, setCover] = useState<ProposalPhoto | null>(null);
  const [extras, setExtras] = useState<ProposalPhoto[]>([]);
  const coverInput = useRef<HTMLInputElement>(null);
  const extraInput = useRef<HTMLInputElement>(null);
  const gaps = missingFacts();

  // The estimate changed since the open preview was rendered.
  const signature = JSON.stringify(props.draft) + JSON.stringify(props.customer);
  useEffect(() => {
    if (previewUrl && builtFrom.current !== signature) setStale(true);
  }, [signature, previewUrl]);

  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  /**
   * A phone camera file is 3–6 MB and 4000px wide. Embedded raw, four of them
   * make a 20 MB proposal that will not send as an email attachment — so each
   * is re-encoded down to something a printer still renders cleanly.
   */
  async function readPhoto(file: File): Promise<ProposalPhoto | null> {
    try {
      const bitmap = await createImageBitmap(file);
      const maxW = 1600;
      const scale = Math.min(1, maxW / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.82));
      if (!blob) return null;
      return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "jpg" };
    } catch {
      // HEIC from an iPhone that the browser cannot decode is the usual cause.
      return null;
    }
  }

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

  async function buildBytes(): Promise<Uint8Array | null> {
    const { image, credit } = cover ? { image: cover, credit: null } : await coverPhoto();
    const { buildProposalPdf } = await import("~/lib/proposal-pdf");
    return buildProposalPdf({
      customer: props.customer,
      draft: props.draft,
      coverImage: image,
      coverCredit: credit,
      photos: extras,
    });
  }

  async function preview() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const bytes = await buildBytes();
      if (!bytes) throw new Error("no bytes");
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
      builtFrom.current = signature;
      setStale(false);
    } catch {
      setNote("Couldn't build the proposal. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function download(withPhoto: boolean) {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      // A photo the rep chose always beats one we looked up.
      const { image, credit } = cover
        ? { image: cover, credit: null }
        : withPhoto
          ? await coverPhoto()
          : { image: null, credit: null };
      const { buildProposalPdf } = await import("~/lib/proposal-pdf");
      const bytes = await buildProposalPdf({
        customer: props.customer,
        draft: props.draft,
        coverImage: image,
        coverCredit: credit,
        photos: extras,
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
        setNote("No photo found for that address — add one with Cover photo, or send it as is.");
      }
    } catch {
      setNote("Couldn't build the proposal. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pickCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const photo = await readPhoto(file);
    setCover(photo);
    setNote(photo ? "Cover photo added." : "Couldn't read that image — try a JPG or PNG.");
  }

  async function addExtras(files: FileList | null) {
    if (!files?.length) return;
    const read = await Promise.all([...files].slice(0, 8).map(readPhoto));
    const ok = read.filter(Boolean) as ProposalPhoto[];
    setExtras((prev) => [...prev, ...ok].slice(0, 8));
    setNote(
      ok.length
        ? `${ok.length} photo${ok.length === 1 ? "" : "s"} added.`
        : "Couldn't read those images — try JPGs.",
    );
  }

  return (
    <div className="ml-auto text-right">
      <input
        ref={coverInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickCover(e.target.files)}
      />
      <input
        ref={extraInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addExtras(e.target.files)}
      />
      <div className="mb-1.5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className="text-[12px] font-semibold text-[color:var(--color-ink-500)] underline"
        >
          {cover ? "Cover photo ✓" : "Cover photo"}
        </button>
        <button
          type="button"
          onClick={() => extraInput.current?.click()}
          className="text-[12px] font-semibold text-[color:var(--color-ink-500)] underline"
        >
          {extras.length ? `Photos (${extras.length})` : "Add photos"}
        </button>
      </div>
      <button
        type="button"
        disabled={props.disabled || busy}
        onClick={preview}
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
      {/*
        PORTALLED TO THE BODY, and it has to be. This button lives inside the
        sticky total bar, which uses backdrop-blur — and a backdrop-filter
        creates a containing block, so `position: fixed` inside it resolves
        against that 70px bar instead of the viewport. The panel rendered as a
        sliver along the bottom of the screen with a zero-height iframe.
      */}
      {previewUrl &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-[color:var(--color-navy-900,#0e182f)]/95 text-left">
            <div className="flex items-center gap-3 px-4 py-3">
              <p className="m-0 flex-1 text-[14px] font-bold text-white">
                Proposal preview
                {stale && (
                  <span className="ml-2 text-[11px] font-semibold text-[color:var(--color-gold-600)]">
                    estimate changed since this was built
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={preview}
                disabled={busy}
                className={`rounded-lg px-3 py-2 text-[13px] font-bold disabled:opacity-40 ${
                  stale ? "bg-[color:var(--color-gold-600)] text-white" : "bg-white/15 text-white"
                }`}
              >
                {busy ? "Building…" : "Rebuild"}
              </button>
              <button
                type="button"
                onClick={() => download(true)}
                disabled={busy}
                className="rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-[color:var(--color-navy-900,#0e182f)] disabled:opacity-40"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return null;
                  });
                  setStale(false);
                }}
                aria-label="Close preview"
                className="rounded-lg px-3 py-2 text-[15px] font-bold text-white"
              >
                ✕
              </button>
            </div>
            <iframe src={previewUrl} title="Proposal preview" className="min-h-0 flex-1 bg-white" />
            {/* iOS Safari will not render a PDF in an iframe; this always works. */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-black/40 px-4 py-2 text-center text-[12px] text-white underline"
            >
              Not showing? Open it in a new tab
            </a>
          </div>,
          document.body,
        )}

      {gaps.length > 0 && (
        <p className="m-0 mt-1 max-w-[220px] text-[11px] text-[#8a5a00]">
          Office still to supply: {gaps.map((g) => g.split("—")[0].trim()).join(", ")}
        </p>
      )}
    </div>
  );
}
