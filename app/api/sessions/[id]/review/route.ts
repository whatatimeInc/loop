// POST /api/sessions/[id]/review
// Saves a guest review (rating + optional text) for a completed session.
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

  const body = await req.json() as { rating: number; text?: string | null; anonymous?: boolean };
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify reviewer is the guest
  const { data: session } = await supabase
    .from("sessions")
    .select("id, guest_id, status")
    .eq("id", id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.guest_id !== user.id) {
    return NextResponse.json({ error: "Only the guest can leave a review" }, { status: 403 });
  }

  const { error } = await supabase.from("reviews").upsert({
    session_id: id,
    reviewer_id: user.id,
    rating: body.rating,
    text: body.text ?? null,
    anonymous: body.anonymous ?? false,
  }, { onConflict: "session_id,reviewer_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
