import type { Db } from "./types";
import type { EnquiryInput } from "../lib/enquiry";
import { CONSENT_TEXT } from "../lib/enquiry";

export interface NewEnquiry {
  id: string;
  createdAt: string;
  input: EnquiryInput;
  tokenId: string;
  dedupeHash: string;
  ipHash: string;
}

/** Fixed-window counter shared through D1. Returns whether the request is within the limit. */
export async function hitRateLimit(db: Db, key: string, limit: number, windowSec: number, nowMs: number): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const windowStart = Math.floor(nowMs / 1000 / windowSec) * windowSec;
  const row = await db
    .prepare(
      "INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1) ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1 RETURNING count",
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  const count = row?.count ?? 1;
  return { allowed: count <= limit, retryAfterSec: Math.max(1, windowStart + windowSec - Math.floor(nowMs / 1000)) };
}

/** Housekeeping: drop counters older than two days. */
export async function pruneRateLimits(db: Db, nowMs: number): Promise<void> {
  await db.prepare("DELETE FROM rate_limits WHERE window_start < ?1").bind(Math.floor(nowMs / 1000) - 2 * 86400).run();
}

export async function findByToken(db: Db, tokenId: string): Promise<string | null> {
  const row = await db.prepare("SELECT id FROM enquiries WHERE token_id = ?1").bind(tokenId).first<{ id: string }>();
  return row?.id ?? null;
}

export async function findRecentDuplicate(db: Db, dedupeHash: string, sinceIso: string): Promise<string | null> {
  const row = await db
    .prepare("SELECT id FROM enquiries WHERE dedupe_hash = ?1 AND created_at > ?2 ORDER BY created_at DESC LIMIT 1")
    .bind(dedupeHash, sinceIso)
    .first<{ id: string }>();
  return row?.id ?? null;
}

export async function countSince(db: Db, sinceIso: string): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE created_at > ?1").bind(sinceIso).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function insertEnquiry(db: Db, e: NewEnquiry): Promise<void> {
  const i = e.input;
  await db
    .prepare(
      `INSERT INTO enquiries
        (id, created_at, full_name, email, phone, company, country, website, service, monthly_volume, language, platform,
         contact_method, requirements, consent, consent_text, consent_at, token_id, dedupe_hash, ip_hash)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 1, ?15, ?2, ?16, ?17, ?18)`,
    )
    .bind(
      e.id, e.createdAt, i.fullName, i.email, i.phone || null, i.company, i.country, i.website || null, i.service,
      i.monthlyVolume || null, i.language, i.platform || null, i.contactMethod, i.requirements, CONSENT_TEXT, e.tokenId,
      e.dedupeHash, e.ipHash,
    )
    .run();
}

export async function markNotified(db: Db, id: string): Promise<void> {
  await db.prepare("UPDATE enquiries SET notified = 1 WHERE id = ?1").bind(id).run();
}
