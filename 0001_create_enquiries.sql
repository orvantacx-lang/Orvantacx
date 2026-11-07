-- ORVANTA CX — enquiry storage (Cloudflare D1 / SQLite)
-- Apply locally:  npm run db:migrate:local
-- Apply to D1:    npm run db:migrate:remote

CREATE TABLE IF NOT EXISTS enquiries (
  id              TEXT PRIMARY KEY,                       -- e.g. OCX-20261107-7K2M9QXD (shown to the visitor as a reference)
  created_at      TEXT NOT NULL,                          -- ISO 8601, UTC
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company         TEXT NOT NULL,
  country         TEXT NOT NULL,
  website         TEXT,
  service         TEXT NOT NULL,
  monthly_volume  TEXT,
  language        TEXT NOT NULL,
  platform        TEXT,                                   -- existing platform or telephony provider
  contact_method  TEXT NOT NULL,
  requirements    TEXT NOT NULL,
  consent         INTEGER NOT NULL CHECK (consent = 1),   -- an enquiry cannot be stored without consent
  consent_text    TEXT NOT NULL,                          -- the exact wording the visitor agreed to
  consent_at      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  token_id        TEXT NOT NULL UNIQUE,                   -- one saved enquiry per form session (idempotency)
  dedupe_hash     TEXT NOT NULL,                          -- hash of email + message, to catch repeat submissions
  ip_hash         TEXT,                                   -- salted hash only; the raw IP address is never stored
  notified        INTEGER NOT NULL DEFAULT 0              -- 1 once the optional email notification was sent
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_dedupe  ON enquiries (dedupe_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_status  ON enquiries (status, created_at);

-- Fixed-window request counters used for rate limiting (shared across all Cloudflare locations via D1).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT    NOT NULL,
  window_start INTEGER NOT NULL,                          -- unix seconds, start of the window
  count        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);
