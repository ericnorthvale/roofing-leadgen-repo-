import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "~/lib/admin-session";

export const prerender = false;

/** Clear the admin session and return to the homepage. */
export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return redirect("/", 302);
};
