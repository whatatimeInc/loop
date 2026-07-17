// POST /api/sessions/[id]/start
// Sets session_started_at when the first participant enters the call.
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
    .select("id, mentor_id, guest_id, session_started_at")
    .eq("id", id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.mentor_id !== user.id && session.guest_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only set if not already started (idempotent)
  if (!session.session_started_at) {
    await supabase
      .from("sessions")
      .update({ session_started_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
