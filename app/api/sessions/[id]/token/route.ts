// GET /api/sessions/[id]/token
// Generates a Daily.co meeting token server-side.
// Returns { token, roomUrl, persona: 'mentor' | 'guest' }.
// Daily.co API key is NEVER sent to the client.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createMeetingToken } from "@/lib/daily";

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

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status === "cancelada") return NextResponse.json({ error: "Session cancelled" }, { status: 410 });

  const isMentor = session.mentor_id === user.id;
  const isGuest = session.guest_id === user.id;
  if (!isMentor && !isGuest) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!session.daily_room_name) {
    // Room not provisioned yet (e.g. Daily key missing in dev)
    return NextResponse.json({ token: null, roomUrl: session.daily_room_url, persona: isMentor ? "mentor" : "guest" });
  }

  const startsMs = new Date(session.starts_at).getTime();
  const tokenExpiry = new Date(startsMs + (session.duration + 90) * 60 * 1000);

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
      expiresAt: tokenExpiry,
    });
  } catch (e) {
    console.error("Token generation failed:", e);
  }

  return NextResponse.json({
    token,
    roomUrl: session.daily_room_url,
    persona: isMentor ? "mentor" : "guest",
  });
}
