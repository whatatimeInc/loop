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

test("after a capture, the flush is scheduled through keepAlive so a freezing runtime waits for it", async () => {
  const kept: Promise<unknown>[] = [];
  let flushed = 0;
  const report = createErrorReporter({
    capture: () => "evt",
    log: () => {},
    flush: async () => { flushed += 1; },
    keepAlive: (task) => { kept.push(task); },
  });
  report("sessions/cancel", new Error("Daily delete failed"));
  assert.equal(flushed, 1);
  assert.equal(kept.length, 1);
  await kept[0];
});

test("a rejecting flush never surfaces: the kept promise resolves and the reporter does not throw", async () => {
  const kept: Promise<unknown>[] = [];
  const report = createErrorReporter({
    capture: () => "evt",
    log: () => {},
    flush: () => Promise.reject(new Error("transport gone")),
    keepAlive: (task) => { kept.push(task); },
  });
  assert.doesNotThrow(() => report("x", new Error("original")));
  await assert.doesNotReject(kept[0]);
});

test("a log function that throws never makes the reporter throw", () => {
  const captured: unknown[] = [];
  const reportError = createErrorReporter({
    capture: (error) => { captured.push(error); },
    log: () => { throw new Error("stdout is closed"); },
  });

  assert.doesNotThrow(() => reportError("api/health", new Error("boom")));
  assert.equal(captured.length, 1, "the capture still happens when logging fails");
});
