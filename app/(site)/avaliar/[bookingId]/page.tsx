import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getParticipants } from "@/lib/creators";
import { RatingFlow, type RatingSessao } from "@/components/RatingFlow";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ bookingId: string }> };

export default async function AvaliarPage({ params }: Props) {
  const { bookingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/avaliar/${bookingId}`)}`);

  const { data: session } = await supabase
    .from("sessions")
    .select("id, guest_id, mentor_id, starts_at, duration")
    .eq("id", bookingId)
    .maybeSingle();

  if (!session) notFound();
  // Only the guest reviews the mentor.
  if (session.guest_id !== user.id) notFound();
  // Only finished sessions can be reviewed (a URL guessed from /agenda must not
  // let a guest publish a review for a session that has not happened yet).
  const endsMs = new Date(session.starts_at as string).getTime() + (session.duration as number) * 60_000;
  if (endsMs > Date.now()) redirect("/agenda");

  // Counterparty profiles come from the session_participants view; the old
  // profiles embed through the FK returns null for the viewer's own client.
  const mentor = (await getParticipants([session.mentor_id as string])).get(session.mentor_id as string);
  if (!mentor) notFound();

  const fullName = [mentor.name, mentor.last_name].filter(Boolean).join(" ") || mentor.username || "Mentor";

  const sessao: RatingSessao = {
    id: session.id as string,
    mentorName: fullName,
    mentorFirstName: mentor.name ?? fullName,
    mentorUsername: mentor.username ?? "",
    mentorPhotoUrl: mentor.photo_url,
    durationMinutes: session.duration as number,
    startsAt: session.starts_at as string,
  };

  return <RatingFlow session={sessao} />;
}
