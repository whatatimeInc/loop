import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_LABEL, getParticipants } from "@/lib/creators";
import { cancelDeadlineHours, cancelState } from "@/lib/cancel-window";
import { AgendaClient, type AgendaSessao } from "./AgendaClient";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  starts_at: string;
  duration: number;
  price: number;
  status: string;
  mentor_id: string;
};

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/agenda");

  // RLS ("sessions_read_participant") scopes this to the signed-in guest.
  const { data: rows } = await supabase
    .from("sessions")
    .select("id, starts_at, duration, price, status, mentor_id")
    .eq("guest_id", user.id)
    .order("starts_at", { ascending: false });

  // Counterparty profiles come from the session_participants view; the old
  // profiles embed through the FK returns null now that profiles has no
  // counterparty row policy. Keep the session visible and degrade the mentor
  // fields rather than dropping a booking.
  const mentors = await getParticipants(
    ((rows ?? []) as unknown as SessionRow[]).map((row) => row.mentor_id),
  );

  // The guest's own ratings, so a concluded session shows stars instead of "Avaliar".
  const { data: reviews } = await supabase
    .from("reviews")
    .select("session_id, rating")
    .eq("reviewer_id", user.id);

  const ratingBySession = new Map<string, number>();
  for (const r of (reviews ?? []) as { session_id: string; rating: number }[]) {
    ratingBySession.set(r.session_id, r.rating);
  }

  // Decided here with the server clock, so a skewed browser clock can neither
  // hide the button nor offer it; the cancel route re-checks anyway.
  const deadlineHours = cancelDeadlineHours();
  const now = Date.now();

  const sessoes: AgendaSessao[] = ((rows ?? []) as unknown as SessionRow[]).map((row) => {
    const mentor = mentors.get(row.mentor_id);
    return {
      // Same verdict the route gives: the deadline binds the guest only, and a
      // self-booked row (the viewer is also the mentor) keeps the mentor's freedom.
      cancelavel:
        row.status === "agendada" &&
        (row.mentor_id === user.id ||
          cancelState({ status: row.status, startsAt: row.starts_at }, now, deadlineHours) === "cancellable"),
      id: row.id,
      startsAt: row.starts_at,
      durationMinutes: row.duration,
      priceCents: row.price,
      status: row.status,
      mentorName: [mentor?.name, mentor?.last_name].filter(Boolean).join(" ") || mentor?.username || "Mentor",
      mentorUsername: mentor?.username ?? "",
      mentorPhotoUrl: mentor?.photo_url ?? null,
      mentorCategory: mentor?.area ? AREA_LABEL[mentor.area] ?? null : null,
      myRating: ratingBySession.get(row.id) ?? null,
    };
  });

  return <AgendaClient sessoes={sessoes} cancelDeadlineHours={deadlineHours} />;
}
