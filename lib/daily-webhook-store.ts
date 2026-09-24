// Server-side only — never import from client components.
//
// The Supabase-backed WebhookStore for the Daily webhook route. The decisions
// live in daily-webhook.ts; this module only decides which time budget each
// database round trip runs on. It receives the service client and the room
// deleter instead of importing them so it can be unit-tested under node --test,
// which cannot resolve the "@/" alias.
import { randomUUID } from "node:crypto";
import type { createServiceClient } from "@/lib/supabase/service";
import { claimEvent, type ClaimLedger, type WebhookSession, type WebhookStore } from "./daily-webhook.ts";

export type WebhookStoreClient = ReturnType<typeof createServiceClient>;

const UNIQUE_VIOLATION = "23505";
// Daily waits 8 s for the 200 and then counts the delivery as failed, so an
// incomplete claim older than this belongs to a request Daily has already
// given up on; the retry takes it over instead of burning another of Daily's
// attempts on a 409. Taking over a request that is somehow still running is
// safe: markStarted/markEnded are conditional updates, deleteRoom tolerates
// 404, and forgetEvent only removes the claim generation the releasing
// request itself holds.
export const STALE_CLAIM_MS = 10_000;
// Every database round trip is bounded, like the room deletion: a black-holed
// connection must fail the request (releasing the claim, answering 500) rather
// than hold the claim open while Daily's retries are answered 409. Long
// before this fires Daily has counted the delivery as failed anyway.
export const STORE_IO_TIMEOUT_MS = 5_000;
// One deadline for the whole request, under Daily's 8 s. The per-call bounds
// above still apply, but several of them in a row (claim, session read, session
// write, room deletion) could otherwise add up past the point where Daily has
// already counted the delivery as failed and retried into a 409.
export const REQUEST_DEADLINE_MS = 6_000;
// The steps that follow the processing — marking the claim complete, or
// releasing it after a failure — run on their own short budgets, after the
// deadline, so a request whose deadline was spent on a hanging room deletion
// still acknowledges the event, and one that timed out still hands its claim
// back. Deadline plus grace stays under Daily's 8 s.
export const RELEASE_GRACE_MS = 1_500;

export type SupabaseWebhookStoreDeps = {
  /** Called once, on first use: a forged request never constructs the client. */
  client: () => WebhookStoreClient;
  deleteRoom: (roomName: string, signal: AbortSignal) => Promise<void>;
  /** Bounds every read and write that belongs to processing the event. */
  deadline: AbortSignal;
  /**
   * Bounds the completion that follows the processing. It must outlive
   * `deadline`: the room deletion may have consumed the deadline entirely, and
   * a session that is already final must be acknowledged, not retried.
   */
  wrapUp: AbortSignal;
};

export function createSupabaseWebhookStore(deps: SupabaseWebhookStoreDeps): WebhookStore {
  let client: WebhookStoreClient | null = null;
  const supabase = () => (client ??= deps.client());
  const perCall = () => AbortSignal.timeout(STORE_IO_TIMEOUT_MS);
  const bounded = () => AbortSignal.any([deps.deadline, perCall()]);
  const wrapUp = () => AbortSignal.any([deps.wrapUp, perCall()]);
  const grace = () => AbortSignal.timeout(RELEASE_GRACE_MS);
  // One token per request. A claim is stamped with it on insert and on
  // takeover, and a release only removes a claim still carrying it: a request
  // that was taken over while stalled cannot delete the row its successor is
  // working on. That is also what keeps the worst case safe when the database
  // dies between the session write and the completion: complete (wrap-up),
  // its confirming read and the release (a grace each) can then outlast the
  // stale window, but the takeover changes the owner, so the late release
  // matches nothing.
  const owner = randomUUID();
  const isCompletedByUs = async (id: string): Promise<boolean> => {
    try {
      const { data } = await supabase()
        .from("daily_webhook_events")
        .select("completed_at")
        .eq("id", id)
        .eq("owner", owner)
        .abortSignal(grace())
        .maybeSingle();
      return data?.completed_at != null;
    } catch {
      return false;
    }
  };
  const ledger: ClaimLedger = {
    async insert(id, type, room) {
      // received_at is stamped from this clock, not the database default, so
      // the staleness cutoff in claimEvent compares like with like.
      const { error } = await supabase()
        .from("daily_webhook_events")
        .insert({ id, type, room, owner, received_at: new Date().toISOString() })
        .abortSignal(bounded());
      if (!error) return "inserted";
      if (error.code === UNIQUE_VIOLATION) return "conflict";
      throw new Error(`daily_webhook_events insert failed: ${error.message}`);
    },
    async takeoverStale(id, cutoff) {
      // The UPDATE's row lock means two concurrent retries cannot both win.
      const { data, error } = await supabase()
        .from("daily_webhook_events")
        .update({ received_at: new Date().toISOString(), owner })
        .eq("id", id)
        .is("completed_at", null)
        .lt("received_at", cutoff)
        .select("id")
        .abortSignal(bounded());
      if (error) throw new Error(`daily_webhook_events takeover failed: ${error.message}`);
      return (data?.length ?? 0) > 0;
    },
    async read(id) {
      const { data, error } = await supabase()
        .from("daily_webhook_events")
        .select("completed_at")
        .eq("id", id)
        .abortSignal(bounded())
        .maybeSingle();
      if (error) throw new Error(`daily_webhook_events read failed: ${error.message}`);
      return data ? { completedAt: (data.completed_at as string | null) ?? null } : null;
    },
  };
  return {
    recordEvent: (id, type, room) => claimEvent(ledger, { id, type, room }, { staleMs: STALE_CLAIM_MS }),
    async completeEvent(id) {
      // Owner-scoped like the release: a request that lost its claim to a
      // takeover must not mark the successor's still-running claim complete.
      // Matching no row means exactly that, and it is a failure: the handler
      // then releases (nothing, the row is not ours) and answers 500 instead
      // of acknowledging an event whose ledger entry is still open elsewhere.
      const { data, error } = await supabase()
        .from("daily_webhook_events")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", id)
        .eq("owner", owner)
        .select("id")
        .abortSignal(wrapUp());
      if (error) {
        // The update may have committed before the response reached us (the
        // timeout fires client-side; the gateway keeps forwarding). A second,
        // bounded read settles it: a row we own that is already marked done
        // means the event succeeded and must be acknowledged, not retried.
        if (await isCompletedByUs(id)) return;
        throw new Error(`daily_webhook_events complete failed: ${error.message}`);
      }
      if ((data?.length ?? 0) === 0) {
        throw new Error(`daily_webhook_events complete failed: claim ${id} no longer held`);
      }
    },
    async forgetEvent(id) {
      // Only this request's own unfinished claim is released: after a stale
      // takeover the row belongs to a later request, finished or not.
      const { error } = await supabase()
        .from("daily_webhook_events")
        .delete()
        .eq("id", id)
        .eq("owner", owner)
        .is("completed_at", null)
        .abortSignal(grace());
      if (error) throw new Error(`daily_webhook_events release failed: ${error.message}`);
    },
    async getSession(sessionId) {
      const { data, error } = await supabase()
        .from("sessions")
        .select("status, session_started_at, duration, daily_room_name")
        .eq("id", sessionId)
        .abortSignal(bounded())
        .maybeSingle();
      if (error) throw new Error(`sessions read failed: ${error.message}`);
      return (data as WebhookSession | null) ?? null;
    },
    async markStarted(sessionId, startedAt) {
      const { error } = await supabase()
        .from("sessions")
        .update({ session_started_at: startedAt })
        .eq("id", sessionId)
        .eq("status", "agendada")
        .is("session_started_at", null)
        .abortSignal(bounded());
      if (error) throw new Error(`sessions start update failed: ${error.message}`);
    },
    async markEnded(sessionId, patch) {
      const { data, error } = await supabase()
        .from("sessions")
        .update({
          status: "concluída",
          session_ended_at: patch.endedAt,
          actual_duration_minutes: patch.actualMinutes,
        })
        .eq("id", sessionId)
        .eq("status", "agendada")
        .select("id")
        .abortSignal(bounded());
      if (error) throw new Error(`sessions end update failed: ${error.message}`);
      return (data?.length ?? 0) > 0;
    },
    deleteRoom: (roomName, signal) => deps.deleteRoom(roomName, signal),
  };
}
