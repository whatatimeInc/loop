import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import {
  claimEvent,
  decodeWebhookSecret,
  signDailyWebhook,
  verifyDailyWebhookSignature,
  parseDailyWebhookEvent,
  sessionIdFromRoomName,
  handleDailyWebhook,
  readBodyBounded,
  BodyTooLargeError,
  type WebhookStore,
  type ClaimLedger,
  type WebhookSession,
} from "./daily-webhook.ts";

const SECRET_B64 = randomBytes(32).toString("base64");
const SECRET = Buffer.from(SECRET_B64, "base64");
const SESSION_ID = "0b6e2b1e-4c8a-4d2f-9a7e-3f2c1d5e6a7b";
const ROOM = `looptalk-${SESSION_ID}`;

function event(overrides: Record<string, unknown> = {}, payload: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: "1.0.0",
    type: "meeting.started",
    id: "met-sta-1111-1700000000",
    payload: { start_ts: 1700000000, meeting_id: "m-1", room: ROOM, ...payload },
    event_ts: 1700000001,
    ...overrides,
  });
}

/** What Daily does on its side, per its docs — independent of signDailyWebhook. */
function dailySign(body: string, ts: string, secretB64: string) {
  return createHmac("sha256", Buffer.from(secretB64, "base64")).update(`${ts}.${body}`).digest("base64");
}

function signed(body: string, ts = "1700000001") {
  return { rawBody: body, timestamp: ts, signature: dailySign(body, ts, SECRET_B64) };
}

// ---------- secret ----------

test("decodeWebhookSecret accepts a 32-byte base64 secret", () => {
  const key = decodeWebhookSecret(SECRET_B64);
  assert.ok(key);
  assert.equal(key.length, 32);
});

test("decodeWebhookSecret rejects undefined, blank, non-base64 and short values", () => {
  assert.equal(decodeWebhookSecret(undefined), null);
  assert.equal(decodeWebhookSecret(""), null);
  assert.equal(decodeWebhookSecret("   "), null);
  assert.equal(decodeWebhookSecret("hook-secret!"), null);
  assert.equal(decodeWebhookSecret(Buffer.from("short").toString("base64")), null);
});

// ---------- signature ----------

test("verifies a signature produced the way Daily documents it", () => {
  const body = event();
  const ts = "1700000001";
  assert.equal(
    verifyDailyWebhookSignature({ rawBody: body, timestamp: ts, signature: dailySign(body, ts, SECRET_B64), secret: SECRET }),
    true
  );
});

test("signDailyWebhook matches Daily's reference computation", () => {
  const body = event();
  assert.equal(signDailyWebhook(body, "42", SECRET), dailySign(body, "42", SECRET_B64));
});

test("rejects a body signed with a different secret", () => {
  const body = event();
  const other = randomBytes(32).toString("base64");
  assert.equal(
    verifyDailyWebhookSignature({ rawBody: body, timestamp: "1", signature: dailySign(body, "1", other), secret: SECRET }),
    false
  );
});

test("rejects when the body or the timestamp was altered after signing", () => {
  const body = event();
  const sig = dailySign(body, "1", SECRET_B64);
  assert.equal(verifyDailyWebhookSignature({ rawBody: body + " ", timestamp: "1", signature: sig, secret: SECRET }), false);
  assert.equal(verifyDailyWebhookSignature({ rawBody: body, timestamp: "2", signature: sig, secret: SECRET }), false);
});

test("rejects missing, empty, non-base64 or wrong-length signatures without throwing", () => {
  const body = event();
  for (const signature of [null, "", "not base64!", "AAAA", "x".repeat(44)]) {
    assert.equal(verifyDailyWebhookSignature({ rawBody: body, timestamp: "1", signature, secret: SECRET }), false, String(signature));
  }
  assert.equal(verifyDailyWebhookSignature({ rawBody: body, timestamp: null, signature: dailySign(body, "1", SECRET_B64), secret: SECRET }), false);
});

// ---------- parsing ----------

test("parses a meeting.ended event into id, type, room and timestamps", () => {
  const result = parseDailyWebhookEvent(event({ type: "meeting.ended", id: "met-end-1" }, { end_ts: 1700003600 }));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.event, {
    id: "met-end-1",
    type: "meeting.ended",
    room: ROOM,
    startTs: 1700000000,
    endTs: 1700003600,
  });
});

test("rejects bad JSON and bodies without id, type or payload.room", () => {
  for (const body of ["{", "[]", JSON.stringify({ type: "meeting.started", payload: { room: ROOM } }), event({ id: 7 }), event({}, { room: undefined })]) {
    const result = parseDailyWebhookEvent(body);
    assert.equal(result.ok, false, body);
  }
});

test("sessionIdFromRoomName accepts only looptalk-<uuid>", () => {
  assert.equal(sessionIdFromRoomName(ROOM), SESSION_ID);
  assert.equal(sessionIdFromRoomName("looptalk-"), null);
  assert.equal(sessionIdFromRoomName("looptalk-not-a-uuid"), null);
  assert.equal(sessionIdFromRoomName(`other-${SESSION_ID}`), null);
  assert.equal(sessionIdFromRoomName(`looptalk-${SESSION_ID}/x`), null);
});

// ---------- handler ----------

type Call = [string, ...unknown[]];

function fakeStore(
  session: WebhookSession | null,
  opts: {
    done?: string[];
    inFlight?: string[];
    markEndedThrows?: boolean | "once";
    deleteRoomThrows?: boolean;
    forgetEventThrows?: boolean;
    completeEventThrows?: boolean;
    deleteRoomHangs?: boolean;
    recordEventThrows?: boolean;
    /**
     * Models the real store's contract: processing calls fail once the request
     * deadline has fired, while completeEvent and forgetEvent keep working on
     * budgets of their own.
     */
    deadline?: AbortSignal;
  } = {}
) {
  const calls: Call[] = [];
  const pastDeadline = () => {
    if (opts.deadline?.aborted) throw new Error("aborted by the request deadline");
  };
  const claims = new Map<string, "processing" | "done">();
  for (const id of opts.done ?? []) claims.set(id, "done");
  for (const id of opts.inFlight ?? []) claims.set(id, "processing");
  let endedThrows = opts.markEndedThrows ?? false;
  const store: WebhookStore = {
    async recordEvent(id, type, room) {
      calls.push(["recordEvent", id, type, room]);
      pastDeadline();
      if (opts.recordEventThrows) throw new Error("ledger unreachable");
      const state = claims.get(id);
      if (state === "done") return "duplicate";
      if (state === "processing") return "processing";
      claims.set(id, "processing");
      return "new";
    },
    async completeEvent(id) {
      calls.push(["completeEvent", id]);
      if (opts.completeEventThrows) throw new Error("complete failed");
      claims.set(id, "done");
    },
    async forgetEvent(id) {
      calls.push(["forgetEvent", id]);
      if (opts.forgetEventThrows) throw new Error("release failed");
      claims.delete(id);
    },
    async getSession(id) {
      calls.push(["getSession", id]);
      pastDeadline();
      return session;
    },
    async markStarted(id, startedAt) {
      calls.push(["markStarted", id, startedAt]);
      pastDeadline();
    },
    async markEnded(id, patch) {
      calls.push(["markEnded", id, patch]);
      pastDeadline();
      if (endedThrows) {
        if (endedThrows === "once") endedThrows = false;
        throw new Error("db down");
      }
      return session?.status === "agendada";
    },
    async deleteRoom(roomName, signal) {
      calls.push(["deleteRoom", roomName]);
      if (opts.deleteRoomThrows) throw new Error("daily down");
      if (opts.deleteRoomHangs) {
        await new Promise((_, reject) => signal?.addEventListener("abort", () => reject(signal.reason)));
      }
    },
  };
  return { store, calls, claims };
}

const SCHEDULED: WebhookSession = { status: "agendada", session_started_at: null, duration: 50, daily_room_name: ROOM };

test("answers 503 when the secret is not configured, before reading headers or the store", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(signed(event()), null, store);
  assert.equal(res.status, 503);
  assert.deepEqual(res.body, { error: "Webhook secret not configured" });
  assert.deepEqual(calls, []);
});

test("answers 401 to a forged body and touches nothing", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const body = event();
  const res = await handleDailyWebhook({ rawBody: body, timestamp: "1", signature: dailySign(body, "1", randomBytes(32).toString("base64")) }, SECRET, store);
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: "Invalid signature" });
  assert.deepEqual(calls, []);
});

test("answers 401 when the signature headers are absent", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook({ rawBody: event(), timestamp: null, signature: null }, SECRET, store);
  assert.equal(res.status, 401);
  assert.deepEqual(calls, []);
});

test("answers 400 to a correctly signed body that is not a Daily event, without recording it", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(signed('{"hello":"world"}'), SECRET, store);
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: "Invalid event" });
  assert.deepEqual(calls, []);
});

test("answers 200 to Daily's signed registration probe without recording it", async () => {
  // Daily POSTs {"test":"test"} before it will create a webhook and never
  // retries; the endpoint has to answer 200 to it or the registration fails.
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(signed('{"test":"test"}'), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, probe: true });
  assert.deepEqual(calls, []);
});

test("an unsigned registration probe is still refused", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook({ rawBody: '{"test":"test"}', signature: null, timestamp: null }, SECRET, store);
  assert.equal(res.status, 401);
  assert.deepEqual(calls, []);
});

test("a signed body that merely contains a test key is not the probe", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(signed('{"test":"test","id":"x"}'), SECRET, store);
  assert.equal(res.status, 400);
  assert.deepEqual(calls, []);
});

test("meeting.started sets session_started_at from start_ts when still null", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(signed(event()), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.deepEqual(calls, [
    ["recordEvent", "met-sta-1111-1700000000", "meeting.started", ROOM],
    ["getSession", SESSION_ID],
    ["markStarted", SESSION_ID, "2023-11-14T22:13:20.000Z"],
    ["completeEvent", "met-sta-1111-1700000000"],
  ]);
});

test("meeting.started without start_ts starts the session at the current time", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const body = JSON.stringify({ type: "meeting.started", id: "s-now", payload: { room: ROOM } });
  const fixedNow = () => new Date("2024-01-01T10:00:00.000Z");
  const res = await handleDailyWebhook(signed(body), SECRET, store, { now: fixedNow });
  assert.equal(res.status, 200);
  assert.deepEqual(calls.find((c) => c[0] === "markStarted"), ["markStarted", SESSION_ID, "2024-01-01T10:00:00.000Z"]);
});

test("meeting.started leaves an already-set session_started_at alone", async () => {
  const { store, calls } = fakeStore({ ...SCHEDULED, session_started_at: "2023-11-14T22:00:00.000Z" });
  const res = await handleDailyWebhook(signed(event()), SECRET, store);
  assert.equal(res.status, 200);
  assert.ok(!calls.some((c) => c[0] === "markStarted"));
});

test("a genuine event re-sent with the same id is acknowledged but processed only once", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const input = signed(event());
  const first = await handleDailyWebhook(input, SECRET, store);
  const second = await handleDailyWebhook(input, SECRET, store);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.deepEqual(second.body, { ok: true, duplicate: true });
  assert.equal(calls.filter((c) => c[0] === "markStarted").length, 1);
  assert.equal(calls.filter((c) => c[0] === "recordEvent").length, 2);
});

test("meeting.ended completes a scheduled session and deletes the room", async () => {
  const { store, calls } = fakeStore({ ...SCHEDULED, session_started_at: "2023-11-14T22:13:20.000Z" });
  const body = event({ type: "meeting.ended", id: "met-end-1" }, { end_ts: 1700003000 });
  const res = await handleDailyWebhook(signed(body), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, roomDeleted: true });
  assert.deepEqual(calls.slice(1), [
    ["getSession", SESSION_ID],
    ["markEnded", SESSION_ID, { endedAt: "2023-11-14T23:03:20.000Z", actualMinutes: 50 }],
    ["deleteRoom", ROOM],
    ["completeEvent", "met-end-1"],
  ]);
});

test("meeting.ended falls back to the payload start_ts, then the booked duration, for the actual minutes", async () => {
  const noStart = fakeStore(SCHEDULED);
  await handleDailyWebhook(signed(event({ type: "meeting.ended", id: "e1" }, { end_ts: 1700001800 })), SECRET, noStart.store);
  const ended = noStart.calls.find((c) => c[0] === "markEnded");
  assert.deepEqual(ended?.[2], { endedAt: "2023-11-14T22:43:20.000Z", actualMinutes: 30 });

  const noTs = fakeStore(SCHEDULED);
  const bodyNoStart = JSON.stringify({ type: "meeting.ended", id: "e2", payload: { room: ROOM, end_ts: 1700001800 } });
  await handleDailyWebhook(signed(bodyNoStart), SECRET, noTs.store);
  const ended2 = noTs.calls.find((c) => c[0] === "markEnded");
  assert.deepEqual(ended2?.[2], { endedAt: "2023-11-14T22:43:20.000Z", actualMinutes: 50 });
});

test("meeting.ended on a cancelled session still deletes the room but does not complete it", async () => {
  const { store, calls } = fakeStore({ ...SCHEDULED, status: "cancelada" });
  const res = await handleDailyWebhook(signed(event({ type: "meeting.ended", id: "e3" }, { end_ts: 1700001800 })), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, roomDeleted: true });
  assert.ok(!calls.some((c) => c[0] === "markEnded"));
  assert.ok(calls.some((c) => c[0] === "deleteRoom"));
});

test("a room deletion failure is reported but does not fail the webhook", async () => {
  const { store } = fakeStore(SCHEDULED, { deleteRoomThrows: true });
  const res = await handleDailyWebhook(signed(event({ type: "meeting.ended", id: "e4" }, { end_ts: 1700001800 })), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, roomDeleted: false });
});

test("when processing throws after the claim, the claim is released and the error propagates", async () => {
  const { store, calls } = fakeStore(SCHEDULED, { markEndedThrows: true });
  const input = signed(event({ type: "meeting.ended", id: "e5" }, { end_ts: 1700001800 }));
  await assert.rejects(() => handleDailyWebhook(input, SECRET, store), /db down/);
  assert.deepEqual(calls.at(-1), ["forgetEvent", "e5"]);
  assert.ok(!calls.some((c) => c[0] === "completeEvent"));
});

test("a redelivery after a failed attempt is processed for real", async () => {
  const { store, calls } = fakeStore(SCHEDULED, { markEndedThrows: "once" });
  const input = signed(event({ type: "meeting.ended", id: "e6" }, { end_ts: 1700001800 }));
  await assert.rejects(() => handleDailyWebhook(input, SECRET, store), /db down/);
  const retry = await handleDailyWebhook(input, SECRET, store);
  assert.equal(retry.status, 200);
  assert.deepEqual(retry.body, { ok: true, roomDeleted: true });
  assert.equal(calls.filter((c) => c[0] === "markEnded").length, 2);
  assert.deepEqual(calls.at(-1), ["completeEvent", "e6"]);
});

test("a redelivery while the first attempt is still in flight is refused with 409 and touches nothing", async () => {
  const { store, calls } = fakeStore(SCHEDULED, { inFlight: ["e7"] });
  const res = await handleDailyWebhook(signed(event({ type: "meeting.ended", id: "e7" }, { end_ts: 1700001800 })), SECRET, store);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, { error: "Event still being processed" });
  assert.deepEqual(calls.map((c) => c[0]), ["recordEvent"]);
});

test("unknown room, unknown session and other event types are acknowledged without changes", async () => {
  const foreign = fakeStore(SCHEDULED);
  const r1 = await handleDailyWebhook(signed(event({ id: "x1" }, { room: "someone-elses-room" })), SECRET, foreign.store);
  assert.deepEqual([r1.status, r1.body], [200, { ok: true }]);
  // Nothing to do, nothing to make idempotent: no ledger row is taken.
  assert.deepEqual(foreign.calls, []);

  const missing = fakeStore(null);
  const r2 = await handleDailyWebhook(signed(event({ id: "x2" })), SECRET, missing.store);
  assert.deepEqual([r2.status, r2.body], [200, { ok: true }]);
  assert.deepEqual(missing.calls.map((c) => c[0]), ["recordEvent", "getSession", "completeEvent"]);

  const other = fakeStore(SCHEDULED);
  const r3 = await handleDailyWebhook(signed(event({ id: "x3", type: "participant.joined" })), SECRET, other.store);
  assert.deepEqual([r3.status, r3.body], [200, { ok: true }]);
  assert.deepEqual(other.calls, []);
});

test("a failed release after a failed write surfaces both errors", async () => {
  const { store } = fakeStore(SCHEDULED, { markEndedThrows: true, forgetEventThrows: true });
  const input = signed(event({ type: "meeting.ended", id: "e8" }, { end_ts: 1700001800 }));
  await assert.rejects(
    () => handleDailyWebhook(input, SECRET, store),
    (error: unknown) =>
      error instanceof AggregateError &&
      error.errors.map((e) => (e as Error).message).join("|") === "db down|release failed"
  );
});

// --- claimEvent: the ledger protocol behind recordEvent, over three primitives ---

type LedgerRow = { completedAt: string | null; receivedAt: string };

function fakeLedger(rows: Record<string, LedgerRow> = {}, opts: { vanishAfterConflict?: number } = {}) {
  const ops: string[] = [];
  let vanish = opts.vanishAfterConflict ?? 0;
  const ledger: ClaimLedger = {
    async insert(id) {
      ops.push(`insert:${id}`);
      if (rows[id]) {
        // Simulate the holder releasing the row right after this conflict.
        if (vanish > 0) {
          vanish -= 1;
          delete rows[id];
        }
        return "conflict";
      }
      rows[id] = { completedAt: null, receivedAt: "2024-01-01T10:00:00.000Z" };
      return "inserted";
    },
    async takeoverStale(id, cutoff) {
      ops.push(`takeover:${id}:${cutoff}`);
      const row = rows[id];
      if (!row || row.completedAt !== null || row.receivedAt >= cutoff) return false;
      row.receivedAt = "2024-01-01T10:00:00.000Z";
      return true;
    },
    async read(id) {
      ops.push(`read:${id}`);
      return rows[id] ?? null;
    },
  };
  return { ledger, ops, rows };
}

const CLAIM_OPTS = { staleMs: 30_000, now: () => new Date("2024-01-01T10:00:00.000Z") };
const ev = (id: string) => ({ id, type: "meeting.ended", room: ROOM });

test("claimEvent: an unseen id is inserted and owned", async () => {
  const { ledger, ops } = fakeLedger();
  assert.equal(await claimEvent(ledger, ev("c1"), CLAIM_OPTS), "new");
  assert.deepEqual(ops, ["insert:c1"]);
});

test("claimEvent: a completed id is a duplicate", async () => {
  const { ledger } = fakeLedger({ c2: { completedAt: "2024-01-01T09:00:00.000Z", receivedAt: "2024-01-01T08:59:00.000Z" } });
  assert.equal(await claimEvent(ledger, ev("c2"), CLAIM_OPTS), "duplicate");
});

test("claimEvent: a fresh incomplete claim is still processing", async () => {
  const { ledger } = fakeLedger({ c3: { completedAt: null, receivedAt: "2024-01-01T09:59:50.000Z" } });
  assert.equal(await claimEvent(ledger, ev("c3"), CLAIM_OPTS), "processing");
});

test("claimEvent: an incomplete claim older than the stale window is taken over", async () => {
  const { ledger, ops } = fakeLedger({ c4: { completedAt: null, receivedAt: "2024-01-01T09:59:00.000Z" } });
  assert.equal(await claimEvent(ledger, ev("c4"), CLAIM_OPTS), "new");
  assert.deepEqual(ops, ["insert:c4", "takeover:c4:2024-01-01T09:59:30.000Z"]);
});

test("claimEvent: a row released right after the conflict is claimed on a second insert", async () => {
  const { ledger, ops } = fakeLedger({ c5: { completedAt: null, receivedAt: "2024-01-01T09:59:59.000Z" } }, { vanishAfterConflict: 1 });
  assert.equal(await claimEvent(ledger, ev("c5"), CLAIM_OPTS), "new");
  assert.deepEqual(ops, ["insert:c5", "takeover:c5:2024-01-01T09:59:30.000Z", "read:c5", "insert:c5"]);
});

test("claimEvent: a row that keeps vanishing is reported as processing, not looped forever", async () => {
  const ops: string[] = [];
  const ledger: ClaimLedger = {
    async insert(id) {
      ops.push(`insert:${id}`);
      return "conflict";
    },
    async takeoverStale() {
      return false;
    },
    async read() {
      return null;
    },
  };
  assert.equal(await claimEvent(ledger, ev("c6"), CLAIM_OPTS), "processing");
  assert.equal(ops.length, 2);
});

test("parseDailyWebhookEvent treats null timestamps as absent", () => {
  const parsed = parseDailyWebhookEvent(
    JSON.stringify({ type: "meeting.ended", id: "n1", payload: { room: ROOM, start_ts: null, end_ts: null } })
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.event.startTs, undefined);
  assert.equal(parsed.event.endTs, undefined);
});

test("meeting.started on a session that is no longer scheduled is acknowledged without changes", async () => {
  const concluded: WebhookSession = { ...SCHEDULED, status: "concluída" };
  const { store, calls } = fakeStore(concluded);
  const res = await handleDailyWebhook(signed(event({ type: "meeting.started", id: "s2" }, { start_ts: 1700000000 })), SECRET, store);
  assert.equal(res.status, 200);
  assert.deepEqual(calls.map((c) => c[0]), ["recordEvent", "getSession", "completeEvent"]);
});

test("a failure to complete the claim releases it so the retry runs again", async () => {
  const { store, calls } = fakeStore(SCHEDULED, { completeEventThrows: true });
  const input = signed(event({ type: "meeting.ended", id: "e9" }, { end_ts: 1700001800 }));
  await assert.rejects(() => handleDailyWebhook(input, SECRET, store), /complete failed/);
  assert.deepEqual(calls.at(-1), ["forgetEvent", "e9"]);
});

test("sessionIdFromRoomName accepts an uppercase uuid and normalises it", () => {
  assert.equal(sessionIdFromRoomName(`looptalk-${SESSION_ID.toUpperCase()}`), SESSION_ID);
});

test("a room deletion that hangs is abandoned after the timeout and the event is still acknowledged", async () => {
  const { store, calls } = fakeStore(SCHEDULED, { deleteRoomHangs: true });
  const input = signed(event({ type: "meeting.ended", id: "e-hang" }, { end_ts: 1700001800 }));
  const res = await handleDailyWebhook(input, SECRET, store, { deleteRoomTimeoutMs: 20 });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, roomDeleted: false });
  assert.deepEqual(calls.at(-1), ["completeEvent", "e-hang"]);
});

test("meeting.ended with an end before the start stores zero minutes, never a negative duration", async () => {
  const { store, calls } = fakeStore(SCHEDULED);
  const res = await handleDailyWebhook(
    signed(event({ type: "meeting.ended", id: "e-neg" }, { end_ts: 1699999820 })),
    SECRET,
    store
  );
  assert.equal(res.status, 200);
  const ended = calls.find((c) => c[0] === "markEnded");
  assert.deepEqual(ended?.[2], { endedAt: "2023-11-14T22:10:20.000Z", actualMinutes: 0 });
});

test("a timestamp Date cannot represent is an invalid event, not a claimed one", async () => {
  for (const body of [
    JSON.stringify({ type: "meeting.started", id: "e-huge", payload: { room: ROOM, start_ts: 1e20 } }),
    JSON.stringify({ type: "meeting.ended", id: "e-neg-ts", payload: { room: ROOM, start_ts: 1700000000, end_ts: -5 } }),
  ]) {
    const { store, calls } = fakeStore(SCHEDULED);
    const res = await handleDailyWebhook(signed(body), SECRET, store);
    assert.equal(res.status, 400, body);
    assert.deepEqual(calls, [], body);
  }
});

test("a room deletion that fails or times out is logged with the room name", async () => {
  for (const opts of [{ deleteRoomThrows: true }, { deleteRoomHangs: true }]) {
    const { store } = fakeStore(SCHEDULED, opts);
    const logged: unknown[][] = [];
    const res = await handleDailyWebhook(
      signed(event({ type: "meeting.ended", id: "e-log" }, { end_ts: 1700001800 })),
      SECRET,
      store,
      { deleteRoomTimeoutMs: 20, log: (...args: unknown[]) => logged.push(args) }
    );
    assert.deepEqual([res.status, res.body], [200, { ok: true, roomDeleted: false }], JSON.stringify(opts));
    assert.equal(logged.length, 1, JSON.stringify(opts));
    assert.match(String(logged[0][0]), /room deletion failed/);
    assert.ok(logged[0].some((a) => String(a).includes(ROOM)), "names the room");
    assert.ok(logged[0].some((a) => a instanceof Error), "carries the error");
  }
});

test("a store failure while claiming releases this request's claim before propagating", async () => {
  // A bounded insert can abort after the row was committed; the release is
  // owner-scoped, so it is harmless when nothing was inserted.
  const { store, calls } = fakeStore(SCHEDULED, { recordEventThrows: true });
  await assert.rejects(() => handleDailyWebhook(signed(event({ id: "e-claim-fail" })), SECRET, store), /ledger unreachable/);
  assert.deepEqual(calls.map((c) => c[0]), ["recordEvent", "forgetEvent"]);
  assert.equal(calls[1][1], "e-claim-fail");
});

test("a request deadline cuts a hanging room deletion short, whatever its own budget", async () => {
  const deadline = AbortSignal.timeout(20);
  // The fake fails any processing call made after the deadline, like the real
  // store; the completion that follows the cut deletion must not be one.
  const { store, calls } = fakeStore(SCHEDULED, { deleteRoomHangs: true, deadline });
  const input = signed(event({ type: "meeting.ended", id: "e-deadline" }, { end_ts: 1700001800 }));
  const t0 = Date.now();
  const res = await handleDailyWebhook(input, SECRET, store, {
    deleteRoomTimeoutMs: 5_000,
    deadline,
    log: () => {},
  });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, roomDeleted: false });
  assert.ok(Date.now() - t0 < 1_000, "the deadline, not the 5 s deletion budget, ended the wait");
  assert.deepEqual(calls.at(-1), ["completeEvent", "e-deadline"]);
  assert.ok(deadline.aborted, "the completion ran after the deadline had fired");
});

test("a body within the cap is returned verbatim", async () => {
  const req = new Request("http://localhost/hook", { method: "POST", body: '{"a":1}' });
  assert.equal(await readBodyBounded(req, 64), '{"a":1}');
});

test("a body over the cap is refused while being read", async () => {
  const req = new Request("http://localhost/hook", { method: "POST", body: "x".repeat(200) });
  await assert.rejects(readBodyBounded(req, 64), BodyTooLargeError);
});

test("a declared length over the cap is refused before the body is read", async () => {
  const req = new Request("http://localhost/hook", {
    method: "POST",
    body: "tiny",
    headers: { "content-length": "999999" },
  });
  await assert.rejects(readBodyBounded(req, 64), BodyTooLargeError);
});
