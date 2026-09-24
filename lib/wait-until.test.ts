import { test } from "node:test";
import assert from "node:assert/strict";
import { vercelWaitUntil } from "./wait-until.ts";

const CONTEXT_KEY = Symbol.for("@vercel/request-context");
const g = globalThis as unknown as Record<symbol, unknown>;

test("hands the task to Vercel's request context when one is present", () => {
  const kept: Promise<unknown>[] = [];
  g[CONTEXT_KEY] = { get: () => ({ waitUntil: (task: Promise<unknown>) => { kept.push(task); } }) };
  try {
    const task = Promise.resolve("done");
    vercelWaitUntil(task);
    assert.equal(kept[0], task);
  } finally {
    delete g[CONTEXT_KEY];
  }
});

test("is a silent no-op outside Vercel (local dev, tests, other hosts)", () => {
  delete g[CONTEXT_KEY];
  assert.doesNotThrow(() => vercelWaitUntil(Promise.resolve()));
});
