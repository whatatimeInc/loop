// POST /api/sessions/[id]/extensions
// Records a time extension request in the DB.
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

  const body = await req.json() as { requested_by: "mentor" | "guest"; minutes_added: 5 | 10 | 15 };
  if (!["mentor", "guest"].includes(body.requested_by)) {
    return NextResponse.json({ error: "Invalid requested_by" }, { status: 400 });
  }
  if (![5, 10, 15].includes(body.minutes_added)) {
    return NextResponse.json({ error: "minutes_added must be 5, 10, or 15" }, { status: 400 });
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

  const { data: ext, error } = await supabase
    .from("time_extensions")
    .insert({
      session_id: id,
      requested_by: body.requested_by,
      minutes_added: body.minutes_added,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: ext.id });
}
