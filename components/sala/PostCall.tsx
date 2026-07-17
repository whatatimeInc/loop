"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SessionData, Persona } from "./types";

// ── shared helpers ─────────────────────────────────────────────────────────────

function Avatar({ profile, size = 64 }: {
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
      background: "#EAEA68", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#272618",
    }}>{initials}</div>
  );
}

function fullName(p: SessionData["mentor"] | SessionData["guest"]) {
  return [p.name, p.last_name].filter(Boolean).join(" ") || "Usuário";
}

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: 32, color: (hovered || value) >= n ? "#F5C518" : "#DAD9D5",
            lineHeight: 1, transition: "color 0.1s",
          }}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── POST-CALL: HOST VIEW ──────────────────────────────────────────────────────

export function PostCallMentor({ session, actualMinutes }: { session: SessionData; actualMinutes: number }) {
  const [copied, setCopied] = useState(false);
  // Earnings from price field (stored in centavos)
  const grossCents = (session as unknown as { price?: number }).price ?? 0;
  const feeCents = Math.round(grossCents * 0.2);
  const netCents = grossCents - feeCents;

  function formatBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function copyProfile() {
    const url = `loop.talk/${session.mentor.username ?? ""}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Next Friday
  const nextFriday = (() => {
    const d = new Date();
    const day = d.getDay();
    const daysUntil = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntil);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#F4F2EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 440, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Session summary */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #DAD9D5", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar profile={session.guest} size={52} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#181D27", margin: 0 }}>{fullName(session.guest)}</p>
              <p style={{ fontSize: 13, color: "#807F71", margin: "2px 0 0" }}>
                Você conversou por {actualMinutes} minutos
              </p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        {grossCents > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #DAD9D5" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#807F71", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.5 }}>Seus ganhos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#181D27" }}>Valor bruto</span>
                <span style={{ fontSize: 14, color: "#181D27" }}>{formatBRL(grossCents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#807F71" }}>Taxa da plataforma (20%)</span>
                <span style={{ fontSize: 14, color: "#807F71" }}>−{formatBRL(feeCents)}</span>
              </div>
              <div style={{ height: 1, background: "#DAD9D5", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#181D27" }}>Valor líquido</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#181D27" }}>{formatBRL(netCents)}</span>
              </div>
              <p style={{ fontSize: 12, color: "#807F71", margin: "4px 0 0" }}>Repasse na próxima sexta · {nextFriday}</p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "14px 24px", background: "#272618", borderRadius: 8,
            color: "#FCFBF8", fontSize: 15, fontWeight: 700, textDecoration: "none",
          }}>
            Ir para o painel
          </Link>
          <button onClick={copyProfile} style={{
            padding: "12px 24px", background: "transparent", border: "1px solid #DAD9D5",
            borderRadius: 8, color: "#272618", fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>
            {copied ? "Copiado!" : "Compartilhar meu perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── POST-CALL: GUEST VIEW ─────────────────────────────────────────────────────

export function PostCallGuest({
  session,
  actualMinutes,
  onReviewSubmitted,
}: {
  session: SessionData;
  actualMinutes: number;
  onReviewSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const showDone = submitted || skipped;

  const mentorName = fullName(session.mentor);

  async function submitReview() {
    if (!rating) return;
    setLoading(true);
    try {
      await fetch(`/api/sessions/${session.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text: text.trim() || null }),
      });
      setSubmitted(true);
      onReviewSubmitted();
    } finally {
      setLoading(false);
    }
  }

  function copyHostProfile() {
    const url = `loop.talk/${session.mentor.username ?? ""}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F2EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 440, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Session summary */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #DAD9D5", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar profile={session.mentor} size={52} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#181D27", margin: 0 }}>{mentorName}</p>
              <p style={{ fontSize: 13, color: "#807F71", margin: "2px 0 0" }}>
                Você conversou por {actualMinutes} minutos
              </p>
            </div>
          </div>
        </div>

        {/* Rating or done state */}
        {!showDone ? (
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #DAD9D5", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#181D27", margin: 0 }}>Como foi a sessão?</p>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Deixe um comentário (opcional)"
                style={{
                  border: "1px solid #DAD9D5", borderRadius: 8, padding: "10px 12px",
                  fontSize: 14, color: "#181D27", resize: "none", fontFamily: "Inter, sans-serif",
                  outline: "none", width: "100%", boxSizing: "border-box",
                }}
              />
            )}
            <button
              onClick={submitReview}
              disabled={!rating || loading}
              style={{
                padding: "12px 24px", background: rating ? "#272618" : "#DAD9D5",
                border: "none", borderRadius: 8, color: rating ? "#FCFBF8" : "#807F71",
                fontSize: 15, fontWeight: 700, cursor: rating ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Enviando..." : "Enviar avaliação"}
            </button>
            <button
              onClick={() => setSkipped(true)}
              style={{ background: "none", border: "none", color: "#807F71", fontSize: 13, cursor: "pointer", padding: 0 }}
            >
              Avaliar depois
            </button>
          </div>
        ) : (
          submitted && (
            <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 12, padding: "16px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#2E7D32", margin: 0 }}>Avaliação enviada. Obrigado!</p>
            </div>
          )
        )}

        {/* CTAs (always shown after interaction) */}
        {showDone && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {session.mentor.username && (
              <Link href={`/${session.mentor.username}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "14px 24px", background: "#272618", borderRadius: 8,
                color: "#FCFBF8", fontSize: 15, fontWeight: 700, textDecoration: "none",
              }}>
                Agendar novamente com {session.mentor.name}
              </Link>
            )}
            <button onClick={copyHostProfile} style={{
              padding: "12px 24px", background: "transparent", border: "1px solid #DAD9D5",
              borderRadius: 8, color: "#272618", fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>
              {copiedHost ? "Copiado!" : `Compartilhar ${session.mentor.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
