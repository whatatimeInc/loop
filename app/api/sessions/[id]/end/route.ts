// POST /api/sessions/[id]/end
// Marks the session as 'concluída' and records actual duration.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
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
    .select("id, mentor_id, guest_id, session_started_at, duration, status")
    .eq("id", id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.mentor_id !== user.id && session.guest_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Don't overwrite if already concluded
  if (session.status === "concluída") return NextResponse.json({ ok: true });

  const endedAt = new Date();
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
    .eq("id", id);

  return NextResponse.json({ ok: true, actualMinutes });
}
