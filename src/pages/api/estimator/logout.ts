import type { APIRoute } from "astro";
import { ESTIMATOR_COOKIE } from "~/lib/estimator-auth";

export const prerender = false;

/** Clear the estimator session — for a shared or lost phone. */
export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(ESTIMATOR_COOKIE, { path: "/" });
  return redirect("/estimator", 303);
};

export const GET = POST;
