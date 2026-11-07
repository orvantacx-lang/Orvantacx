/** Optional Cloudflare Turnstile verification (free). Only used when TURNSTILE_SECRET_KEY is configured. */
export async function verifyTurnstile(secret: string, token: unknown, ip: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
