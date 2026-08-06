"use client";

import { useState } from "react";
import { tokens } from "@/components/ui/tokens";

const INTERESTS = [
  { value: "career_business",    label: "Carreira e Negócios" },
  { value: "health_wellness",    label: "Saúde e Bem-Estar" },
  { value: "creativity_art",     label: "Criatividade e Arte" },
  { value: "fashion_style",      label: "Moda e Estilo" },
  { value: "home_architecture",  label: "Casa e Arquitetura" },
  { value: "gastronomy",         label: "Gastronomia" },
  { value: "other",              label: "Outro" },
] as const;

type Interest = typeof INTERESTS[number]["value"];

type Props = {
  referralCode?: string;
};

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 8,
  border: "1px solid #E0DDC1",
  background: "#fff",
  fontSize: 15,
  color: "#272518",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export function WaitlistForm({ referralCode }: Props) {
  const [email, setEmail]         = useState("");
  const [name, setName]           = useState("");
  const [interest, setInterest]   = useState<Interest | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name || !interest) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/waitlist/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, interest, ref: referralCode }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Algo deu errado. Tente novamente.");
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #E0DDC1",
          borderRadius: 12,
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: tokens.lime,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5 11l4 4 8-8" stroke="#272518" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#272518", marginBottom: 6 }}>
          Você está na lista!
        </p>
        <p style={{ fontSize: 14, color: "#626053" }}>
          Enviamos um e-mail para <strong>{email}</strong> com o link da sua posição.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Seu nome"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={INPUT}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#272518")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E0DDC1")}
        />
        <input
          type="email"
          placeholder="Seu e-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={INPUT}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#272518")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E0DDC1")}
        />

        {/* Interest selector */}
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterest(value)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: interest === value ? tokens.lime : "#E0DDC1",
                color: "#272518",
                fontSize: 13,
                fontWeight: interest === value ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#EF4444" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !email || !name || !interest}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 8,
          border: "none",
          background: email && name && interest ? "#272518" : "#E0DDC1",
          color: email && name && interest ? "#FCFBF8" : "#807F71",
          fontSize: 15,
          fontWeight: 600,
          cursor: email && name && interest ? "pointer" : "not-allowed",
          transition: "all 0.18s",
        }}
      >
        {submitting ? "Entrando na lista…" : "Entrar na lista de espera"}
      </button>

      {referralCode && (
        <p style={{ fontSize: 12, color: "#807F71", textAlign: "center" }}>
          Você foi convidado(a) por um membro da lista.
        </p>
      )}
    </form>
  );
}
