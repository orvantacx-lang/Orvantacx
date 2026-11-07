/** Minimal structural types so the server logic can be unit-tested without Cloudflare's runtime. */
export interface DbStatement {
  bind(...values: unknown[]): DbStatement;
  run(): Promise<unknown>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}
export interface Db {
  prepare(sql: string): DbStatement;
}

export interface Env {
  /** D1 binding (see wrangler.toml). Missing ⇒ the enquiry form reports "not configured". */
  DB?: unknown;
  /** Secret used to sign form tokens and salt IP hashes. Missing ⇒ "not configured". */
  FORM_SECRET?: string;
  /** Optional Cloudflare Turnstile secret. When set, a valid Turnstile token is required. */
  TURNSTILE_SECRET_KEY?: string;
  /** Optional email notification via Resend. */
  RESEND_API_KEY?: string;
  NOTIFY_TO_EMAIL?: string;
  NOTIFY_FROM_EMAIL?: string;
  /** Optional comma-separated extra origins allowed to post (e.g. a preview domain). */
  ALLOWED_ORIGINS?: string;
  /** Optional safety cap on saved enquiries per day (default 300). */
  DAILY_ENQUIRY_LIMIT?: string;
}
