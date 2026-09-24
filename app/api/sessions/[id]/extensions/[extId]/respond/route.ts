// POST /api/sessions/[id]/extensions/[extId]/respond
// The other participant accepts or declines a pending request. Accepting
// extends the session for real: the Daily room's expiry is pushed later and a
// longer meeting token is returned for reconnections.
import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createMeetingToken, updateDailyRoomExpiry } from "@/lib/daily";
import { earlyEntryMinutes } from "@/lib/sala-window";
import { effectiveDuration, extendedWindow, respondPermission, roomExpiryFor } from "@/lib/extensions";

const Body = z.object({ status: z.union([z.literal("accepted"), z.literal("declined")]) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; extId: string }> }) {
  const { id, extId } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select(`
      id, mentor_id, guest_id, starts_at, duration, status, daily_room_name,
      mentor:profiles!sessions_mentor_id_fkey(name, last_name),
      guest:profiles!sessions_guest_id_fkey(name, last_name)
    `)
    .eq("id", id)
    .maybeSingle();
  // A database failure is a 500, never the 404 that masks non-participants.
  if (sessionErr) return NextResponse.json({ error: "Could not read the session" }, { status: 500 });

  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const callerPersona = isMentor ? "mentor" : "guest";
  // A session that is no longer running has nothing to extend, whatever rows
  // it left behind: same rule as the request route.
  if (session.status !== "agendada") {
    return NextResponse.json({ error: "Session is not running", state: "not-scheduled" }, { status: 409 });
  }

  // Participation first, like the request route: a non-participant learns
  // nothing about the body rules.
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "status must be accepted or declined" }, { status: 400 });
  }
  const status = parsed.data.status;

  const { data: ext, error: extErr } = await supabase
    .from("time_extensions")
    .select("id, requested_by, minutes_added, status")
    .eq("id", extId)
    .eq("session_id", id)
    .maybeSingle();
  if (extErr) return NextResponse.json({ error: extErr.message }, { status: 500 });
  if (!ext) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (respondPermission({ requestedBy: ext.requested_by as "mentor" | "guest", callerPersona }) === "own-request") {
    return NextResponse.json({ error: "You cannot answer your own request", state: "own-request" }, { status: 403 });
  }

  // Everything the accept path needs is read BEFORE the write, so a failed
  // read can never leave a row accepted without the room and token following.
  const { data: priorRows, error: rowsErr } = await supabase
    .from("time_extensions")
    .select("id, minutes_added, status")
    .eq("session_id", id);
  if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 500 });

  // Conditional at write time: only a pending row moves, so two answers (or
  // an answer racing a second tab) cannot overwrite a terminal state.
  const { data: updated, error: updErr } = await supabase
    .from("time_extensions")
    .update({ status })
    .eq("id", extId)
    .eq("session_id", id)
    .eq("status", "pending")
    .select("id, requested_by, minutes_added, status");
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  if (!updated || updated.length === 0) {
    const { data: again, error: againErr } = await supabase
      .from("time_extensions")
      .select("status")
      .eq("id", extId)
      .maybeSingle();
    if (againErr || !again) return NextResponse.json({ error: "Could not read the request" }, { status: 500 });
    return NextResponse.json(
      { error: `Request already ${again.status}`, state: `already-${again.status}` },
      { status: 409 },
    );
  }
  const row = updated[0];

  if (status === "declined") {
    return NextResponse.json({ ok: true, ext: row });
  }

  // ── Accepted: the session's effective end moves; room and token follow ──
  // The rows read before the write, with this one now accepted.
  const allRows = (priorRows ?? []).map((r) => (r.id === extId ? { ...r, status: "accepted" } : r));
  const effective = effectiveDuration(session.duration as number, allRows);
  const startsAt = session.starts_at as string;
  const endsAt = new Date(new Date(startsAt).getTime() + effective * 60_000);
  const roomName = session.daily_room_name as string | null;

  if (roomName && process.env.DAILY_CO_API_KEY) {
    after(async () => {
      try {
        // Recomputed from the database at run time: two accepts in quick
        // succession may run their callbacks out of order, and the room must
        // end up with the expiry of everything accepted so far.
        const { data: latest, error } = await supabase
          .from("time_extensions")
          .select("minutes_added, status")
          .eq("session_id", id);
        if (error || !latest) {
          // Without the current rows the expiry could move backwards past a
          // later accept; leave the room alone and let the next accept fix it.
          console.error(`Daily room expiry update skipped for session ${id}: could not read extensions`, error);
          return;
        }
        const current = effectiveDuration(session.duration as number, latest);
        await updateDailyRoomExpiry(roomName, roomExpiryFor(startsAt, Math.max(current, effective)));
      } catch (err) {
        console.error(`Daily room expiry update failed for session ${id}:`, err);
      }
    });
  }

  let token: string | null = null;
  if (roomName && process.env.DAILY_CO_API_KEY) {
    const window = extendedWindow(startsAt, session.duration as number, allRows, earlyEntryMinutes());
    const me = (isMentor ? session.mentor : session.guest) as unknown as { name: string | null; last_name: string | null } | null;
    const userName = [me?.name, me?.last_name].filter(Boolean).join(" ") || (isMentor ? "Mentor" : "Convidado");
    try {
      token = await createMeetingToken({
        roomName,
        userName,
        isOwner: isMentor,
        notBefore: new Date(window.opensAt),
        expiresAt: new Date(window.tokenExpiresAt),
      });
    } catch (err) {
      // The extension is recorded either way; the token minted at entry
      // already outlives the original end by the late-exit and grace margins.
      console.error(`Token re-issue failed for session ${id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, ext: row, token, ends_at: endsAt.toISOString() });
}
