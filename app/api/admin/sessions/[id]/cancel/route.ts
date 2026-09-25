// POST /api/admin/sessions/[id]/cancel
// The team cancels a scheduled session from /admin. Same write as the
// participant route (app/api/sessions/[id]/cancel): status agendada →
// cancelada, conditional so it loses against a concurrent start, end or
// cancel; no deadline applies to the team.
//
// Responses: 500 auth server unreachable · 401 not signed in · 404 not an admin, or unknown id ·
// 409 { state: "not-scheduled", status } · 200 { ok: true }.
import { NextRequest, NextResponse, after } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { adminFromRequest } from "@/lib/admin-guard";
import { deleteDailyRoom } from "@/lib/daily";
import { reportError } from "@/lib/report";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const admin = await adminFromRequest();
  if (admin === "unavailable") return NextResponse.json({ error: "Could not verify the session" }, { status: 500 });
  if (admin === "signed-out") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Same answer as an unknown id: the admin API does not reveal itself.
  if (admin === "forbidden") return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Service-role client: RLS does not apply; access was decided above.
  const supabase = createServiceClient();
  const { data: updated, error } = await supabase
    .from("sessions")
    .update({ status: "cancelada" })
    .eq("id", id)
    .eq("status", "agendada")
    .select("id, daily_room_name");
  if (error) return NextResponse.json({ error: "Could not cancel session" }, { status: 500 });

  if (!updated || updated.length === 0) {
    const { data: current, error: rereadError } = await supabase
      .from("sessions")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (rereadError) return NextResponse.json({ error: "Could not read session" }, { status: 500 });
    if (!current) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ error: "Session is not scheduled", state: "not-scheduled", status: current.status }, { status: 409 });
  }

  // Best effort, after the response: the cancellation is already recorded.
  const roomName = updated[0].daily_room_name as string | null;
  if (roomName) {
    after(() => deleteDailyRoom(roomName).catch((err) => reportError("admin/cancel/delete-room", err, { roomName, sessionId: id })));
  }

  return NextResponse.json({ ok: true });
}
