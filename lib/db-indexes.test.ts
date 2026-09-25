import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

// Guards the indexes the app's queries and RLS policies depend on (Broome DB-1).
// Reads the migrations as text, so it runs without a database.
const dir = new URL("../supabase/migrations/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const sql = files
  .map((f) => readFileSync(new URL(f, dir), "utf8"))
  .join("\n")
  .replace(/--.*$/gm, "")
  .replace(/\s+/g, " ");

// A full (non-partial) index: a partial one, like time_extensions_one_pending
// (session_id) WHERE status = 'pending', serves only lookups that repeat its predicate.
function indexOn(table: string, column: string): RegExp {
  return new RegExp(
    `CREATE INDEX (IF NOT EXISTS )?\\w+ ON public\\.${table} (USING btree )?\\(${column}\\)(?! WHERE)`,
    "i",
  );
}

const COLUMNS: Array<[string, string]> = [
  ["sessions", "guest_id"], // RLS sessions_read_participant + guest dashboard filter
  ["sessions", "mentor_id"], // RLS sessions_read_participant + mentor agenda filter
  ["sessions", "starts_at"], // every session list is ordered by it
  ["profiles", "email"], // check-email and waitlist look profiles up by email
  ["session_types", "host_id"],
  ["social_links", "profile_id"],
  ["availability_blocks", "profile_id"],
  ["time_extensions", "session_id"],
];

for (const [table, column] of COLUMNS) {
  test(`${table}.${column} has a btree index`, () => {
    assert.match(sql, indexOn(table, column));
  });
}

test("profiles.email is unique regardless of letter case, empty strings aside", () => {
  // app/dashboard/layout.tsx creates a missing profile with email = '' when the
  // auth user has none; two such users must not collide.
  assert.match(
    sql,
    /CREATE UNIQUE INDEX (IF NOT EXISTS )?\w+ ON public\.profiles (USING btree )?\(lower\(email\)\) WHERE \(?email <> ''(::text)?\)?/i,
  );
});

test("no migration uses CREATE INDEX CONCURRENTLY (the Supabase CLI applies each file in a transaction)", () => {
  assert.doesNotMatch(sql, /CREATE (UNIQUE )?INDEX CONCURRENTLY/i);
});
