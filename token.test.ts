import { describe, expect, it } from "vitest";
import { issueToken, verifyToken, TOKEN_MIN_AGE_MS, TOKEN_MAX_AGE_MS } from "../src/server/token";

const SECRET = "test-secret-at-least-16-chars";
const T0 = 1_800_000_000_000;

describe("form tokens", () => {
  it("accepts a token within its valid age window", async () => {
    const t = await issueToken(SECRET, T0);
    const r = await verifyToken(SECRET, t, T0 + TOKEN_MIN_AGE_MS + 1000);
    expect(r.ok).toBe(true);
  });
  it("rejects too-fast, expired, tampered, wrong-secret and malformed tokens", async () => {
    const t = await issueToken(SECRET, T0);
    expect(await verifyToken(SECRET, t, T0 + 500)).toEqual({ ok: false, reason: "too_fast" });
    expect(await verifyToken(SECRET, t, T0 + TOKEN_MAX_AGE_MS + 1)).toEqual({ ok: false, reason: "expired" });
    expect((await verifyToken(SECRET, t.slice(0, -2) + "xx", T0 + 10_000)).ok).toBe(false);
    expect((await verifyToken("another-secret-value-here", t, T0 + 10_000)).ok).toBe(false);
    for (const bad of ["", "a.b", undefined, 42, "x".repeat(300)]) expect((await verifyToken(SECRET, bad, T0 + 10_000)).ok).toBe(false);
  });
  it("issues unique tokens", async () => {
    expect(await issueToken(SECRET, T0)).not.toBe(await issueToken(SECRET, T0));
  });
});
