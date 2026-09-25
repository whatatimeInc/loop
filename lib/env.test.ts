import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnv, formatEnvProblems, REQUIRED_ENV_KEYS } from "./env.ts";

const VALID: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xxx",
  NEXT_PUBLIC_SITE_URL: "https://loop.example.com",
  SUPABASE_SECRET_KEY: "sb_secret_xxx",
  DAILY_CO_API_KEY: "daily-key",
  // What Daily gets at webhook registration: base64 of ≥16 random bytes.
  DAILY_WEBHOOK_SECRET: "c2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0LTMyYg==",
  LAUNCH_PHASE: "post",
};

function withOut(...keys: string[]) {
  const copy = { ...VALID };
  for (const k of keys) delete copy[k];
  return copy;
}

test("accepts a complete, valid configuration", () => {
  const result = validateEnv(VALID);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.env.LAUNCH_PHASE, "post");
  assert.equal(result.env.DAILY_CO_API_KEY, "daily-key");
  assert.equal(result.env.BASIC_AUTH_USER, undefined);
  assert.equal(result.env.BASIC_AUTH_PASS, undefined);
});

test("trims surrounding whitespace from values", () => {
  const result = validateEnv({ ...VALID, DAILY_CO_API_KEY: "  daily-key \n" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.env.DAILY_CO_API_KEY, "daily-key");
});

test("every required key, when absent, is reported by name", () => {
  for (const key of REQUIRED_ENV_KEYS) {
    const result = validateEnv(withOut(key));
    assert.equal(result.ok, false, `${key} absent should fail`);
    if (result.ok) continue;
    assert.deepEqual(
      result.problems.map((p) => p.key),
      [key],
      `${key} absent should be the only problem`
    );
    assert.equal(result.problems[0].reason, "missing");
  }
});

test("a blank or whitespace-only value counts as missing", () => {
  for (const blank of ["", "   ", "\n"]) {
    const result = validateEnv({ ...VALID, SUPABASE_SECRET_KEY: blank });
    assert.equal(result.ok, false);
    if (result.ok) continue;
    assert.deepEqual(result.problems.map((p) => p.key), ["SUPABASE_SECRET_KEY"]);
    assert.equal(result.problems[0].reason, "missing");
  }
});

test("several missing keys are all listed, sorted by name", () => {
  const result = validateEnv(withOut("SUPABASE_SECRET_KEY", "DAILY_CO_API_KEY", "DAILY_WEBHOOK_SECRET"));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(
    result.problems.map((p) => p.key),
    ["DAILY_CO_API_KEY", "DAILY_WEBHOOK_SECRET", "SUPABASE_SECRET_KEY"]
  );
});

test("an empty environment lists all seven required keys", () => {
  const result = validateEnv({});
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), [...REQUIRED_ENV_KEYS].sort());
});

test("URL keys must be absolute URLs", () => {
  for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SITE_URL"]) {
    const result = validateEnv({ ...VALID, [key]: "not a url" });
    assert.equal(result.ok, false, `${key} should reject a non-URL`);
    if (result.ok) continue;
    assert.deepEqual(result.problems.map((p) => p.key), [key]);
    assert.equal(result.problems[0].reason, "invalid");
    assert.match(result.problems[0].message, /URL/);
  }
});

test("LAUNCH_PHASE accepts only pre or post", () => {
  for (const bad of ["prod", "POST", "1"]) {
    const result = validateEnv({ ...VALID, LAUNCH_PHASE: bad });
    assert.equal(result.ok, false, `LAUNCH_PHASE=${bad} should fail`);
    if (result.ok) continue;
    assert.deepEqual(result.problems.map((p) => p.key), ["LAUNCH_PHASE"]);
    assert.equal(result.problems[0].reason, "invalid");
    assert.match(result.problems[0].message, /pre.*post/);
  }
  const pre = validateEnv({ ...VALID, LAUNCH_PHASE: "pre" });
  assert.equal(pre.ok, true);
  if (pre.ok) assert.equal(pre.env.LAUNCH_PHASE, "pre");
});

test("DAILY_WEBHOOK_SECRET must be base64 decoding to at least 16 bytes", () => {
  for (const bad of ["hook-secret", "not base64!", Buffer.from("too-short").toString("base64")]) {
    const result = validateEnv({ ...VALID, DAILY_WEBHOOK_SECRET: bad });
    assert.equal(result.ok, false, `DAILY_WEBHOOK_SECRET=${bad} should fail`);
    if (result.ok) continue;
    assert.deepEqual(result.problems.map((p) => p.key), ["DAILY_WEBHOOK_SECRET"]);
    assert.equal(result.problems[0].reason, "invalid");
    assert.match(result.problems[0].message, /base64/);
    assert.doesNotMatch(result.problems[0].message, new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("basic auth pair: both set is accepted and exposed", () => {
  const result = validateEnv({ ...VALID, BASIC_AUTH_USER: "loop", BASIC_AUTH_PASS: "s3cret" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.env.BASIC_AUTH_USER, "loop");
  assert.equal(result.env.BASIC_AUTH_PASS, "s3cret");
});

test("basic auth pair: only the user set reports the password as missing", () => {
  const result = validateEnv({ ...VALID, BASIC_AUTH_USER: "loop" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), ["BASIC_AUTH_PASS"]);
  assert.equal(result.problems[0].reason, "missing");
  assert.match(result.problems[0].message, /BASIC_AUTH_USER/);
});

test("basic auth pair: only the password set reports the user as missing", () => {
  const result = validateEnv({ ...VALID, BASIC_AUTH_PASS: "s3cret" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), ["BASIC_AUTH_USER"]);
  assert.match(result.problems[0].message, /BASIC_AUTH_PASS/);
});

test("basic auth pair: a blank partner counts as unset", () => {
  const result = validateEnv({ ...VALID, BASIC_AUTH_USER: "loop", BASIC_AUTH_PASS: "  " });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), ["BASIC_AUTH_PASS"]);
});

test("formatEnvProblems prints a fixed header and one line per key", () => {
  const result = validateEnv(withOut("DAILY_WEBHOOK_SECRET", "LAUNCH_PHASE"));
  assert.equal(result.ok, false);
  if (result.ok) return;
  const text = formatEnvProblems(result.problems);
  const lines = text.split("\n");
  assert.equal(lines[0], "Missing or invalid configuration:");
  assert.equal(lines.length, 3);
  assert.match(lines[1], /^  - DAILY_WEBHOOK_SECRET: /);
  assert.match(lines[2], /^  - LAUNCH_PHASE: /);
});

test("formatEnvProblems never echoes a value", () => {
  const result = validateEnv({ ...VALID, NEXT_PUBLIC_SITE_URL: "hunter2-not-a-url" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.doesNotMatch(formatEnvProblems(result.problems), /hunter2/);
});

test("the Sentry DSN is optional: unset and blank both pass and read as undefined", () => {
  for (const value of [undefined, "", "   "]) {
    const result = validateEnv({ ...VALID, NEXT_PUBLIC_SENTRY_DSN: value });
    assert.equal(result.ok, true, String(value));
    if (!result.ok) return;
    assert.equal(result.env.NEXT_PUBLIC_SENTRY_DSN, undefined);
  }
});

test("a Sentry DSN that is not an absolute URL is reported by name", () => {
  const result = validateEnv({ ...VALID, NEXT_PUBLIC_SENTRY_DSN: "not-a-dsn" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), ["NEXT_PUBLIC_SENTRY_DSN"]);
});

test("a valid Sentry DSN comes back trimmed", () => {
  const result = validateEnv({ ...VALID, NEXT_PUBLIC_SENTRY_DSN: " https://abc123@o1.ingest.sentry.io/42 \n" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.env.NEXT_PUBLIC_SENTRY_DSN, "https://abc123@o1.ingest.sentry.io/42");
});

test("ADMIN_EMAILS is optional and, when set, kept as written", () => {
  const unset = validateEnv(VALID);
  assert.equal(unset.ok, true);
  if (unset.ok) assert.equal(unset.env.ADMIN_EMAILS, undefined);
  const set = validateEnv({ ...VALID, ADMIN_EMAILS: "ops@loop.io, dev@loop.io" });
  assert.equal(set.ok, true);
  if (set.ok) assert.equal(set.env.ADMIN_EMAILS, "ops@loop.io, dev@loop.io");
});

test("ADMIN_EMAILS with an entry that is not an e-mail is refused without echoing it", () => {
  const result = validateEnv({ ...VALID, ADMIN_EMAILS: "ops@loop.io, not-an-email" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.problems.map((p) => p.key), ["ADMIN_EMAILS"]);
  assert.equal(result.problems[0].reason, "invalid");
  assert.match(result.problems[0].message, /comma-separated list of e-mails/);
  assert.doesNotMatch(result.problems[0].message, /not-an-email/);
});
