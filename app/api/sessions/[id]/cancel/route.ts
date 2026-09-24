// POST /api/sessions/[id]/cancel
// Cancels a scheduled session on behalf of one of its participants.
//
// A guest may cancel only until CANCEL_DEADLINE_HOURS before the start (see
// lib/cancel-window.ts); a mentor may cancel any scheduled session. Setting
// status = 'cancelada' is what frees the slot: both the booked_slots RPC and
// the sessions_no_overlap constraint only count rows in 'agendada'.
//
// Responses: 401 not signed in · 404 unknown id or not a participant (same
// answer, so ids cannot be probed) · 409 not scheduled any more ·
// 403 { state: "past-deadline" } guest past the deadline · 200 { ok: true }.
import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteDailyRoom } from "@/lib/daily";
import { cancelDeadlineHours, cancelState } from "@/lib/cancel-window";
import { reportError } from "@/lib/report";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: session, error: readError } = await supabase
    .from("sessions")
    .select("id, mentor_id, guest_id, starts_at, status, daily_room_name")
    .eq("id", id)
    .maybeSingle();
  // A failed read is not "not found": say so, or the guest sees a 404 while
  // the row is still 'agendada' and the slot stays blocked.
  if (readError) return NextResponse.json({ error: "Could not load session" }, { status: 500 });

  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  // The deadline binds the guest only. Someone who is both (a self-booked
  // demo account) keeps the mentor's freedom to cancel at any time.
  const deadlineApplies = isGuest && !isMentor;

  const hours = cancelDeadlineHours();
  const state = cancelState({ status: session.status, startsAt: session.starts_at }, Date.now(), hours);
  if (state === "not-scheduled") {
    return NextResponse.json({ error: "Session is not scheduled", state }, { status: 409 });
  }
  if (deadlineApplies && state === "past-deadline") {
    return NextResponse.json(
      { error: "Cancellation deadline has passed", state, deadlineHours: hours },
      { status: 403 },
    );
  }

  // The predicates make the write atomic: the status filter loses against a
  // concurrent start/end, and for a guest the deadline is re-evaluated by the
  // database at write time, so a request that squeaked past the check above
  // cannot land after the window closed.
  let write = supabase
    .from("sessions")
    .update({ status: "cancelada" })
    .eq("id", id)
    .eq("status", "agendada");
  if (deadlineApplies) {
    write = write.gte("starts_at", new Date(Date.now() + hours * 3_600_000).toISOString());
  }
  const { data: updated, error } = await write.select("id");

  if (error) return NextResponse.json({ error: "Could not cancel session" }, { status: 500 });
  if (!updated || updated.length === 0) {
    // Nothing matched: either the row left 'agendada' or (guest) the deadline
    // passed between the check and the write. Re-read the row so the answer
    // reflects what the database holds now, not the snapshot from above.
    const { data: current, error: rereadError } = await supabase
      .from("sessions")
      .select("status, starts_at")
      .eq("id", id)
      .maybeSingle();
    if (rereadError || !current) {
      return NextResponse.json({ error: "Could not cancel session" }, { status: 500 });
    }
    const late = deadlineApplies &&
      cancelState({ status: current.status, startsAt: current.starts_at }, Date.now(), hours) === "past-deadline";
    return late
      ? NextResponse.json({ error: "Cancellation deadline has passed", state: "past-deadline", deadlineHours: hours }, { status: 403 })
      : NextResponse.json({ error: "Session is not scheduled", state: "not-scheduled" }, { status: 409 });
  }

  // The room is worthless once the session is cancelled. Best effort, and
  // after the response: the cancellation is already recorded, so a slow or
  // down Daily API must neither fail nor stall the answer the guest sees.
  const roomName = session.daily_room_name;
  if (roomName) {
    after(() => deleteDailyRoom(roomName).catch((err) => reportError("sessions/cancel/delete-room", err, { roomName })));
  }

  return NextResponse.json({ ok: true });
}
