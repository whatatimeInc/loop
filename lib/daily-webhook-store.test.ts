import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSupabaseWebhookStore,
  RELEASE_GRACE_MS,
  REQUEST_DEADLINE_MS,
  type WebhookStoreClient,
} from "./daily-webhook-store.ts";

// A stand-in for the postgrest query builder: every method chains, abortSignal
// records the signal the store chose, and awaiting the chain answers the way
// supabase-js does — a plain { data, error } object, an already-aborted signal
// becoming an error rather than a rejection.
type Query = { table: string; op: string; signal: AbortSignal | null; filters: unknown[][]; values?: unknown };
type Answer = { data?: unknown; error?: { message: string; code?: string } | null };

function fakeClient(answer: (q: Query) => Answer = () => ({})) {
  const queries: Query[] = [];
  const from = (table: string) => {
    const q: Query = { table, op: "", signal: null, filters: [] };
    queries.push(q);
    const chain: Record<string, unknown> = {};
    for (const op of ["select", "insert", "update", "delete"]) {
      chain[op] = (values?: unknown) => {
        if (!q.op) {
          q.op = op;
          q.values = values;
        }
        return chain;
      };
    }
    for (const f of ["eq", "is", "lt"]) chain[f] = (...args: unknown[]) => (q.filters.push([f, ...args]), chain);
    chain.maybeSingle = () => chain;
    chain.abortSignal = (signal: AbortSignal) => ((q.signal = signal), chain);
    chain.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => {
      const result = q.signal?.aborted
        ? { data: null, error: { message: "AbortError: This operation was aborted" } }
        : { data: null, error: null, ...answer(q) };
      return Promise.resolve(result).then(resolve, reject);
    };
    return chain;
  };
  return { client: { from } as unknown as WebhookStoreClient, queries };
}

function storeWith(
  client: WebhookStoreClient,
  budgets: { deadline: AbortSignal; wrapUp: AbortSignal },
  deleteRoom: (roomName: string, signal: AbortSignal) => Promise<void> = async () => {}
) {
  return createSupabaseWebhookStore({ client: () => client, deleteRoom, ...budgets });
}

const fired = () => AbortSignal.abort();
const open = () => AbortSignal.timeout(2_000);

test("the request deadline plus the release grace stay inside Daily's 8 s delivery window", () => {
  assert.ok(REQUEST_DEADLINE_MS + RELEASE_GRACE_MS < 8_000);
});

test("processing reads and writes are cut by the request deadline", async () => {
  const { client, queries } = fakeClient();
  const store = storeWith(client, { deadline: fired(), wrapUp: open() });
  await assert.rejects(() => store.getSession("s1"), /sessions read failed/);
  await assert.rejects(() => store.markEnded("s1", { endedAt: "2023-11-14T22:30:00.000Z", actualMinutes: 30 }), /sessions end update failed/);
  assert.ok(queries.length === 2 && queries.every((q) => q.signal?.aborted), "both queries carried the fired deadline");
});

test("completeEvent runs on the wrap-up budget, so a deadline spent on the room deletion still acknowledges the event", async () => {
  const { client, queries } = fakeClient((q) => (q.op === "update" ? { data: [{ id: "e1" }] } : {}));
  const store = storeWith(client, { deadline: fired(), wrapUp: open() });
  await store.completeEvent("e1");
  const update = queries.find((q) => q.op === "update");
  assert.ok(update, "the completion update ran");
  assert.equal(update.signal?.aborted, false, "the completion did not inherit the fired deadline");
  assert.ok("completed_at" in (update.values as Record<string, unknown>));
  assert.ok(update.filters.some((f) => f[0] === "eq" && f[1] === "owner"), "owner-scoped");
});

test("completeEvent that runs out of wrap-up budget still acknowledges a row already marked done", async () => {
  const { client, queries } = fakeClient((q) => (q.op === "select" ? { data: { completed_at: "2023-11-14T22:30:01.000Z" } } : {}));
  const store = storeWith(client, { deadline: fired(), wrapUp: fired() });
  await store.completeEvent("e1");
  const reread = queries.find((q) => q.op === "select");
  assert.ok(reread, "the confirming read ran");
  assert.equal(reread.signal?.aborted, false, "the confirming read had its own grace budget");
});

test("forgetEvent releases on its own grace budget after both the deadline and the wrap-up have fired", async () => {
  const { client, queries } = fakeClient();
  const store = storeWith(client, { deadline: fired(), wrapUp: fired() });
  await store.forgetEvent("e1");
  const del = queries.find((q) => q.op === "delete");
  assert.ok(del, "the release ran");
  assert.equal(del.signal?.aborted, false, "the release did not inherit a fired budget");
  assert.ok(del.filters.some((f) => f[0] === "is" && f[1] === "completed_at" && f[2] === null), "only an unfinished claim");
  assert.ok(del.filters.some((f) => f[0] === "eq" && f[1] === "owner"), "only this request's claim");
});

test("deleteRoom forwards the room name and the caller's signal to the injected deleter", async () => {
  const seen: unknown[] = [];
  const { client } = fakeClient();
  const signal = open();
  const store = storeWith(client, { deadline: open(), wrapUp: open() }, async (name, s) => void seen.push(name, s));
  await store.deleteRoom("looptalk-x", signal);
  assert.deepEqual(seen, ["looptalk-x", signal]);
});
