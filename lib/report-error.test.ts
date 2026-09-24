import { test } from "node:test";
import assert from "node:assert/strict";
import { createErrorReporter } from "./report-error.ts";

type Captured = { error: unknown; hint: { tags?: Record<string, string>; extra?: Record<string, unknown> } };

function harness() {
  const captured: Captured[] = [];
  const logged: unknown[][] = [];
  const report = createErrorReporter({
    capture: (error, hint) => { captured.push({ error, hint }); return "evt"; },
    log: (...args) => { logged.push(args); },
  });
  return { report, captured, logged };
}

test("logs to the console and captures an Error as-is, tagged with where", () => {
  const { report, captured, logged } = harness();
  const boom = new Error("Daily is down");
  report("sessions/create-room", boom, { sessionId: "s1" });
  assert.equal(logged.length, 1);
  assert.equal(logged[0][0], "[sessions/create-room]");
  assert.equal(logged[0][1], boom);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].error, boom);
  assert.deepEqual(captured[0].hint.tags, { where: "sessions/create-room" });
  assert.deepEqual(captured[0].hint.extra, { sessionId: "s1" });
});

test("wraps a non-Error value in an Error so Sentry gets a stack, keeping the raw value", () => {
  const { report, captured } = harness();
  const supabaseError = { message: "duplicate key", code: "23505" };
  report("waitlist/signup", supabaseError);
  const sent = captured[0].error;
  assert.ok(sent instanceof Error);
  assert.equal(sent.message, "waitlist/signup: duplicate key");
  assert.deepEqual(captured[0].hint.extra, { raw: supabaseError });
});

test("a string is wrapped with the string as the message", () => {
  const { report, captured } = harness();
  report("cancel", "0 rows updated");
  assert.ok(captured[0].error instanceof Error);
  assert.equal((captured[0].error as Error).message, "cancel: 0 rows updated");
});

test("never throws, even when capture itself throws", () => {
  const logged: unknown[][] = [];
  const report = createErrorReporter({
    capture: () => { throw new Error("transport exploded"); },
    log: (...args) => { logged.push(args); },
  });
  assert.doesNotThrow(() => report("x", new Error("original")));
  // the original error was still logged before capture ran
  assert.equal(logged[0][0], "[x]");
});
