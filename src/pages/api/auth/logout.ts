import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "~/lib/admin-session";
import { noStoreRedirect } from "~/lib/site-url";

export const prerender = false;

/** Clear the admin session and return to the homepage. */
export const GET: APIRoute = ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return noStoreRedirect("/");
};
