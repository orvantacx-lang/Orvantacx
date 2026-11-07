import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { Db, DbStatement } from "../src/server/types";

const migration = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../migrations/0001_create_enquiries.sql"), "utf8");

/** In-memory SQLite database exposing the same small surface as a D1 binding, using the real migration. */
export function createTestDb(opts: { failInserts?: boolean } = {}): Db & { raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");
  raw.exec(migration);
  const statement = (sql: string, params: unknown[] = []): DbStatement => ({
    bind: (...values) => statement(sql, values),
    async run() {
      if (opts.failInserts && /^\s*INSERT INTO enquiries/i.test(sql)) throw new Error("simulated storage failure");
      return raw.prepare(sql).run(...(params as never[]));
    },
    async first<T>() {
      return ((raw.prepare(sql).get(...(params as never[])) as T | undefined) ?? null) as T | null;
    },
  });
  return { prepare: (sql: string) => statement(sql), raw };
}
