// /api/sessions/[id]/extensions
// POST records a time-extension request: the requester is whoever calls, never
// a body field, and only one request may be pending per session (checked here
// and enforced by the partial unique index time_extensions_one_pending).
// GET lists the session's requests, so a requester left without an answer can
// reconcile against the database instead of staying on "pending" forever.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extensionAllowance } from "@/lib/extensions";

const Body = z.object({
  minutes_added: z.union([z.literal(5), z.literal(10), z.literal(15)]),
});

const EXT_COLUMNS = "id, requested_by, minutes_added, status, created_at";

type Ctx = { params: Promise<{ id: string }> };

/** Loads the session for a participant; a non-participant sees a 404, a DB failure a 500. */
async function loadForParticipant(id: string) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const supabase = createServiceClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, mentor_id, guest_id, status")
    .eq("id", id)
    .maybeSingle();
  if (error) return { response: NextResponse.json({ error: "Could not read the session" }, { status: 500 }) };

  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) {
    return { response: NextResponse.json({ error: "Session not found" }, { status: 404 }) };
  }
  return { supabase, session, persona: isMentor ? ("mentor" as const) : ("guest" as const) };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const loaded = await loadForParticipant(id);
  if ("response" in loaded) return loaded.response;
  const { data, error } = await loaded.supabase
    .from("time_extensions")
    .select(EXT_COLUMNS)
    .eq("session_id", id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, extensions: data ?? [] });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  // Auth and participation first, like the respond route: an anonymous
  // caller learns nothing about the body rules.
  const loaded = await loadForParticipant(id);
  if ("response" in loaded) return loaded.response;
  const { supabase, session, persona } = loaded;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "minutes_added must be 5, 10, or 15" }, { status: 400 });
  }

  if (session.status !== "agendada") {
    return NextResponse.json({ error: "Session is not running", state: "not-scheduled" }, { status: 409 });
  }

  const pendingConflict = async () => {
    const { data: rows, error } = await supabase
      .from("time_extensions")
      .select(EXT_COLUMNS)
      .eq("session_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // A pending row wins over the cap: the caller must learn about it (and
    // possibly answer it) even when their own request would not fit.
    // Newest first: should more than one pending row ever exist (rows older
    // than the unique index), the one a client is most likely showing wins.
    const pending = (rows ?? [])
      .filter((r) => r.status === "pending")
      .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
    if (pending.length === 0) {
      // The entry token cannot be swapped on a live call, so the total
      // extension a session may reach is capped (see MAX_EXTENSION_MINUTES).
      if (extensionAllowance(rows ?? [], parsed.data.minutes_added) === "limit-reached") {
        return NextResponse.json({ error: "Extension limit reached", state: "limit-reached" }, { status: 409 });
      }
      return null;
    }
    // The pending row is returned whole, so a client that lost the original
    // 201 can still tell the other side about it with the real id.
    return NextResponse.json(
      { error: "A request is already pending", state: "pending-exists", ext: pending[0] },
      { status: 409 },
    );
  };

  // Two attempts: 23505 (unique_violation on time_extensions_one_pending)
  // means a concurrent request won the race between the check and the insert.
  // Usually that row is still pending and is returned as the conflict; if it
  // was already answered in between, the second attempt simply succeeds.
  for (let attempt = 0; attempt < 2; attempt++) {
    const conflict = await pendingConflict();
    if (conflict) return conflict;

    const { data: ext, error } = await supabase
      .from("time_extensions")
      .insert({ session_id: id, requested_by: persona, minutes_added: parsed.data.minutes_added, status: "pending" })
      .select(EXT_COLUMNS)
      .single();
    if (!error && ext) return NextResponse.json({ ok: true, ext }, { status: 201 });
    if (error?.code !== "23505") {
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Another request is being recorded, try again", state: "conflict" }, { status: 409 });
}
