import { MESSAGES, validateEnquiry } from "../lib/enquiry";
import { newEnquiryId, sha256Hex } from "./crypto";
import { sendNotification } from "./notify";
import { countSince, findByToken, findRecentDuplicate, hitRateLimit, insertEnquiry, markNotified, pruneRateLimits } from "./store";
import { issueToken, verifyToken } from "./token";
import { verifyTurnstile } from "./turnstile";
import type { Db, Env } from "./types";

export interface HandlerOptions {
  now?: () => number;
  waitUntil?: (p: Promise<unknown>) => void;
  fetchImpl?: typeof fetch;
  /** Test hook: use this database instead of env.DB. */
  db?: Db;
}

const MAX_BODY_BYTES = 20_000;
const POST_LIMIT = 8; //        submissions per IP per window
const TOKEN_LIMIT = 40; //      token requests per IP per window
const WINDOW_SEC = 15 * 60;
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

const fail = (status: number, code: string, message: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
  json({ ok: false, code, message, ...extra }, status, headers);

function getConfig(env: Env, opts: HandlerOptions): { db: Db; secret: string } | null {
  const db = opts.db ?? (env.DB as Db | undefined);
  const secret = (env.FORM_SECRET ?? "").trim();
  if (!db || secret.length < 16) return null;
  return { db, secret };
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ?? "unknown";
}

function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser clients send no Origin; the token, rate limit and validation still apply
  try {
    const host = new URL(origin).host;
    if (host === new URL(request.url).host) return true;
    return (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean).some((o) => {
      try { return new URL(o).host === host; } catch { return false; }
    });
  } catch {
    return false;
  }
}

/** GET /api/enquiry-token */
export async function handleToken(request: Request, env: Env, opts: HandlerOptions = {}): Promise<Response> {
  const cfg = getConfig(env, opts);
  if (!cfg) return fail(503, "not_configured", MESSAGES.unavailable);
  const now = opts.now?.() ?? Date.now();
  try {
    const ipHash = (await sha256Hex(`${cfg.secret}|${clientIp(request)}`)).slice(0, 32);
    const rl = await hitRateLimit(cfg.db, `tok:${ipHash}`, TOKEN_LIMIT, WINDOW_SEC, now);
    if (!rl.allowed) return fail(429, "rate_limited", MESSAGES.rateLimited, { retryAfterSec: rl.retryAfterSec }, { "Retry-After": String(rl.retryAfterSec) });
  } catch (err) {
    console.error("[enquiry-token] database error:", err instanceof Error ? err.message : "unknown");
    return fail(503, "not_configured", MESSAGES.unavailable);
  }
  return json({ ok: true, token: await issueToken(cfg.secret, now) });
}

/** POST /api/enquiry */
export async function handleEnquiry(request: Request, env: Env, opts: HandlerOptions = {}): Promise<Response> {
  const cfg = getConfig(env, opts);
  if (!cfg) return fail(503, "not_configured", MESSAGES.unavailable);
  const { db, secret } = cfg;
  const now = opts.now?.() ?? Date.now();
  const fetchImpl = opts.fetchImpl ?? fetch;

  if (!originAllowed(request, env)) return fail(403, "forbidden", "This request was not allowed.");

  // Read a bounded body.
  let raw: unknown;
  try {
    if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) return fail(413, "too_large", "Request too large.");
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return fail(413, "too_large", "Request too large.");
    raw = JSON.parse(text);
  } catch {
    return fail(400, "rejected", MESSAGES.rejected);
  }
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  try {
    const ip = clientIp(request);
    const ipHash = (await sha256Hex(`${secret}|${ip}`)).slice(0, 32);

    // 1. Rate limit (shared through D1).
    const rl = await hitRateLimit(db, `post:${ipHash}`, POST_LIMIT, WINDOW_SEC, now);
    if (!rl.allowed) {
      return fail(429, "rate_limited", MESSAGES.rateLimited, { retryAfterSec: rl.retryAfterSec }, { "Retry-After": String(rl.retryAfterSec) });
    }

    // 2. Honeypot: real visitors never see or fill this field.
    if (typeof body.nickname === "string" && body.nickname.trim() !== "") return fail(400, "rejected", MESSAGES.rejected);

    // 3. Server-side validation (authoritative).
    const result = validateEnquiry(body);
    if (!result.ok) return fail(400, "validation", "Please correct the highlighted fields and try again.", { errors: result.errors });
    const input = result.value;

    // 4. Optional Turnstile challenge.
    if (env.TURNSTILE_SECRET_KEY) {
      const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip, fetchImpl);
      if (!ok) return fail(400, "turnstile_failed", MESSAGES.rejected);
    }

    // 5. Signed form token: proves a page load, minimum fill time, and acts as an idempotency key.
    const tok = await verifyToken(secret, body.token, now);
    if (!tok.ok) {
      const message = tok.reason === "too_fast" ? MESSAGES.tooFast : MESSAGES.session;
      return fail(400, `token_${tok.reason}`, message);
    }

    // 6. Duplicate protection.
    const existingByToken = await findByToken(db, tok.id);
    if (existingByToken) return json({ ok: true, id: existingByToken, message: MESSAGES.success, duplicate: true });

    const dedupeHash = await sha256Hex(`${input.email}|${input.requirements.toLowerCase().replace(/\s+/g, " ")}`);
    const sinceIso = new Date(now - DEDUPE_WINDOW_MS).toISOString();
    const existingByContent = await findRecentDuplicate(db, dedupeHash, sinceIso);
    if (existingByContent) return json({ ok: true, id: existingByContent, message: MESSAGES.success, duplicate: true });

    // 7. Safety cap on total enquiries per day.
    const cap = Number(env.DAILY_ENQUIRY_LIMIT ?? 300) || 300;
    if ((await countSince(db, new Date(now - 24 * 3600_000).toISOString())) >= cap) {
      return fail(429, "daily_limit", MESSAGES.rateLimited);
    }

    // 8. Save. The visitor is told "received" ONLY after this write succeeds.
    const createdAt = new Date(now).toISOString();
    const id = newEnquiryId(new Date(now));
    try {
      await insertEnquiry(db, { id, createdAt, input, tokenId: tok.id, dedupeHash, ipHash });
    } catch (err) {
      // Two identical requests racing: the UNIQUE token constraint lets only one in; report the winner's reference.
      const winner = await findByToken(db, tok.id).catch(() => null);
      if (winner) return json({ ok: true, id: winner, message: MESSAGES.success, duplicate: true });
      throw err;
    }

    // 9. Optional notification (never affects the response).
    const notify = sendNotification(env, { id, fullName: input.fullName, company: input.company, service: input.service, country: input.country, receivedAt: createdAt }, fetchImpl)
      .then((sent) => (sent ? markNotified(db, id) : undefined))
      .catch(() => undefined);
    opts.waitUntil?.(notify);
    if (!opts.waitUntil) await notify;
    if (Math.random() < 0.02) opts.waitUntil?.(pruneRateLimits(db, now).catch(() => undefined));

    return json({ ok: true, id, message: MESSAGES.success });
  } catch (err) {
    console.error("[enquiry] save failed:", err instanceof Error ? err.message : "unknown error"); // no personal data in logs
    return fail(502, "storage_failed", MESSAGES.storageFailed);
  }
}

