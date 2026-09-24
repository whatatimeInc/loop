// POST /api/webhooks/daily
// Receives Daily.co events (meeting.started, meeting.ended) for rooms named
// `looptalk-<session id>`. The decisions live in lib/daily-webhook.ts and the
// Supabase-backed store in lib/daily-webhook-store.ts; this file only adapts
// the request and hands out the time budgets.
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteDailyRoom } from "@/lib/daily";
import { env } from "@/lib/env";
import { BodyTooLargeError, decodeWebhookSecret, handleDailyWebhook, readBodyBounded } from "@/lib/daily-webhook";
import { createSupabaseWebhookStore, RELEASE_GRACE_MS, REQUEST_DEADLINE_MS } from "@/lib/daily-webhook-store";

export const runtime = "nodejs";

// A Daily event is a few hundred bytes. The signature check needs the whole
// body, so this is the only thing standing between an anonymous sender and an
// unbounded allocation.
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(req: NextRequest) {
  // OPS-3 refuses to start without the secret; this is the in-request backstop
  // and answers before the body or any header is looked at.
  let secret: Buffer | null;
  try {
    secret = decodeWebhookSecret(env().DAILY_WEBHOOK_SECRET);
  } catch {
    secret = null;
  }
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  try {
    // Inside the try: a body stream that dies mid-read is answered with the
    // same JSON 500 as a processing failure, not an opaque platform error.
    const input = {
      rawBody: await readBodyBounded(req, MAX_BODY_BYTES),
      signature: req.headers.get("x-webhook-signature"),
      timestamp: req.headers.get("x-webhook-timestamp"),
    };
    // The budgets start once the body is in hand, so a slow upload does not
    // eat into the processing. The wrap-up outlives the deadline by the grace:
    // a deadline spent on a hanging room deletion must still end in the claim
    // being marked complete, not in a 500 for a session that is already final.
    const deadline = AbortSignal.timeout(REQUEST_DEADLINE_MS);
    const wrapUp = AbortSignal.timeout(REQUEST_DEADLINE_MS + RELEASE_GRACE_MS);
    const store = createSupabaseWebhookStore({
      client: createServiceClient,
      deleteRoom: deleteDailyRoom,
      deadline,
      wrapUp,
    });
    const result = await handleDailyWebhook(input, secret, store, { deadline });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: "Body too large" }, { status: 413 });
    }
    // Any claim was released; a 5xx makes Daily retry the same event id.
    console.error("daily webhook: processing failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
