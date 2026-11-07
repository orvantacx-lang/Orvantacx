/** Small WebCrypto helpers (work in Cloudflare Workers and Node 20+). */
const enc = new TextEncoder();

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const toB64Url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function sha256Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

export async function hmacB64Url(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toB64Url(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Crockford base32: no I, L, O, U — easy to read aloud.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function randomBase32(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 32];
  return out;
}

/** Reference like OCX-20261107-7K2M9QXD (UTC date + 40 random bits). */
export function newEnquiryId(now: Date = new Date()): string {
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `OCX-${ymd}-${randomBase32(8)}`;
}
