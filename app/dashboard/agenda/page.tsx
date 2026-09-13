"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "../DashboardShell";
import { tokens } from "@/components/ui/tokens";

const DARK   = "var(--color-gray-900)";
const MUTED  = "var(--color-gray-600)";
const FAINT  = "var(--color-gray-400)";
const LIME = tokens.lime;
const CARD   = "var(--color-bg-white)";
const BEIGE  = "var(--color-gray-100)";
const BORDER = "#E4E2D9";
const RED    = "#D93B3B";
const GREEN  = "#5FAD8E";

type Session = {
  id: string;
  starts_at: string;
  duration: number;
  price: number;
  status: string;
  notes: string | null;
  daily_room_url: string | null;
  guest_id: string;
  guest: { name: string | null; photo_url: string | null } | null;
};

type Participant = { id: string; name: string | null; username: string | null; photo_url: string | null };

// Counterparty profiles come from the session_participants view; the old
// profiles embed through the FK returns null for the browser client.
async function fetchParticipants(
  sb: ReturnType<typeof createClient>, ids: string[],
): Promise<Map<string, Participant>> {
  const map = new Map<string, Participant>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return map;
  const { data } = await sb.from("session_participants").select("id, name, username, photo_url").in("id", unique);
  for (const p of (data ?? []) as Participant[]) map.set(p.id, p);
  return map;
}

function fmtBRL(c: number) {
  return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, photoUrl }: { name?: string | null; photoUrl?: string | null }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return photoUrl ? (
    <img src={photoUrl} alt={name ?? ""} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: MUTED, flexShrink: 0 }}>{initials}</div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  agendada: DARK,
  concluída: GREEN,
  cancelada: RED,
};

function endOf(session: Session) {
  return new Date(session.starts_at).getTime() + session.duration * 60 * 1000;
}

function SessionRow({ session, onCancel }: { session: Session; onCancel: (id: string) => void }) {
  const guestName = session.guest?.name ?? "Guest";
  const canJoin = session.status === "agendada" && endOf(session) > Date.now();
  const canCancel = session.status === "agendada" && new Date(session.starts_at).getTime() > Date.now();

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "16px 20px", background: CARD,
      borderRadius: 12, border: `1px solid ${BORDER}`,
    }}>
      <Avatar name={guestName} photoUrl={session.guest?.photo_url} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{guestName}</p>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{fmtDate(session.starts_at)}</p>
        <p style={{ fontSize: 12, color: FAINT, margin: "2px 0 0" }}>{session.duration} min · {fmtBRL(session.price)}</p>
        {session.notes && (
          <p style={{ fontSize: 12, color: FAINT, margin: "4px 0 0" }}>
            <span style={{ fontStyle: "italic" }}>Mensagem do convidado:</span> {session.notes}
          </p>
        )}
      </div>

      <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[session.status] ?? FAINT, textTransform: "capitalize", flexShrink: 0 }}>
        {session.status}
      </span>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {canJoin && (
          <Link
            href={`/sala/${session.id}`}
            style={{ padding: "7px 14px", borderRadius: 8, background: LIME, color: "#3E3B12", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Entrar
          </Link>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(session.id)}
            style={{ padding: "7px 12px", borderRadius: 8, background: BEIGE, border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { profile } = useDashboard();
  const [upcoming, setUpcoming] = useState<Session[]>([]);
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const sb = createClient();
    const { data } = await sb
      .from("sessions")
      .select("*")
      .eq("mentor_id", profile.id)
      .order("starts_at", { ascending: false });

    const guests = await fetchParticipants(sb, ((data ?? []) as Session[]).map(s => s.guest_id));
    const rows = ((data ?? []) as Session[]).map(s => ({ ...s, guest: guests.get(s.guest_id) ?? null }));
    setUpcoming(rows.filter(s => s.status === "agendada" && endOf(s) > Date.now()));
    setHistory(rows.filter(s => s.status !== "agendada" || endOf(s) <= Date.now()));
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile.id]);

  async function handleCancel(id: string) {
    const confirmed = window.confirm("Cancelar esta sessão?");
    if (!confirmed) return;
    const sb = createClient();
    await sb.from("sessions").update({ status: "cancelada" }).eq("id", id);
    load();
  }

  if (loading) return <p style={{ color: FAINT, fontSize: 14 }}>Carregando...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Próximas */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: "0 0 12px" }}>Próximas</p>
        {upcoming.length === 0 ? (
          <div style={{ padding: "28px 20px", background: BEIGE, borderRadius: 12, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Nenhuma sessão agendada.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map(s => <SessionRow key={s.id} session={s} onCancel={handleCancel} />)}
          </div>
        )}
      </section>

      {/* Histórico */}
      {history.length > 0 && (
        <section>
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: "0 0 12px" }}>Histórico</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map(s => <SessionRow key={s.id} session={s} onCancel={handleCancel} />)}
          </div>
        </section>
      )}
    </div>
  );
}
