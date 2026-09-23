// GET /api/sessions/[id]/token
// Mints a Daily.co meeting token server-side for a participant of the session.
// Returns { token, roomUrl, persona: 'mentor' | 'guest' }.
// Daily.co API key is NEVER sent to the client.
//
// This is the only gate that matters for the private Daily room: the raw room
// URL cannot be joined without a token, so every rule enforced here (logged-in
// user, participant of this session, session still enterable, inside the entry
// window) holds even for someone who bypasses the /sala page.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createMeetingToken, createDailyRoom } from "@/lib/daily";
import { ENTERABLE_STATUSES, earlyEntryMinutes, entryState, entryWindow } from "@/lib/sala-window";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      id, mentor_id, guest_id, starts_at, duration,
      daily_room_url, daily_room_name, status,
      mentor:profiles!sessions_mentor_id_fkey(name, last_name),
      guest:profiles!sessions_guest_id_fkey(name, last_name)
    `)
    .eq("id", id)
    .single();

  // A session the caller is not part of is reported exactly like one that does
  // not exist, so the endpoint cannot be used to probe which ids are real.
  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (!ENTERABLE_STATUSES.has(session.status)) {
    return NextResponse.json({ error: "Session not enterable" }, { status: 410 });
  }

  const persona = isMentor ? "mentor" : "guest";
  const window = entryWindow(session.starts_at, session.duration, earlyEntryMinutes());
  const state = entryState(window, Date.now());
  if (state !== "open") {
    return NextResponse.json({ error: state === "too-early" ? "Too early" : "Session expired", state }, { status: 403 });
  }

  if (!session.daily_room_name) {
    // Room not provisioned at booking time (Daily was down). Provision it
    // now, so the waiting room's periodic retry heals the session.
    try {
      const startsMs0 = new Date(session.starts_at).getTime();
      const room = await createDailyRoom(session.id, new Date(startsMs0 + (session.duration + 90) * 60 * 1000));
      await supabase
        .from("sessions")
        .update({ daily_room_url: room.url, daily_room_name: room.name })
        .eq("id", id);
      session.daily_room_url = room.url;
      session.daily_room_name = room.name;
    } catch (e) {
      console.error("Lazy Daily room provisioning failed:", e);
    }
    if (!session.daily_room_name) {
      return NextResponse.json({ token: null, roomUrl: session.daily_room_url, persona });
    }
  }

  const mentor = session.mentor as unknown as { name: string | null; last_name: string | null } | null;
  const guest = session.guest as unknown as { name: string | null; last_name: string | null } | null;

  const userName = isMentor
    ? [mentor?.name, mentor?.last_name].filter(Boolean).join(" ") || "Mentor"
    : [guest?.name, guest?.last_name].filter(Boolean).join(" ") || "Convidado";

  let token: string | null = null;
  try {
    token = await createMeetingToken({
      roomName: session.daily_room_name,
      userName,
      isOwner: isMentor,
      // Minted only inside the entry window (checked above). The token itself
      // stays valid a short grace past the window so a call that is still
      // running is not cut off the moment new entries close; Daily then ejects.
      notBefore: new Date(window.opensAt),
      expiresAt: new Date(window.tokenExpiresAt),
    });
  } catch (e) {
    console.error("Token generation failed:", e);
    return NextResponse.json({ error: "Could not issue a room token" }, { status: 502 });
  }

  return NextResponse.json({ token, roomUrl: session.daily_room_url, persona });
}
