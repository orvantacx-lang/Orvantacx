import { handleToken } from "../../src/server/handler";
import type { Env } from "../../src/server/types";

// GET /api/enquiry-token — issues a signed, time-stamped token for the contact form.
export const onRequestGet: PagesFunction<Env> = (ctx) => handleToken(ctx.request, ctx.env);

export const onRequest: PagesFunction<Env> = () =>
  new Response(JSON.stringify({ ok: false, code: "method_not_allowed", message: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "GET", "Cache-Control": "no-store" },
  });
