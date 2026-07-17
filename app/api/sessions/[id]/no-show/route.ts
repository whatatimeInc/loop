// POST /api/sessions/[id]/no-show
// Marks a session as mentor_no_show or guest_no_show.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { no_show_by: "mentor" | "guest" };
  if (!["mentor", "guest"].includes(body.no_show_by)) {
    return NextResponse.json({ error: "Invalid no_show_by" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, mentor_id, guest_id")
    .eq("id", id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.mentor_id !== user.id && session.guest_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status =
    body.no_show_by === "mentor" ? "mentor_no_show" : "guest_no_show";

  await supabase
    .from("sessions")
    .update({ status, no_show_by: body.no_show_by, session_ended_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
