/**
 * The public origin of the current request.
 *
 * On Vercel's serverless runtime `request.url` is seen as `https://localhost/…`
 * (the function's internal address), NOT the public host the visitor used. The
 * real host arrives in the `x-forwarded-host` / `x-forwarded-proto` headers, so
 * we build the origin from those. This is what the Google OAuth redirect_uri
 * must be derived from — it has to match the address the browser is on, on both
 * the production domain and Vercel preview URLs.
 */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const first = (v: string | null) => v?.split(",")[0]?.trim() || undefined;
  const host =
    first(request.headers.get("x-forwarded-host")) ?? request.headers.get("host") ?? url.host;
  const proto =
    (first(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "")) || "https";
  return `${proto}://${host}`;
}
