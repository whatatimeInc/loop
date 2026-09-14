import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SalaClient } from "@/components/sala/SalaClient";
import { ENTERABLE_STATUSES, earlyEntryMinutes, entryState, entryWindow } from "@/lib/sala-window";

type Props = { params: Promise<{ bookingId: string }> };

export default async function SalaPage({ params }: Props) {
  const { bookingId } = await params;

  // ── Auth check: the session cookie is verified with Supabase here, not just
  // by name at the edge (proxy.ts). Unauthenticated visitors go to login and
  // come back to this room afterwards. ─────────────────────────────────────────
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

  // ── Participant check: only the mentor and the guest of THIS session may
  // see it. Anyone else gets the same 404 as a session that does not exist. ──
  const isMentor = !!session && session.mentor_id === user.id;
  const isGuest = !!session && session.guest_id === user.id;
  if (!session || (!isMentor && !isGuest)) notFound();

  const persona: "mentor" | "guest" = isMentor ? "mentor" : "guest";

  // ── Statuses that can no longer be entered ───────────────────────────────────
  if (session.status === "cancelada") redirect(`/explorar`);
  if (!ENTERABLE_STATUSES.has(session.status as string)) {
    // mentor_no_show / guest_no_show: the session was resolved without a call
    return <SalaClient session={session as never} persona={persona} initialScreen="expired" />;
  }

  // ── Time window: the same rule the token API applies ─────────────────────────
  const early = earlyEntryMinutes();
  const state = entryState(entryWindow(session.starts_at as string, session.duration as number, early), Date.now());

  if (state === "expired") {
    // A finished session shows its wrap-up screen instead of a dead waiting room.
    const screen = session.status === "concluída" ? "post-call" : "expired";
    return <SalaClient session={session as never} persona={persona} initialScreen={screen} />;
  }
  if (state === "too-early") {
    return <SalaClient session={session as never} persona={persona} initialScreen="not-yet" earlyEntryMinutes={early} />;
  }

  // ── Normal: within window ────────────────────────────────────────────────────
  return (
    <SalaClient
      session={session as never}
      persona={persona}
      initialScreen="waiting"
      earlyEntryMinutes={early}
    />
  );
}
