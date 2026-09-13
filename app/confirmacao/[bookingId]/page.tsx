import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_LABEL, getParticipants } from "@/lib/creators";
import { ConfirmacaoFlow, type ConfirmacaoSessao } from "@/components/ConfirmacaoFlow";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ bookingId: string }> };

export default async function ConfirmacaoPage({ params }: Props) {
  const { bookingId } = await params;

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/confirmacao/${bookingId}`)}`);

  // ── Session (RLS: only a participant can read it) ────────────────────────────
  const { data: session } = await supabase
    .from("sessions")
    .select("id, guest_id, mentor_id, starts_at, duration, price, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!session) notFound();
  if (session.guest_id !== user.id && session.mentor_id !== user.id) notFound();

  // Counterparty profiles come from the session_participants view; the old
  // profiles embed through the FK returns null for the viewer's own client.
  // If the participant row is missing, degrade to a generic mentor: the
  // session row is the source of truth, not the profile.
  const mentor = (await getParticipants([session.mentor_id as string])).get(session.mentor_id as string);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "") || "http://localhost:3100";
  const fullName = mentor
    ? [mentor.name, mentor.last_name].filter(Boolean).join(" ") || mentor.username || "Mentor"
    : "Mentor";

  const sessao: ConfirmacaoSessao = {
    id: session.id as string,
    startsAt: session.starts_at as string,
    durationMinutes: session.duration as number,
    priceCents: session.price as number,
    roomUrl: `${siteUrl}/sala/${session.id}`,
    mentor: mentor
      ? {
          name: fullName,
          firstName: mentor.name ?? fullName,
          username: mentor.username ?? "",
          photoUrl: mentor.photo_url,
          category: mentor.area ? AREA_LABEL[mentor.area] ?? null : null,
        }
      : { name: "Mentor", firstName: "seu mentor", username: "", photoUrl: null, category: null },
  };

  return <ConfirmacaoFlow session={sessao} />;
}
