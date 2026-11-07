import { beforeEach, describe, expect, it } from "vitest";
import { handleEnquiry, handleToken } from "../src/server/handler";
import { issueToken } from "../src/server/token";
import { createTestDb } from "./d1";
import { valid } from "./fixtures";
import type { Env } from "../src/server/types";

const SECRET = "test-secret-at-least-16-chars";
const NOW = 1_800_000_000_000;
const URL_ENQ = "https://site.example/api/enquiry";

async function post(body: unknown, env: Env, opts: Parameters<typeof handleEnquiry>[2] = {}, headers: Record<string, string> = {}) {
  const res = await handleEnquiry(
    new Request(URL_ENQ, { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.5", Origin: "https://site.example", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }),
    env, { now: () => NOW + 30_000, ...opts },
  );
  return { status: res.status, json: (await res.json()) as any };
}

let db: ReturnType<typeof createTestDb>;
let env: Env;
let token: string;
beforeEach(async () => {
  db = createTestDb();
  env = { FORM_SECRET: SECRET };
  token = await issueToken(SECRET, NOW);
});
const count = () => (db.raw.prepare("SELECT COUNT(*) n FROM enquiries").get() as { n: number }).n;
const payload = (over: Record<string, unknown> = {}) => ({ ...valid, token, nickname: "", ...over });

describe("POST /api/enquiry", () => {
  it("saves a valid enquiry and only then reports success", async () => {
    const r = await post(payload(), env, { db });
    expect(r.status).toBe(200);
    expect(r.json.ok).toBe(true);
    expect(r.json.id).toMatch(/^OCX-\d{8}-[0-9A-HJKMNP-TV-Z]{8}$/);
    expect(count()).toBe(1);
    const row = db.raw.prepare("SELECT * FROM enquiries").get() as Record<string, unknown>;
    expect(row.email).toBe("asha@example.com");
    expect(row.status).toBe("new");
    expect(row.ip_hash).toBeTruthy();
    expect(JSON.stringify(row)).not.toContain("203.0.113.5"); // raw IP is never stored
  });

  it("reports not configured (503) with the official email when the database or secret is missing", async () => {
    for (const e of [{ FORM_SECRET: SECRET }, { DB: db } as Env]) {
      const r = await post(payload(), e);
      expect(r.status).toBe(503);
      expect(r.json.ok).toBe(false);
      expect(r.json.code).toBe("not_configured");
      expect(r.json.message).toContain("orvantacx@gmail.com");
    }
    expect(count()).toBe(0);
  });

  it("never claims success when the database write fails", async () => {
    const failing = createTestDb({ failInserts: true });
    const r = await post(payload(), env, { db: failing });
    expect(r.status).toBe(502);
    expect(r.json.ok).toBe(false);
    expect(r.json.code).toBe("storage_failed");
    expect(r.json.message).toMatch(/not been sent/i);
    expect(r.json.id).toBeUndefined();
  });

  it("returns field errors for invalid input", async () => {
    const r = await post(payload({ email: "nope", requirements: "short" }), env, { db });
    expect(r.status).toBe(400);
    expect(r.json.errors.email).toBeTruthy();
    expect(r.json.errors.requirements).toBeTruthy();
    expect(count()).toBe(0);
  });

  it("rejects missing, forged, expired and too-fast tokens", async () => {
    expect((await post(payload({ token: undefined }), env, { db })).json.code).toBe("token_invalid");
    expect((await post(payload({ token: token.slice(0, -3) + "abc" }), env, { db })).json.code).toBe("token_invalid");
    const fresh = await issueToken(SECRET, NOW + 29_000);
    expect((await post(payload({ token: fresh }), env, { db })).json.code).toBe("token_too_fast");
    expect((await post(payload(), env, { db, now: () => NOW + 3 * 3600_000 })).json.code).toBe("token_expired");
    expect(count()).toBe(0);
  });

  it("rejects honeypot submissions without saving", async () => {
    const r = await post(payload({ nickname: "bot" }), env, { db });
    expect(r.status).toBe(400);
    expect(count()).toBe(0);
  });

  it("treats a repeated submission with the same token as one enquiry (idempotent)", async () => {
    const a = await post(payload(), env, { db });
    const b = await post(payload(), env, { db });
    expect(b.status).toBe(200);
    expect(b.json.id).toBe(a.json.id);
    expect(count()).toBe(1);
  });

  it("does not save the same enquiry twice with a new token", async () => {
    const a = await post(payload(), env, { db });
    const t2 = await issueToken(SECRET, NOW + 1000);
    const b = await post(payload({ token: t2 }), env, { db });
    expect(b.json.id).toBe(a.json.id);
    expect(count()).toBe(1);
  });

  it("rate limits repeated attempts from one address", async () => {
    let last = 200;
    for (let i = 0; i < 10; i++) {
      const t = await issueToken(SECRET, NOW + i);
      last = (await post(payload({ token: t, requirements: `Different requirement number ${i} for the rate limit test.` }), env, { db })).status;
    }
    expect(last).toBe(429);
    expect(count()).toBeLessThanOrEqual(8);
  });

  it("rejects foreign origins, malformed JSON and oversized bodies", async () => {
    expect((await post(payload(), env, { db }, { Origin: "https://evil.example" })).status).toBe(403);
    expect((await post("{not json", env, { db })).status).toBe(400);
    expect((await post(JSON.stringify({ x: "y".repeat(25_000) }), env, { db })).status).toBe(413);
    expect(count()).toBe(0);
  });

  it("enforces the daily cap", async () => {
    expect((await post(payload(), env, { db })).status).toBe(200);
    for (let i = 0; i < 2; i++) db.raw.prepare("INSERT INTO enquiries (id,created_at,full_name,email,company,country,service,language,contact_method,requirements,consent,consent_text,consent_at,token_id,dedupe_hash,ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?)").run(`x${i}`, new Date(NOW + 30_000).toISOString(), "n", "e@x.co", "c", "India", "Other", "English", "Email", "r".repeat(25), "c", "t", `tok${i}`, `h${i}`, "ip");
    const t2 = await issueToken(SECRET, NOW + 2000);
    const r2 = await post(payload({ token: t2, email: "other@example.com" }), { ...env, DAILY_ENQUIRY_LIMIT: "3" }, { db, now: () => NOW + 40_000 });
    expect(r2.status).toBe(429);
    expect(r2.json.code).toBe("daily_limit");
  });

  it("requires a Turnstile token when Turnstile is configured", async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({ success: false }))) as typeof fetch;
    const r = await post(payload({ turnstileToken: "bad" }), { ...env, TURNSTILE_SECRET_KEY: "s" }, { db, fetchImpl });
    expect(r.status).toBe(400);
    const okFetch = (async () => new Response(JSON.stringify({ success: true }))) as typeof fetch;
    const r2 = await post(payload({ turnstileToken: "good" }), { ...env, TURNSTILE_SECRET_KEY: "s" }, { db, fetchImpl: okFetch });
    expect(r2.status).toBe(200);
  });

  it("does not let a failing email provider affect the saved result", async () => {
    const calls: string[] = [];
    const fetchImpl = (async (url: string) => { calls.push(String(url)); return new Response("nope", { status: 500 }); }) as unknown as typeof fetch;
    const r = await post(payload(), { ...env, RESEND_API_KEY: "k", NOTIFY_TO_EMAIL: "a@b.co", NOTIFY_FROM_EMAIL: "n@b.co" }, { db, fetchImpl });
    expect(r.status).toBe(200);
    expect(calls.length).toBe(1);
    expect((db.raw.prepare("SELECT notified FROM enquiries").get() as { notified: number }).notified).toBe(0);
  });
});

describe("GET /api/enquiry-token", () => {
  it("issues a token when configured and 503 otherwise", async () => {
    const ok = await handleToken(new Request("https://site.example/api/enquiry-token"), env, { db });
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as any).token).toMatch(/\./);
    expect((await handleToken(new Request("https://site.example/api/enquiry-token"), {})).status).toBe(503);
  });
  it("is rate limited", async () => {
    let status = 200;
    for (let i = 0; i < 45; i++) status = (await handleToken(new Request("https://site.example/api/enquiry-token", { headers: { "CF-Connecting-IP": "198.51.100.9" } }), env, { db, now: () => NOW })).status;
    expect(status).toBe(429);
  });
});
