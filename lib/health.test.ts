import { test } from "node:test";
import assert from "node:assert/strict";
import { checkHealth } from "./health.ts";

const fixedNow = () => new Date("2026-09-24T12:00:00.000Z");

test("answers 200 with the round-trip latency when the ping resolves", async () => {
  let ticks = 0;
  const clock = [1000, 1042];
  const result = await checkHealth({
    ping: async () => {},
    report: () => {},
    now: fixedNow,
    elapsed: () => clock[ticks++],
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.supabase.ok, true);
  assert.equal(result.body.supabase.latencyMs, 42);
  assert.equal(result.body.checkedAt, "2026-09-24T12:00:00.000Z");
  assert.equal("reason" in result.body.supabase, false);
});

test("answers 503 with reason query_failed when the ping rejects", async () => {
  const result = await checkHealth({
    ping: async () => {
      throw new Error("relation \"profiles\" does not exist");
    },
    report: () => {},
    now: fixedNow,
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.supabase.ok, false);
  assert.equal(result.body.supabase.reason, "query_failed");
  // the raw message never reaches the body: it goes to the error reporter instead
  assert.equal(JSON.stringify(result.body).includes("relation"), false);
});

test("answers 503 with reason timeout when the ping outlives the budget", async () => {
  let settle: (() => void) | undefined;
  const result = await checkHealth({
    ping: () => new Promise<void>((resolve) => { settle = resolve; }),
    timeoutMs: 10,
    report: () => {},
    now: fixedNow,
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.supabase.reason, "timeout");
  settle?.();
});

test("a late success after the timeout does not change the verdict", async () => {
  let settle: (() => void) | undefined;
  const pending = checkHealth({
    ping: () => new Promise<void>((resolve) => { settle = resolve; }),
    timeoutMs: 10,
    report: () => {},
    now: fixedNow,
  });
  const result = await pending;
  settle?.();
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(result.status, 503);
  assert.equal(result.body.supabase.reason, "timeout");
});

test("hands the failure to the reporter with the health tag", async () => {
  const seen: unknown[] = [];
  const boom = new Error("connect ECONNREFUSED");
  await checkHealth({
    ping: async () => { throw boom; },
    now: fixedNow,
    report: (where, error) => { seen.push([where, error]); },
  });
  assert.deepEqual(seen, [["api/health", boom]]);
});

test("reports a timeout too, as an Error naming the budget", async () => {
  const seen: Array<[string, unknown]> = [];
  await checkHealth({
    ping: () => new Promise<void>(() => {}),
    timeoutMs: 10,
    now: fixedNow,
    report: (where, error) => { seen.push([where, error]); },
  });
  assert.equal(seen.length, 1);
  assert.equal(seen[0][0], "api/health");
  assert.ok(seen[0][1] instanceof Error);
  assert.match((seen[0][1] as Error).message, /10 ?ms/);
});

test("a ping that throws synchronously is a query failure, not a crash", async () => {
  const result = await checkHealth({
    ping: () => { throw new Error("env missing"); },
    report: () => {},
    now: fixedNow,
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.supabase.reason, "query_failed");
});

test("a ping that fails after the timeout is swallowed, not left as an unhandled rejection", async () => {
  const unhandled: unknown[] = [];
  const onUnhandled = (reason: unknown) => { unhandled.push(reason); };
  process.on("unhandledRejection", onUnhandled);
  try {
    let fail: ((e: Error) => void) | undefined;
    const result = await checkHealth({
      ping: () => new Promise<void>((_, reject) => { fail = reject; }),
      timeoutMs: 10,
      report: () => {},
      now: fixedNow,
    });
    assert.equal(result.body.supabase.reason, "timeout");
    fail?.(new Error("connection reset after the deadline"));
    await new Promise((r) => setTimeout(r, 10));
    assert.deepEqual(unhandled, []);
  } finally {
    process.off("unhandledRejection", onUnhandled);
  }
});
