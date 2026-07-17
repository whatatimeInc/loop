// POST /api/sessions/[id]/extensions/[extId]/respond
// Updates an extension request to 'accepted' or 'declined'.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; extId: string }> }
) {
  const { id, extId } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { status: "accepted" | "declined" };
  if (!["accepted", "declined"].includes(body.status)) {
    return NextResponse.json({ error: "status must be accepted or declined" }, { status: 400 });
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

  const { error } = await supabase
    .from("time_extensions")
    .update({ status: body.status })
    .eq("id", extId)
    .eq("session_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
