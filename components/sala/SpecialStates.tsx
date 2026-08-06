"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SessionData, Persona } from "./types";
import { tokens } from "@/components/ui/tokens";

// ── shared helpers ─────────────────────────────────────────────────────────────

function Avatar({ profile, size = 80 }: {
  profile: SessionData["mentor"] | SessionData["guest"];
  size?: number;
}) {
  const initials = [profile.name, profile.last_name]
    .filter(Boolean).map((s) => s![0].toUpperCase()).join("").slice(0, 2) || "?";
  return profile.photo_url ? (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
      <Image src={profile.photo_url} alt={profile.name ?? ""} width={size} height={size} style={{ objectFit: "cover" }} />
    </div>
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: tokens.lime, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#272618",
    }}>{initials}</div>
  );
}

function fullName(p: SessionData["mentor"] | SessionData["guest"]) {
  return [p.name, p.last_name].filter(Boolean).join(" ") || "Usuário";
}

function useCountdown(targetMs: number) {
  const [diff, setDiff] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(t);
  }, [targetMs]);
  return diff;
}

function formatHHMM(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Screen: not yet ────────────────────────────────────────────────────────────

export function NotYetScreen({ session, persona }: { session: SessionData; persona: Persona }) {
  const other = persona === "mentor" ? session.guest : session.mentor;
  const startsMs = new Date(session.starts_at).getTime();
  const diff = useCountdown(startsMs);
  const tenMinBefore = startsMs - 10 * 60 * 1000;
  const diffToWindow = useCountdown(tenMinBefore);

  return (
    <div style={{ minHeight: "100vh", background: "#F4F2EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Avatar profile={other} size={80} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 14, color: "#807F71", margin: 0 }}>Sua sessão com</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: "#181D27", margin: 0 }}>{fullName(other)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", width: "100%", border: "1px solid #DAD9D5" }}>
          <p style={{ fontSize: 13, color: "#807F71", margin: "0 0 8px" }}>começa em</p>
          <p style={{ fontSize: 40, fontWeight: 700, color: "#181D27", margin: "0 0 16px", fontFamily: "monospace" }}>
            {formatHHMM(diff)}
          </p>
          <p style={{ fontSize: 13, color: "#807F71", margin: 0 }}>
            O link ficará disponível 10 minutos antes do início.
            {diffToWindow > 0 && (
              <> <strong style={{ color: "#181D27" }}>({formatHHMM(diffToWindow)})</strong></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Screen: expired ────────────────────────────────────────────────────────────

export function ExpiredScreen({ session, persona }: { session: SessionData; persona: Persona }) {
  const other = persona === "mentor" ? session.guest : session.mentor;
  return (
    <div style={{ minHeight: "100vh", background: "#F4F2EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Avatar profile={other} size={64} />
        <div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#181D27", margin: "0 0 8px" }}>Esta sessão já foi encerrada.</p>
          <p style={{ fontSize: 14, color: "#807F71", margin: 0 }}>O link expirou após o término da sessão.</p>
        </div>
        {other.username && (
          <Link href={`/${other.username}`} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "12px 24px", background: "#272618", borderRadius: 8,
            color: "#FCFBF8", fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}>
            Agendar uma nova sessão
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Screen: no-show (mentor didn't join) ───────────────────────────────────────

export function NoShowMentorScreen({
  session,
  onLeave,
}: {
  session: SessionData;
  onLeave: () => void;
}) {
  const GRACE_MS = 15 * 60 * 1000;
  const graceEnd = new Date(session.starts_at).getTime() + GRACE_MS;
  const diff = useCountdown(graceEnd);
  const graceOver = diff === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#1A1A1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif", color: "#F0EFEB" }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Avatar profile={session.mentor} size={80} />
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>Seu host ainda não entrou</p>
          <p style={{ fontSize: 14, color: "#807F71", margin: 0 }}>Estamos aguardando. Imprevistos acontecem.</p>
        </div>
        {!graceOver ? (
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px", width: "100%" }}>
            <p style={{ fontSize: 13, color: "#807F71", margin: "0 0 6px" }}>
              Se ele não entrar em
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "monospace", margin: "0 0 6px" }}>
              {formatHHMM(diff)}
            </p>
            <p style={{ fontSize: 13, color: "#807F71", margin: 0 }}>
              você receberá o reembolso total.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <p style={{ fontSize: 14, color: "#807F71", margin: 0 }}>
              Você receberá o reembolso total em até 5 dias úteis.
            </p>
            <button
              onClick={onLeave}
              style={{
                padding: "12px 24px", background: "rgba(192,57,43,0.85)", border: "none",
                borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen: no-show (guest didn't join) ───────────────────────────────────────

export function NoShowGuestScreen({
  session,
  onMarkNoShow,
}: {
  session: SessionData;
  onMarkNoShow: () => void;
}) {
  const GRACE_MS = 15 * 60 * 1000;
  const graceEnd = new Date(session.starts_at).getTime() + GRACE_MS;
  const diff = useCountdown(graceEnd);
  const graceOver = diff === 0;
  const [confirming, setConfirming] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#1A1A1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif", color: "#F0EFEB" }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Avatar profile={session.guest} size={80} />
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>{[session.guest.name, session.guest.last_name].filter(Boolean).join(" ")} ainda não entrou</p>
        </div>
        {!graceOver ? (
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px", width: "100%" }}>
            <p style={{ fontSize: 13, color: "#807F71", margin: "0 0 6px" }}>Você pode encerrar como não comparecimento em</p>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "monospace", margin: 0 }}>
              {formatHHMM(diff)}
            </p>
          </div>
        ) : (
          <>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  padding: "12px 24px", background: "rgba(192,57,43,0.85)", border: "none",
                  borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%",
                }}
              >
                Encerrar como no-show
              </button>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px", width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 14, margin: 0 }}>Confirmar que o convidado não compareceu?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#F0EFEB", cursor: "pointer" }}>Cancelar</button>
                  <button onClick={onMarkNoShow} style={{ flex: 1, padding: "10px", background: "#C0392B", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Screen: connection lost ────────────────────────────────────────────────────

export function ConnectionLostScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", color: "#F0EFEB", gap: 20,
    }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#F0EFEB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Reconectando...</p>
      <p style={{ fontSize: 14, color: "#807F71", margin: 0 }}>A chamada será retomada automaticamente.</p>
      <button
        onClick={onRetry}
        style={{ marginTop: 8, padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#F0EFEB", fontSize: 14, cursor: "pointer" }}
      >
        Tentar novamente
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
