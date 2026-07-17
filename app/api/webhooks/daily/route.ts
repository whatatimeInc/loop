// POST /api/webhooks/daily
// Handles Daily.co webhook events: meeting-started, participant-joined, meeting-ended.
// Signature verification using DAILY_WEBHOOK_SECRET env var.
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteDailyRoom, verifyDailyWebhookSignature } from "@/lib/daily";

export const runtime = "nodejs";

interface DailyWebhookPayload {
  type: string;
  id: string;
  attempt: number;
  created_at: string;
  properties: {
    room_name?: string;
    session_id?: string;
    participant_id?: string;
    duration?: number;
  };
}

// Room names follow the pattern `looptalk-<session-uuid>`
function sessionIdFromRoomName(roomName: string): string | null {
  const match = roomName.match(/^looptalk-(.+)$/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-daily-signature") ?? "";
  const secret = process.env.DAILY_WEBHOOK_SECRET;

  // Verify signature if secret is configured
  if (secret) {
    const valid = await verifyDailyWebhookSignature(rawBody, signature, secret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: DailyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const roomName = payload.properties?.room_name;
  if (!roomName) return NextResponse.json({ ok: true });

  const sessionId = sessionIdFromRoomName(roomName);
  if (!sessionId) return NextResponse.json({ ok: true });

  const supabase = createServiceClient();

  switch (payload.type) {
    case "meeting.started": {
      // Set session_started_at if not already set
      const { data: session } = await supabase
        .from("sessions")
        .select("session_started_at")
        .eq("id", sessionId)
        .single();

      if (session && !session.session_started_at) {
        await supabase
          .from("sessions")
          .update({ session_started_at: new Date(payload.created_at).toISOString() })
          .eq("id", sessionId);
      }
      break;
    }

    case "meeting.ended": {
      const endedAt = new Date();

      const { data: session } = await supabase
        .from("sessions")
        .select("session_started_at, duration, status, daily_room_name")
        .eq("id", sessionId)
        .single();

      if (!session || session.status === "concluída") break;

      const startedAt = session.session_started_at
        ? new Date(session.session_started_at)
        : null;

      const actualMinutes = startedAt
        ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000)
        : session.duration;

      await supabase
        .from("sessions")
        .update({
          status: "concluída",
          session_ended_at: endedAt.toISOString(),
          actual_duration_minutes: actualMinutes,
        })
        .eq("id", sessionId);

      // Clean up the Daily.co room
      if (session.daily_room_name) {
        deleteDailyRoom(session.daily_room_name).catch(console.error);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
