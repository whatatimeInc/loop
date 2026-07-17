// POST /api/sessions
// Creates a session in the DB and provisions a Daily.co room.
// Called at booking confirmation time.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createDailyRoom } from "@/lib/daily";

export async function POST(request: NextRequest) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { mentor_id, starts_at, duration, price } = body as {
    mentor_id: string;
    starts_at: string;
    duration: number;
    price: number;
  };

  if (!mentor_id || !starts_at || !duration || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (![30, 45, 60].includes(duration)) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Insert session first to get the UUID
  const { data: session, error: insertErr } = await supabase
    .from("sessions")
    .insert({
      guest_id: user.id,
      mentor_id,
      starts_at,
      duration,
      price,
      status: "agendada",
    })
    .select("id")
    .single();

  if (insertErr || !session) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  // Room expires 90 min after session end
  const startsMs = new Date(starts_at).getTime();
  const roomExpiry = new Date(startsMs + (duration + 90) * 60 * 1000);

  let daily_room_url: string | null = null;
  let daily_room_name: string | null = null;

  try {
    const room = await createDailyRoom(session.id, roomExpiry);
    daily_room_url = room.url;
    daily_room_name = room.name;

    await supabase
      .from("sessions")
      .update({ daily_room_url, daily_room_name })
      .eq("id", session.id);
  } catch (e) {
    // Room creation is best-effort in dev when DAILY_CO_API_KEY is absent.
    // Session is still created; room can be attached later.
    console.error("Daily.co room creation failed:", e);
  }

  return NextResponse.json({ id: session.id, daily_room_url, daily_room_name }, { status: 201 });
}
