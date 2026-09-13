import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SalaClient } from "@/components/sala/SalaClient";

type Props = { params: Promise<{ bookingId: string }> };

const EARLY_ENTRY_MINUTES = Number(process.env.SALA_EARLY_ENTRY_MINUTES ?? "10") || 10;

export default async function SalaPage({ params }: Props) {
  const { bookingId } = await params;

  // ── Auth check ───────────────────────────────────────────────────────────────
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) redirect(`/login?redirect=/sala/${bookingId}`);

  // ── Load session ─────────────────────────────────────────────────────────────
  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("sessions")
    .select(`
      id, mentor_id, guest_id, starts_at, duration, status,
      price, notes,
      daily_room_url, daily_room_name, session_started_at,
      mentor:profiles!sessions_mentor_id_fkey(id, name, last_name, username, photo_url),
      guest:profiles!sessions_guest_id_fkey(id, name, last_name, username, photo_url)
    `)
    .eq("id", bookingId)
    .single();

  if (!session) notFound();

  // ── Participant check ─────────────────────────────────────────────────────────
  const isMentor = session.mentor_id === user.id;
  const isGuest = session.guest_id === user.id;
  if (!isMentor && !isGuest) notFound();

  const persona: "mentor" | "guest" = isMentor ? "mentor" : "guest";

  // ── Cancelled ─────────────────────────────────────────────────────────────────
  if (session.status === "cancelada") {
    redirect(`/explorar`);
  }

  // ── Time window checks ───────────────────────────────────────────────────────
  const now = Date.now();
  const startsMs = new Date(session.starts_at as string).getTime();
  const endsMs = startsMs + (session.duration as number) * 60 * 1000;
  const minutesBefore = (startsMs - now) / 60000;
  const minutesAfter = (now - endsMs) / 60000;

  // Too late: session ended > 60 min ago
  if (minutesAfter > 60 && session.status !== "concluída") {
    return (
      <SalaClient
        session={session as never}
        persona={persona}
        initialScreen="expired"
      />
    );
  }

  // Too early: more than EARLY_ENTRY_MINUTES before start (10 in production;
  // SALA_EARLY_ENTRY_MINUTES lets a demo enter a session booked for later today)
  if (minutesBefore > EARLY_ENTRY_MINUTES) {
    return (
      <SalaClient
        session={session as never}
        persona={persona}
        initialScreen="not-yet"
      />
    );
  }

  // ── Normal: within window ────────────────────────────────────────────────────
  return (
    <SalaClient
      session={session as never}
      persona={persona}
      initialScreen="waiting"
    />
  );
}
