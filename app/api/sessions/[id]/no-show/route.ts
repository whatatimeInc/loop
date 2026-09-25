// POST /api/sessions/[id]/no-show
// The participant who waited records that the other one did not show: the
// session becomes mentor_no_show or guest_no_show. Accepted only against the
// other party, only while the session is still scheduled, and only once the
// grace after the start is over (lib/no-show.ts).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { noShowDecision, noShowOpensAt } from "@/lib/no-show";

// no_show_by is WHO DID NOT SHOW, not who is reporting.
const Body = z.object({ no_show_by: z.union([z.literal("mentor"), z.literal("guest")]) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Service-role client: RLS does not apply, participation is checked below.
  const supabase = createServiceClient();

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select("id, mentor_id, guest_id, starts_at, status")
    .eq("id", id)
    .maybeSingle();
  // A database failure is a 500, never the 404 that masks non-participants.
  if (sessionErr) return NextResponse.json({ error: "Could not read the session" }, { status: 500 });

  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Participation first: a non-participant learns nothing about the body rules.
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "no_show_by must be mentor or guest" }, { status: 400 });
  }
  const accused = parsed.data.no_show_by;

  const decision = noShowDecision({
    status: session.status as string,
    startsAt: session.starts_at as string,
    now: Date.now(),
    callerPersona: isMentor ? "mentor" : "guest",
    accused,
  });
  if (decision === "not-counterpart") {
    return NextResponse.json({ error: "Only the other participant can be marked absent", state: decision }, { status: 403 });
  }
  if (decision === "not-scheduled") {
    return NextResponse.json({ error: "Session is not scheduled", state: decision, status: session.status }, { status: 409 });
  }
  if (decision === "too-early") {
    const opensAt = noShowOpensAt(session.starts_at as string);
    return NextResponse.json(
      { error: "Too early to mark a no-show", state: decision, opens_at: Number.isFinite(opensAt) ? new Date(opensAt).toISOString() : null },
      { status: 409 },
    );
  }

  // Conditional at write time: two participants accusing each other at once,
  // or a no-show racing the end of the call, cannot both win.
  const status = accused === "mentor" ? "mentor_no_show" : "guest_no_show";
  const { data: updated, error: updErr } = await supabase
    .from("sessions")
    .update({ status, no_show_by: accused, session_ended_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "agendada")
    .select("id, status");
  if (updErr) return NextResponse.json({ error: "Could not record the no-show" }, { status: 500 });

  if (!updated || updated.length === 0) {
    const { data: now, error: rereadErr } = await supabase
      .from("sessions")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (rereadErr) return NextResponse.json({ error: "Could not read the session" }, { status: 500 });
    return NextResponse.json(
      { error: "Session is not scheduled", state: "not-scheduled", status: now?.status ?? null },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, status });
}
