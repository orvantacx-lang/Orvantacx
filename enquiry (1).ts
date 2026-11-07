import { handleEnquiry } from "../../src/server/handler";
import type { Env } from "../../src/server/types";

// POST /api/enquiry — stores a contact enquiry in Cloudflare D1.
export const onRequestPost: PagesFunction<Env> = (ctx) =>
  handleEnquiry(ctx.request, ctx.env, { waitUntil: (p) => ctx.waitUntil(p) });

// Any other method.
export const onRequest: PagesFunction<Env> = () =>
  new Response(JSON.stringify({ ok: false, code: "method_not_allowed", message: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST", "Cache-Control": "no-store" },
  });
