"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { SessionData, Persona } from "./types";

// ── helpers ───────────────────────────────────────────────────────────────────

function Avatar({ profile, size = 80 }: {
  profile: SessionData["mentor"] | SessionData["guest"];
  size?: number;
}) {
  const initials = [profile.name, profile.last_name]
    .filter(Boolean).map((s) => s![0].toUpperCase()).join("").slice(0, 2) || "?";
  return profile.photo_url ? (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "3px solid rgba(255,255,255,0.12)" }}>
      <Image src={profile.photo_url} alt={profile.name ?? ""} width={size} height={size} style={{ objectFit: "cover" }} />
    </div>
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "#EAEA68", border: "3px solid rgba(255,255,255,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
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

function formatMmSs(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatScheduledTime(isoStr: string) {
  const d = new Date(isoStr);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", timeZone: tz });
  const tzLabel = d.toLocaleTimeString("pt-BR", { timeZoneName: "short", timeZone: tz }).split(" ").pop() ?? "";
  return `${time} · ${date} · ${tzLabel}`;
}

// ── Device check indicator ────────────────────────────────────────────────────

function DeviceStatus() {
  const [mic, setMic] = useState<"checking" | "ok" | "error">("checking");
  const [cam, setCam] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setMic("ok"); setCam("ok");
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") { setMic("error"); setCam("error"); }
        else { setMic("error"); setCam("error"); }
      });
  }, []);

  const dot = (status: "checking" | "ok" | "error") =>
    status === "ok" ? "#68A279" : status === "error" ? "#C0392B" : "#807F71";

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(mic), display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#807F71" }}>
          {mic === "checking" ? "Verificando mic..." : mic === "ok" ? "Microfone ativo" : "Mic sem permissão"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(cam), display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#807F71" }}>
          {cam === "checking" ? "Verificando câmera..." : cam === "ok" ? "Câmera ativa" : "Câmera sem permissão"}
        </span>
      </div>
    </div>
  );
}

// ── WaitingRoom ───────────────────────────────────────────────────────────────

export function WaitingRoom({
  session,
  persona,
  otherJoined,
  onEnter,
}: {
  session: SessionData;
  persona: Persona;
  otherJoined: boolean;
  onEnter: () => void;
}) {
  const other = persona === "mentor" ? session.guest : session.mentor;
  const startsMs = new Date(session.starts_at).getTime();
  const diff = useCountdown(startsMs);
  const canEnter = diff === 0 || otherJoined;

  // Private note — localStorage only, cleared after session ends
  const storageKey = `looptalk_note_${session.id}`;
  const [note, setNote] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(storageKey) ?? "";
  });
  const saveNote = (v: string) => {
    setNote(v);
    localStorage.setItem(storageKey, v);
  };

  const sessionLabel = `Conversa de ${session.duration} min`;
  const tip = persona === "guest"
    ? `Tenha suas perguntas em mente. Você tem ${session.duration} minutos.`
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#1A1A1A", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 24px",
      fontFamily: "Inter, sans-serif", color: "#F0EFEB", position: "relative",
    }}>
      {/* Wordmark */}
      <div style={{ position: "absolute", bottom: 24, left: 24, opacity: 0.3, fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#F0EFEB" }}>
        LOOP.TALK
      </div>

      <div style={{ maxWidth: 420, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {/* Other participant info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Avatar profile={other} size={80} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#807F71", margin: "0 0 4px" }}>
              {persona === "mentor" ? "Convidado" : "Host"}
            </p>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#F0EFEB", margin: 0 }}>{fullName(other)}</p>
          </div>
        </div>

        {/* Session info */}
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px", width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#F0EFEB", margin: 0 }}>{sessionLabel}</p>
          <p style={{ fontSize: 13, color: "#807F71", margin: 0 }}>{formatScheduledTime(session.starts_at)}</p>

          {/* Countdown */}
          {diff > 0 && (
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <p style={{ fontSize: 11, color: "#807F71", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>começa em</p>
              <p style={{ fontSize: 36, fontWeight: 700, fontFamily: "monospace", color: "#F0EFEB", margin: 0 }}>
                {formatMmSs(diff)}
              </p>
            </div>
          )}

          {otherJoined && diff > 0 && (
            <p style={{ fontSize: 13, color: "#68A279", margin: 0, textAlign: "center" }}>
              {fullName(other)} já está na sala — você pode entrar agora.
            </p>
          )}
        </div>

        {/* Device status */}
        <DeviceStatus />

        {/* Contextual tip (guest only) */}
        {tip && (
          <p style={{ fontSize: 13, color: "#807F71", textAlign: "center", margin: 0 }}>{tip}</p>
        )}

        {/* Private note (mentor only, or always) */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#807F71", letterSpacing: 0.3 }}>
            Nota privada (só você vê)
          </label>
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            rows={3}
            placeholder="Anotações para esta sessão..."
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "10px 12px", color: "#F0EFEB", fontSize: 14,
              resize: "none", fontFamily: "Inter, sans-serif", outline: "none", width: "100%", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          disabled={!canEnter}
          style={{
            width: "100%", padding: "14px 24px",
            background: canEnter ? "#EAEA68" : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: 8,
            color: canEnter ? "#272618" : "#807F71",
            fontSize: 16, fontWeight: 700, cursor: canEnter ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Entrar na sala
        </button>
      </div>
    </div>
  );
}
