import { hmacB64Url, randomBase32, safeEqual } from "./crypto";

/**
 * Signed, time-stamped form token. Issued when the contact page loads; it proves a real page load,
 * shows how long the visitor spent on the form, and doubles as a one-time key for the submission.
 */
export const TOKEN_MIN_AGE_MS = 4_000;
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function issueToken(secret: string, now = Date.now()): Promise<string> {
  const payload = `${now.toString(36)}.${randomBase32(14)}`;
  return `${payload}.${await hmacB64Url(secret, payload)}`;
}

export type TokenCheck = { ok: true; id: string } | { ok: false; reason: "invalid" | "too_fast" | "expired" };

export async function verifyToken(secret: string, token: unknown, now = Date.now()): Promise<TokenCheck> {
  if (typeof token !== "string" || token.length > 200) return { ok: false, reason: "invalid" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [issued, nonce, mac] = parts;
  if (!safeEqual(mac, await hmacB64Url(secret, `${issued}.${nonce}`))) return { ok: false, reason: "invalid" };
  const issuedAt = parseInt(issued, 36);
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: "invalid" };
  const age = now - issuedAt;
  if (age < TOKEN_MIN_AGE_MS) return { ok: false, reason: "too_fast" };
  if (age > TOKEN_MAX_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true, id: nonce };
}
