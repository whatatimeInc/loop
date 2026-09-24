// Server-side only — never import from client components.
//
// Everything POST /api/webhooks/daily decides, without Next or Supabase, so the
// contract is unit-tested against a fake store. The route only adapts the
// request and wires the real store.
//
// Daily signs every delivery (docs "Webhooks > Signature verification"):
//   X-Webhook-Signature = base64( HMAC-SHA256( base64decode(secret), `${X-Webhook-Timestamp}.${rawBody}` ) )
// The secret is the base64 `hmac` value given to Daily when the webhook was
// registered, so the key is its DECODED bytes, not the utf-8 of the string.
//
// No timestamp-skew check on purpose. Daily retries a failed delivery minutes
// later (circuit breaker, then exponential) with the ORIGINAL timestamp, so a
// window would reject legitimate retries; replaying an already-processed
// event is neutralised by the idempotency claim on the event id instead.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export { decodeWebhookSecret } from "./webhook-secret.ts";

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** Exactly Daily's computation; used by tests and by local proofs. */
export function signDailyWebhook(rawBody: string, timestamp: string, secret: Buffer): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("base64");
}

export function verifyDailyWebhookSignature(args: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
  secret: Buffer;
}): boolean {
  const { rawBody, signature, timestamp, secret } = args;
  if (!signature || !timestamp || !BASE64.test(signature)) return false;
  const given = Buffer.from(signature, "base64");
  const expected = Buffer.from(signDailyWebhook(rawBody, timestamp, secret), "base64");
  // timingSafeEqual throws on unequal lengths; a wrong length is just "no".
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Unix seconds Daily could plausibly send: from the epoch to the year 2100.
const unixSeconds = z.number().finite().min(0).max(4_102_444_800);

const eventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.object({
    room: z.string().min(1),
    // Daily omits these on some event types; an explicit null means the same.
    // Bounded so `new Date(ts * 1000)` can never throw after the claim is taken:
    // JSON.parse accepts 1e309 (Infinity) and 1e20, both unrepresentable as a Date.
    start_ts: unixSeconds.nullish(),
    end_ts: unixSeconds.nullish(),
  }),
});

export type DailyWebhookEvent = {
  id: string;
  type: string;
  room: string;
  /** Unix seconds, as Daily sends them. */
  startTs?: number;
  endTs?: number;
};

export type ParseResult = { ok: true; event: DailyWebhookEvent } | { ok: false; error: string };

export function parseDailyWebhookEvent(rawBody: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "Not a Daily event" };
  const { id, type, payload } = parsed.data;
  return {
    ok: true,
    event: {
      id,
      type,
      room: payload.room,
      ...(payload.start_ts != null ? { startTs: payload.start_ts } : {}),
      ...(payload.end_ts != null ? { endTs: payload.end_ts } : {}),
    },
  };
}

// createDailyRoom names rooms `looptalk-<session uuid>`; accept nothing looser,
// so a room created outside the app can never address a session. The hex is
// matched case-insensitively and normalised, because sessions.id is lowercase
// and an event that echoed the name in another case must still find its row.
const ROOM_NAME = /^looptalk-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function sessionIdFromRoomName(room: string): string | null {
  const match = ROOM_NAME.exec(room);
  return match ? match[1].toLowerCase() : null;
}

export type WebhookSession = {
  status: string;
  session_started_at: string | null;
  /** Booked length in minutes. */
  duration: number | null;
  daily_room_name: string | null;
};

/**
 * What the store says about an event id when asked to claim it:
 *   new        — nobody had it; the caller now owns it and must complete or forget it.
 *   processing — another request holds it and has not finished (or died mid-way).
 *   duplicate  — it was fully processed before.
 */
export type ClaimState = "new" | "processing" | "duplicate";

/**
 * The handler calls completeEvent and forgetEvent after the request deadline it
 * was given may already have fired (a room deletion can consume it entirely),
 * so an implementation must bound those two on budgets of their own; only
 * recordEvent, getSession, markStarted and markEnded belong to the deadline.
 */
export type WebhookStore = {
  recordEvent(id: string, type: string, room: string | null): Promise<ClaimState>;
  /** Mark a claim as fully processed, so a redelivery is a duplicate. */
  completeEvent(id: string): Promise<void>;
  /**
   * Release a claim whose processing failed, so Daily's retry is processed.
   * Must not touch a completed claim: after a stale takeover the row may by now
   * belong to a later request that finished.
   */
  forgetEvent(id: string): Promise<void>;
  getSession(sessionId: string): Promise<WebhookSession | null>;
  /** Set session_started_at only when it is still null and the status is still `agendada`. */
  markStarted(sessionId: string, startedAt: string): Promise<void>;
  /** Complete the session only when its status is still `agendada`; true when a row changed. */
  markEnded(sessionId: string, patch: { endedAt: string; actualMinutes: number | null }): Promise<boolean>;
  /** Delete the Daily room; must reject (not hang) once `signal` aborts. */
  deleteRoom(roomName: string, signal: AbortSignal): Promise<void>;
};

/**
 * The three ledger primitives the route implements over daily_webhook_events;
 * claimEvent turns them into a ClaimState so the protocol is unit-tested.
 */
export type ClaimLedger = {
  /** INSERT the claim row; "conflict" on a primary-key violation. */
  insert(id: string, type: string, room: string | null): Promise<"inserted" | "conflict">;
  /** Re-stamp an incomplete claim received before `cutoff`; true when a row changed. */
  takeoverStale(id: string, cutoff: string): Promise<boolean>;
  read(id: string): Promise<{ completedAt: string | null } | null>;
};

/**
 * Claim an event id. A conflict with a stale, incomplete claim (its request
 * died, or Daily already gave up waiting for it) is taken over. A conflict
 * whose row is gone by the time it is read means the holder released it in
 * between, so the insert is tried once more; a second miss is reported as
 * processing and Daily's next retry gets a clean run.
 */
export async function claimEvent(
  ledger: ClaimLedger,
  event: { id: string; type: string; room: string | null },
  opts: { staleMs: number; now?: () => Date }
): Promise<ClaimState> {
  const now = opts.now ?? (() => new Date());
  for (let attempt = 0; attempt < 2; attempt++) {
    if ((await ledger.insert(event.id, event.type, event.room)) === "inserted") return "new";
    const cutoff = new Date(now().getTime() - opts.staleMs).toISOString();
    if (await ledger.takeoverStale(event.id, cutoff)) return "new";
    const row = await ledger.read(event.id);
    if (row === null) continue;
    return row.completedAt ? "duplicate" : "processing";
  }
  return "processing";
}

export type WebhookInput = {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
};

export type WebhookResult = { status: number; body: Record<string, unknown> };

export type WebhookOptions = {
  now?: () => Date;
  /** Upper bound on the Daily room deletion, which sits inside the acknowledgement. */
  deleteRoomTimeoutMs?: number;
  /** Where a swallowed failure (a room that could not be deleted) is reported. */
  log?: (message: string, ...detail: unknown[]) => void;
  /**
   * One deadline for the whole request. Daily gives up after 8 s, so every
   * wait inside the acknowledgement is capped by it on top of its own budget.
   */
  deadline?: AbortSignal;
};

type ResolvedOptions = {
  now: () => Date;
  deleteRoomTimeoutMs: number;
  log: (message: string, ...detail: unknown[]) => void;
  deadline?: AbortSignal;
};

/** Thrown by readBodyBounded when a request body exceeds the cap. */
export class BodyTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`Request body exceeds ${maxBytes} bytes`);
    this.name = "BodyTooLargeError";
  }
}

/**
 * Reads a request body as text without buffering more than `maxBytes`. A
 * declared Content-Length over the cap is refused before any byte is read; an
 * undeclared or lying length is refused the moment the stream crosses it. The
 * signature check needs the raw bytes, so this is the only defence that runs
 * before it: an unauthenticated sender must not be able to make the process
 * allocate an arbitrary amount of memory.
 */
export async function readBodyBounded(req: Request, maxBytes: number): Promise<string> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError(maxBytes);
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new BodyTooLargeError(maxBytes);
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
    if (total > maxBytes) await req.body.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The two events this platform acts on; everything else is acknowledged untouched. */
function isActionable(type: string): type is "meeting.started" | "meeting.ended" {
  return type === "meeting.started" || type === "meeting.ended";
}

// Daily counts a delivery as failed after 8 s. The session update is a single
// conditional UPDATE; the room deletion is the only slow step, so it gets a
// budget that keeps the whole acknowledgement under Daily's limit even when
// Daily's own API is stalling. An abandoned deletion is reported, not retried:
// the session is already final, and the room is cleaned up by the next ended
// event's takeover path or by hand.
const DEFAULT_DELETE_ROOM_TIMEOUT_MS = 5_000;

/**
 * The whole route, minus I/O. Order matters and is part of the contract:
 * secret → signature → shape → idempotency claim → session update → complete.
 * A throw after the claim (including a failure to mark it complete) releases
 * it and propagates, so the route can answer 500 and Daily retries instead of
 * the event being lost behind the claim.
 * A redelivery that arrives while the first attempt is still running gets a
 * 409, not a duplicate ACK: the first attempt may yet fail, and only a non-2xx
 * keeps Daily retrying. That costs one of Daily's retries, which is why the
 * route's stale window is barely longer than Daily's own delivery timeout.
 */
export async function handleDailyWebhook(
  input: WebhookInput,
  secret: Buffer | null,
  store: WebhookStore,
  opts: WebhookOptions = {}
): Promise<WebhookResult> {
  const now = opts.now ?? (() => new Date());
  const deleteRoomTimeoutMs = opts.deleteRoomTimeoutMs ?? DEFAULT_DELETE_ROOM_TIMEOUT_MS;
  const log = opts.log ?? console.error;
  const deadline = opts.deadline;
  if (!secret) return { status: 503, body: { error: "Webhook secret not configured" } };

  if (!verifyDailyWebhookSignature({ ...input, secret })) {
    return { status: 401, body: { error: "Invalid signature" } };
  }

  const parsed = parseDailyWebhookEvent(input.rawBody);
  if (!parsed.ok) return { status: 400, body: { error: "Invalid event" } };
  const event = parsed.event;

  // An event with nothing to do (a type this platform ignores, a room it did
  // not create) has no side effect to make idempotent, so it takes no ledger
  // row either: the table only ever grows by the two events per session.
  const sessionId = sessionIdFromRoomName(event.room);
  if (!isActionable(event.type) || !sessionId) return { status: 200, body: { ok: true } };

  // Everything after this line may have written a claim, including a failed
  // insert whose row was committed after the client gave up; the release is
  // owner-scoped, so releasing after a failed claim is harmless when nothing
  // was inserted and necessary when it was.
  let body: Record<string, unknown>;
  try {
    const claim = await store.recordEvent(event.id, event.type, event.room);
    if (claim === "duplicate") return { status: 200, body: { ok: true, duplicate: true } };
    if (claim === "processing") return { status: 409, body: { error: "Event still being processed" } };
    body = await applyEvent(event, sessionId, store, { now, deleteRoomTimeoutMs, log, deadline });
    await store.completeEvent(event.id);
  } catch (error) {
    try {
      await store.forgetEvent(event.id);
    } catch (releaseError) {
      // Both matter to the operator: the claim now blocks retries until it is
      // stale, and the route's 500 must say why.
      throw new AggregateError([error, releaseError], "processing failed and the claim could not be released");
    }
    throw error;
  }
  return { status: 200, body };
}

/** The session change for one claimed event; the acknowledgement body on success. */
async function applyEvent(
  event: DailyWebhookEvent,
  sessionId: string,
  store: WebhookStore,
  { now, deleteRoomTimeoutMs, log, deadline }: ResolvedOptions
): Promise<Record<string, unknown>> {
  const session = await store.getSession(sessionId);
  if (!session) return { ok: true };

  if (event.type === "meeting.started") {
    // A start that lands after the session was closed (late delivery, or a
    // room reopened by hand) must not rewrite a concluded session.
    if (session.status === "agendada" && session.session_started_at === null) {
      // Daily always sends start_ts; the receipt time is the honest fallback.
      const startedAtMs = event.startTs !== undefined ? event.startTs * 1000 : now().getTime();
      await store.markStarted(sessionId, new Date(startedAtMs).toISOString());
    }
    return { ok: true };
  }

  // meeting.ended
  const endedAtMs = event.endTs !== undefined ? event.endTs * 1000 : now().getTime();
  const startedAtMs =
    session.session_started_at !== null
      ? new Date(session.session_started_at).getTime()
      : event.startTs !== undefined
        ? event.startTs * 1000
        : null;
  // Clamped: Daily's clocks can put end_ts before a start recorded from an
  // earlier event, and a negative duration must never reach the dashboard.
  const actualMinutes =
    startedAtMs !== null ? Math.max(0, Math.round((endedAtMs - startedAtMs) / 60_000)) : session.duration;

  if (session.status === "agendada") {
    await store.markEnded(sessionId, { endedAt: new Date(endedAtMs).toISOString(), actualMinutes });
  }

  let roomDeleted: boolean | undefined;
  if (session.daily_room_name) {
    try {
      const budget = AbortSignal.timeout(deleteRoomTimeoutMs);
      const signal = deadline ? AbortSignal.any([deadline, budget]) : budget;
      await store.deleteRoom(session.daily_room_name, signal);
      roomDeleted = true;
    } catch (error) {
      // Daily may be down or slow; the session is already final and Daily
      // must not retry a processed event, so acknowledge and report. The
      // response goes to Daily, so the operator learns of it from this log.
      log("daily webhook: room deletion failed", session.daily_room_name, error);
      roomDeleted = false;
    }
  }
  return roomDeleted === undefined ? { ok: true } : { ok: true, roomDeleted };
}
