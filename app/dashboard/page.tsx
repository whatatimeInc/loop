"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "./DashboardShell";
import { tokens } from "@/components/ui/tokens";

const DARK   = "#272618";
const MUTED  = "#626053";
const FAINT  = "#AEADA4";
const LIME = tokens.lime;
const CARD   = "#FFFFFF";
const BEIGE  = "#F4F2EB";
const BORDER = "#E4E2D9";
const GREEN  = "#5FAD8E";
const RED    = "#D93B3B";

type Session = {
  id: string;
  starts_at: string;
  duration: number;
  price: number;
  status: string;
  daily_room_url: string | null;
  guest?: { name: string | null; photo_url: string | null };
  mentor?: { name: string | null; username: string | null; photo_url: string | null };
};

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, photoUrl, size = 32 }: { name?: string | null; photoUrl?: string | null; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return photoUrl ? (
    <img src={photoUrl} alt={name ?? ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", background: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: MUTED, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function SessionCard({ session, role }: { session: Session; role: "mentor" | "guest" }) {
  const other = role === "mentor" ? session.guest : session.mentor;
  const otherName = other?.name ?? "—";
  const isPast = new Date(session.starts_at) < new Date();
  const isActive = session.status === "agendada" && !isPast;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORDER}` }}>
      <Avatar name={otherName} photoUrl={(other as any)?.photo_url} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{otherName}</p>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{fmtDate(session.starts_at)} · {session.duration} min · {fmtBRL(session.price)}</p>
      </div>
      {isActive && session.daily_room_url && (
        <a
          href={session.daily_room_url}
          target="_blank"
          rel="noreferrer"
          style={{ padding: "7px 14px", borderRadius: 8, background: LIME, color: "#3E3B12", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}
        >
          Entrar
        </a>
      )}
      {!isActive && (
        <span style={{ fontSize: 12, color: session.status === "cancelada" ? RED : FAINT }}>{session.status}</span>
      )}
    </div>
  );
}

// ─── Mentor Home ──────────────────────────────────────────────────────────────

function MentorHome() {
  const { profile } = useDashboard();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    const sb = createClient();
    sb.from("sessions")
      .select("*, guest:guest_id(name, photo_url)")
      .eq("mentor_id", profile.id)
      .order("starts_at")
      .then(({ data }) => {
        const rows = (data ?? []) as Session[];
        setSessions(rows.filter(s => s.status === "agendada" && new Date(s.starts_at) >= new Date()).slice(0, 3));
        setTotalSessions(rows.filter(s => s.status === "concluída").length);
        setTotalReceived(rows.filter(s => s.status === "concluída").reduce((sum, s) => sum + s.price, 0));
      });
  }, [profile.id]);

  const checklist = [
    { label: "Complete seu perfil",       done: !!(profile.name && profile.username && profile.headline), href: "/dashboard/perfil" },
    { label: "Defina o preço da hora",    done: !!(profile.hourly_price && profile.hourly_price > 0),    href: "/dashboard/pagamentos" },
    { label: "Conecte seu Pix",           done: !!profile.pix_key,                                       href: "/dashboard/pagamentos" },
    { label: "Configure sua agenda",      done: profile.onboarding_completed,                             href: "/dashboard/perfil" },
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const allDone = doneCount === checklist.length;

  const nextSession = sessions[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Próxima sessão", value: nextSession ? fmtDate(nextSession.starts_at) : "—" },
          { label: "Sessões realizadas", value: String(totalSessions) },
          { label: "Total recebido", value: fmtBRL(totalReceived) },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "18px 20px", background: CARD, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Setup checklist */}
      {!allDone && (
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: "0 0 8px" }}>Deixe sua página pronta</p>
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 4 }}>
              {checklist.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < doneCount ? LIME : BEIGE }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: FAINT, margin: "6px 0 0" }}>{doneCount} de {checklist.length} concluídos</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {checklist.map(({ label, done, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 20px", textDecoration: "none",
                  borderBottom: `1px solid ${BORDER}`,
                  opacity: done ? 0.55 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: done ? GREEN : "transparent",
                    border: done ? "none" : `2px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M4 13l6 6 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 14, color: DARK, textDecoration: done ? "line-through" : "none" }}>{label}</span>
                </div>
                {!done && <span style={{ fontSize: 12, color: MUTED }}>Configurar →</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Próximas sessões */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>Próximas sessões</p>
          <Link href="/dashboard/agenda" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Ver agenda →</Link>
        </div>
        {sessions.length === 0 ? (
          <div style={{ padding: "28px 20px", background: BEIGE, borderRadius: 12, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: MUTED, margin: "0 0 4px" }}>Nenhuma sessão agendada</p>
            <p style={{ fontSize: 12, color: FAINT, margin: 0 }}>Quando um guest agendar com você, aparece aqui.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map(s => <SessionCard key={s.id} session={s} role="mentor" />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Guest Home ───────────────────────────────────────────────────────────────

function GuestHome() {
  const { profile } = useDashboard();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const sb = createClient();
    sb.from("sessions")
      .select("*, mentor:mentor_id(name, username, photo_url)")
      .eq("guest_id", profile.id)
      .eq("status", "agendada")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(5)
      .then(({ data }) => setSessions((data ?? []) as Session[]));
  }, [profile.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>Próximas sessões</p>
          <Link href="/dashboard/sessoes" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Ver todas →</Link>
        </div>
        {sessions.length === 0 ? (
          <div style={{ padding: "28px 20px", background: BEIGE, borderRadius: 12, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: MUTED, margin: "0 0 4px" }}>Nenhuma sessão agendada</p>
            <p style={{ fontSize: 12, color: FAINT, margin: 0 }}>Explore mentores e agende sua primeira sessão.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map(s => <SessionCard key={s.id} session={s} role="guest" />)}
          </div>
        )}
      </div>

      {/* CTA become mentor */}
      {!profile.is_mentor && (
        <div style={{ padding: "24px", background: CARD, borderRadius: 12, border: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: DARK, margin: "0 0 6px" }}>Compartilhe seu conhecimento</p>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 16px" }}>Crie seu perfil de mentor e comece a monetizar suas sessões.</p>
          <Link href="/criar" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, background: LIME, color: "#3E3B12", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Torne-se um mentor →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { mode } = useDashboard();
  return mode === "mentor" ? <MentorHome /> : <GuestHome />;
}
