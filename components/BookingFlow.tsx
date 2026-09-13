"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Creator, Offer } from "@/lib/creators";
import { zonedToUtc } from "@/lib/slots";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

// ─── tokens ───────────────────────────────────────────────────────────────────

const DARK      = "#272518";
const PANEL_BG  = "var(--color-bg-white)";
const PANEL_BDR = "var(--color-olive-100)";
const LIME = tokens.lime;
const BEIGE_BG  = "var(--color-gray-100)";
const BEIGE_MID = "var(--color-olive-100)";
const BEIGE_CRD = "var(--color-cream)";
const TXT_DARK  = "#272518";
const TXT_MUTED = "var(--color-gray-500)";
const TXT_LIGHT = "var(--color-cream)";
const CARD_BG   = "var(--color-bg-white)";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DIAS_HDR  = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MESES     = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CRT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
function dataLonga(d: Date) {
  const dia = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
  return `${dia}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
/** "YYYY-MM-DD" from a Date's LOCAL y/m/d — never toISOString(), it shifts the day. */
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// ─── animation ────────────────────────────────────────────────────────────────

const slideV = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};
const slideT = { duration: 0.28, ease: "easeInOut" as const };

// ─── PainelResumo ─────────────────────────────────────────────────────────────

function PainelResumo({ creator, offer, data, horario }: {
  creator: Creator; offer: Offer;
  data: Date | null;
  horario: string | null;
}) {
  const total = offer.priceCents / 100;

  const rows = [
    { label: "Duração", value: `${offer.durationMinutes} min` },
    { label: "Data",    value: data ? `${data.getDate()} de ${MESES_CRT[data.getMonth()]}` : null },
    { label: "Horário", value: horario || null },
  ];

  return (
    <div style={{
      background: PANEL_BG,
      border: `1px solid ${PANEL_BDR}`,
      borderRadius: 10,
      width: 300,
      flexShrink: 0,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      position: "sticky",
      top: 112,
    }}>
      {/* Creator */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <div style={{
          position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: LIME, fontSize: 24, fontWeight: 700, color: TXT_DARK,
        }}>
          {creator.photoUrl ? (
            <img src={creator.photoUrl} alt={creator.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          ) : (
            initials(creator.name)
          )}
        </div>
        <div>
          <p style={{ color: TXT_DARK, fontSize: 16, fontWeight: 600 }}>{creator.name}</p>
          {creator.category && (
            <span style={{
              display: "inline-block", marginTop: 6, background: BEIGE_BG,
              borderRadius: 4, padding: "4px 10px", fontSize: 12, color: TXT_MUTED,
            }}>
              {creator.category}
            </span>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div style={{ borderTop: `1px solid ${PANEL_BDR}`, paddingTop: 20 }}>
        <p style={{ color: TXT_MUTED, fontSize: 11, fontWeight: 600, marginBottom: 14, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Resumo
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: TXT_MUTED, fontSize: 13 }}>{label}</span>
              <motion.span
                key={value ?? `${label}-empty`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{ color: value ? TXT_DARK : BEIGE_MID, fontSize: 13, fontWeight: value ? 500 : 400 }}
              >
                {value ?? "—"}
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div style={{ borderTop: `1px solid ${PANEL_BDR}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: TXT_MUTED, fontSize: 13 }}>Total</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: TXT_DARK }}>
          R$ {fmt(total)}
        </span>
      </div>
    </div>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ["Data", "Login", "Mensagem", "Confirmar"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {STEP_LABELS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              height: 6,
              borderRadius: 999,
              background: done ? LIME : active ? DARK : "var(--color-gray-200)",
              transition: "background 0.3s",
            }} />
            <span style={{
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? TXT_DARK : TXT_MUTED,
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Horário (calendário) ─────────────────────────────────────────────

function StepHorario({ creator, offer, data, horario, slots, slotTakenMessage, onData, onHorario, onSlotsChange }: {
  creator: Creator; offer: Offer;
  data: Date | null; horario: string | null;
  slots: string[];
  slotTakenMessage: string | null;
  onData: (d: Date) => void; onHorario: (h: string) => void;
  onSlotsChange: (slots: string[]) => void;
}) {
  const [hoje, setHoje] = useState<Date | null>(null);
  useEffect(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    setHoje(d);
  }, []);
  const [mes, setMes] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const ano = mes.getFullYear();
  const m   = mes.getMonth();
  const totalDias = new Date(ano, m + 1, 0).getDate();
  // Mon-first offset: Sun=0→6, Mon=1→0, Tue=2→1 …
  const offset = (new Date(ano, m, 1).getDay() + 6) % 7;

  // Fetch the visible month's dotted days once on mount and on every month change.
  useEffect(() => {
    const controller = new AbortController();
    const first = new Date(ano, m, 1);
    fetch(`/api/creators/${creator.slug}/slots?date=${ymd(first)}&duration=${offer.durationMinutes}`, { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((json) => setAvailableDays(json.availableDays ?? []))
      .catch((e) => { if (e.name !== "AbortError") setAvailableDays([]); });
    return () => controller.abort();
  }, [ano, m, creator.slug, offer.durationMinutes]);

  // Fetch the selected day's slots.
  useEffect(() => {
    if (!data) { onSlotsChange([]); return; }
    const controller = new AbortController();
    setLoadingSlots(true);
    fetch(`/api/creators/${creator.slug}/slots?date=${ymd(data)}&duration=${offer.durationMinutes}`, { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((json) => onSlotsChange(json.slots ?? []))
      .catch((e) => { if (e.name !== "AbortError") onSlotsChange([]); })
      .finally(() => { if (!controller.signal.aborted) setLoadingSlots(false); });
    return () => controller.abort();
  }, [data, creator.slug, offer.durationMinutes]);

  function prevMes() { setMes(new Date(ano, m - 1, 1)); }
  function nextMes() { setMes(new Date(ano, m + 1, 1)); }

  const btnNav: React.CSSProperties = {
    width: 32, height: 32, borderRadius: "50%", border: `1px solid ${BEIGE_MID}`,
    background: "transparent", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 14, color: TXT_DARK,
    flexShrink: 0,
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>Quando você quer se encontrar?</h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 20 }}>Dias com ponto têm horários disponíveis.</p>

      {slotTakenMessage && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8,
          padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#B91C1C",
        }}>
          {slotTakenMessage}
        </div>
      )}

      {/* Calendário */}
      <div style={{ background: CARD_BG, border: `1px solid ${BEIGE_MID}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
        {/* Cabeçalho do mês */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button style={btnNav} onClick={prevMes}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: TXT_DARK }}>
            {MESES[m]} {ano}
          </span>
          <button style={btnNav} onClick={nextMes}>›</button>
        </div>

        {/* Headers dos dias */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
          {DIAS_HDR.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: TXT_MUTED, padding: "0 0 6px" }}>{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px 0" }}>
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: totalDias }, (_, i) => i + 1).map((dia) => {
            const d = new Date(ano, m, dia);
            d.setHours(0,0,0,0);
            const disponivel = availableDays.includes(ymd(d));
            const passado    = hoje !== null && d <= hoje;
            const selecionado = data?.toDateString() === d.toDateString();
            const temSlots   = disponivel && !selecionado;

            return (
              <div key={dia} style={{ display: "flex", justifyContent: "center" }}>
                <button
                  disabled={!disponivel}
                  onClick={() => {
                    onSlotsChange([]);
                    setLoadingSlots(true);
                    onData(new Date(ano, m, dia));
                  }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", border: "none",
                    background: selecionado ? DARK : "transparent",
                    color: selecionado ? TXT_LIGHT : passado ? "#C4C9D4" : TXT_DARK,
                    fontSize: 13, fontWeight: selecionado ? 700 : 400,
                    cursor: disponivel ? "pointer" : "default",
                    position: "relative",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                >
                  {dia}
                  {temSlots && (
                    <div style={{
                      position: "absolute", bottom: 3,
                      width: 4, height: 4, borderRadius: "50%", background: LIME,
                    }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots de horário */}
      <AnimatePresence>
        {data && (
          <motion.div
            key={data.toDateString()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: TXT_MUTED, marginBottom: 12 }}>
              {dataLonga(data)} · selecione um horário
            </p>
            {loadingSlots ? (
              <p style={{ fontSize: 14, color: TXT_MUTED }}>Carregando…</p>
            ) : slots.length === 0 ? (
              <p style={{ fontSize: 14, color: TXT_MUTED }}>Sem horários nesse dia.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {slots.map((h) => {
                  const ativo = horario === h;
                  return (
                    <button
                      key={h}
                      onClick={() => onHorario(h)}
                      style={{
                        padding: "10px 20px", borderRadius: 6,
                        border: "none",
                        background: ativo ? LIME : BEIGE_BG,
                        color: TXT_DARK,
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 1: Login ─────────────────────────────────────────────────────────────

function StepLogin({ onLogin }: { onLogin: (user: { id: string; name: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError && signInData.user) {
      const meta = signInData.user.user_metadata ?? {};
      onLogin({ id: signInData.user.id, name: meta.name ?? email.split("@")[0] });
      return;
    }

    const checkRes = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { hasPassword } = await checkRes.json().catch(() => ({ hasPassword: false }));

    if (hasPassword) {
      setError("Senha incorreta. Tente novamente.");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Diga como quer ser chamado para criar sua conta.");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já tem conta. Confira a senha."
          : signUpError.message
      );
      setLoading(false);
      return;
    }
    if (!signUpData.session || !signUpData.user) {
      setError("Confirme seu e-mail para continuar.");
      setLoading(false);
      return;
    }
    onLogin({ id: signUpData.user.id, name: name || email.split("@")[0] });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", borderRadius: 6, border: `1px solid ${BEIGE_MID}`,
    background: CARD_BG, padding: "11px 14px", fontSize: 14, color: TXT_DARK,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: TXT_MUTED,
    letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>Acesse sua conta</h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 32 }}>
        Entre para confirmar o agendamento.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Como quer ser chamado?</label>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
          />
        </div>
        <div>
          <label style={labelStyle}>E-mail</label>
          <input
            type="email"
            required
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
          />
        </div>
        <div>
          <label style={labelStyle}>Senha</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
          />
        </div>

        {error && <p style={{ fontSize: 13, color: "#EF4444" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 8,
            fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer",
            border: "none", background: loading ? BEIGE_MID : DARK,
            color: loading ? TXT_MUTED : TXT_LIGHT, transition: "all 0.18s",
          }}
        >
          {loading ? "Entrando…" : "Continuar"}
        </button>
      </form>

      <p style={{ fontSize: 12, color: TXT_MUTED, marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
        Ao continuar, você concorda com os{" "}
        <span style={{ textDecoration: "underline", cursor: "pointer" }}>Termos de Uso</span>
        {" "}e a{" "}
        <span style={{ textDecoration: "underline", cursor: "pointer" }}>Política de Privacidade</span>
        {" "}da Loop.Talk.
      </p>
    </div>
  );
}

// ─── Step 2: Mensagem ─────────────────────────────────────────────────────────

function StepMensagem({ creator, mensagem, onChange }: {
  creator: Creator; mensagem: string; onChange: (v: string) => void;
}) {
  const nome = creator.firstName;
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>
        Deixe uma mensagem para {nome}
      </h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 24 }}>
        Compartilhe o contexto da sua sessão. Isso ajuda o mentor a se preparar melhor para aproveitar cada minuto juntos.
      </p>

      <textarea
        value={mensagem}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Olá, ${nome}! Quero agendar essa sessão porque…`}
        rows={6}
        style={{
          width: "100%", borderRadius: 8,
          border: `1.5px solid ${BEIGE_MID}`,
          background: BEIGE_CRD, padding: "14px 16px",
          fontSize: 14, color: TXT_DARK,
          outline: "none", resize: "none", fontFamily: "inherit",
          boxSizing: "border-box", lineHeight: 1.6,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
        onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
      />
      <p style={{ fontSize: 12, color: TXT_MUTED, marginTop: 8 }}>
        Opcional — você pode pular e ir direto para a confirmação.
      </p>
    </div>
  );
}

// ─── Step 3: Confirmar ─────────────────────────────────────────────────────────

function StepConfirmar({ creator, offer, data, horario, pending, error, onConfirm }: {
  creator: Creator; offer: Offer;
  data: Date; horario: string;
  pending: boolean; error: string | null;
  onConfirm: () => void;
}) {
  const total = offer.priceCents / 100;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>Confirme sua sessão</h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 24 }}>
        Revise os detalhes antes de confirmar o agendamento.
      </p>

      {/* Resumo da sessão */}
      <div style={{
        background: BEIGE_BG, border: `1px solid ${BEIGE_MID}`,
        borderRadius: 8, padding: "12px 16px", marginBottom: 20,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center",
      }}>
        <div>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Com</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK }}>{creator.firstName}</p>
        </div>
        <div style={{ borderLeft: `1px solid ${BEIGE_MID}`, borderRight: `1px solid ${BEIGE_MID}` }}>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{dataLonga(data)}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK }}>{horario} · {offer.durationMinutes} min</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: TXT_DARK }}>R$ {fmt(total)}</p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: TXT_MUTED, marginBottom: 20 }}>
        Ao confirmar, sua sessão é reservada na agenda de {creator.firstName}.
      </p>

      {error && <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</p>}

      <button
        onClick={onConfirm}
        disabled={pending}
        style={{
          width: "100%", padding: "14px 0", borderRadius: "var(--radius-pill)", border: "none",
          background: pending ? BEIGE_MID : DARK,
          color: pending ? TXT_MUTED : TXT_LIGHT,
          fontSize: 15, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer",
          transition: "all 0.18s",
        }}
      >
        {pending ? "Confirmando…" : "Confirmar agendamento"}
      </button>
    </div>
  );
}

// ─── BookingFlow ──────────────────────────────────────────────────────────────

export function BookingFlow({ creator, offer, initialUser, header, footer }: {
  creator: Creator;
  offer: Offer;
  initialUser: { id: string; name: string } | null;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  void header;
  void footer;

  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);

  const [data,     setData]     = useState<Date | null>(null);
  const [horario,  setHorario]  = useState<string | null>(null);
  const [slots,    setSlots]    = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState(initialUser !== null);
  const [mensagem, setMensagem] = useState("");
  const [slotTakenMessage, setSlotTakenMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function avancar() {
    setDir(1);
    setStep((s) => (s === 0 && loggedIn ? 2 : s + 1));
  }
  function voltar() {
    setDir(-1);
    setStep((s) => (s === 2 && loggedIn ? 0 : s - 1));
  }

  function handleData(d: Date) {
    setData(d);
    setHorario(null);
    setSlotTakenMessage(null);
  }

  function handleLogin(_user: { id: string; name: string }) {
    setLoggedIn(true);
    setDir(1);
    setStep((s) => s + 1);
  }

  async function handleConfirm() {
    if (pending) return;
    if (!data || !horario) return;
    setPending(true);
    setConfirmError(null);

    const starts_at = zonedToUtc(ymd(data), horario).toISOString();
    let res: Response;
    try {
      res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentor_id: creator.id,
          starts_at,
          duration: offer.durationMinutes,
          notes: mensagem || null,
        }),
      });
    } catch {
      setPending(false);
      setConfirmError("Não foi possível conectar. Tente novamente.");
      return;
    }

    if (res.status === 201) {
      const json = await res.json();
      router.push(`/confirmacao/${json.id}`);
      return;
    }

    setPending(false);
    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      setLoggedIn(false);
      setDir(-1);
      setStep(1);
      return;
    }
    if (res.status === 409) {
      setSlotTakenMessage("Esse horário acabou de ser reservado. Escolha outro.");
      setHorario(null);
      setData((d0) => (d0 ? new Date(d0) : d0));
      setDir(-1);
      setStep(0);
      return;
    }
    setConfirmError(json.error ?? "Algo deu errado. Tente novamente.");
  }

  function podeAvancar() {
    if (step === 0) return data !== null && !!horario && slots.includes(horario);
    if (step === 1) return loggedIn; // auto-advances
    if (step === 2) return true;     // mensagem é opcional
    return false;
  }

  // Steps: 0=Data, 1=Login, 2=Mensagem, 3=Confirmar
  // Nav bar: steps 0-2 only (Confirmar has its own CTA)
  const showNav  = step < 3;
  // Login (step 1) auto-advances — no "Próximo" button needed
  const showNext = showNav && step !== 1;

  return (
    <div style={{ minHeight: "100vh", background: BEIGE_BG }}>

      {/* Custom booking nav bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 72,
        backdropFilter: "blur(12px)",
        background: "rgba(246,241,233,0.88)",
        borderBottom: `1px solid ${BEIGE_MID}`,
      }}>
        <Logo size="header" />
        <Link href={`/${creator.slug}`} style={{ fontSize: 14, color: TXT_MUTED, textDecoration: "none", fontWeight: 500 }}>
          ← Voltar ao perfil
        </Link>
      </div>

      {/* Layout principal */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "108px 16px 80px",
          gap: 32, alignItems: "flex-start",
        }}
      >

        {/* Painel esquerdo — hidden on mobile */}
        <div className="hidden md:block">
          <PainelResumo creator={creator} offer={offer} data={data} horario={horario} />
        </div>

        {/* Card principal */}
        <div
          className="p-6 md:p-10"
          style={{
            flex: 1, background: BEIGE_BG, borderRadius: 12,
            border: `1px solid ${BEIGE_MID}`,
          }}
        >

          <div style={{ marginBottom: 36, overflowX: "auto" }}>
            <StepIndicator current={step} />
          </div>

          {/* Conteúdo animado */}
          <div style={{ minHeight: 380, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slideV}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideT}
              >
                {step === 0 && (
                  <StepHorario
                    creator={creator} offer={offer}
                    data={data} horario={horario}
                    slots={slots}
                    slotTakenMessage={slotTakenMessage}
                    onData={handleData}
                    onHorario={setHorario}
                    onSlotsChange={setSlots}
                  />
                )}
                {step === 1 && (
                  <StepLogin onLogin={handleLogin} />
                )}
                {step === 2 && (
                  <StepMensagem creator={creator} mensagem={mensagem} onChange={setMensagem} />
                )}
                {step === 3 && (
                  <StepConfirmar
                    creator={creator} offer={offer}
                    data={data!} horario={horario!}
                    pending={pending} error={confirmError}
                    onConfirm={handleConfirm}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navegação */}
          {showNav && (
            <>
              {/* Mobile: full-width stack */}
              <div className="flex flex-col md:hidden" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BEIGE_MID}`, gap: 12 }}>
                {showNext && (
                  <button
                    onClick={avancar}
                    disabled={!podeAvancar()}
                    style={{
                      width: "100%", padding: "14px 0", borderRadius: "var(--radius-pill)", border: "none",
                      background: podeAvancar() ? DARK : BEIGE_MID,
                      color: podeAvancar() ? TXT_LIGHT : TXT_MUTED,
                      fontSize: 15, fontWeight: 600,
                      cursor: podeAvancar() ? "pointer" : "not-allowed",
                      transition: "all 0.18s",
                    }}
                  >
                    {step === 2 ? "Revisar e confirmar →" : "Continuar"}
                  </button>
                )}
                {step > 0 && (
                  <button
                    onClick={voltar}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 14, color: TXT_MUTED, fontWeight: 500, padding: "4px 0",
                    }}
                  >
                    ← Voltar
                  </button>
                )}
              </div>

              {/* Desktop: row */}
              <div className="hidden md:flex" style={{
                justifyContent: "space-between", alignItems: "center",
                marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BEIGE_MID}`,
              }}>
                <button
                  onClick={voltar}
                  style={{
                    padding: "10px 20px", borderRadius: "var(--radius-pill)",
                    border: `1.5px solid ${BEIGE_MID}`,
                    background: "transparent", color: TXT_MUTED,
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    visibility: step === 0 ? "hidden" : "visible",
                  }}
                >
                  ← Voltar
                </button>

                {showNext && (
                  <button
                    onClick={avancar}
                    disabled={!podeAvancar()}
                    style={{
                      padding: "12px 28px", borderRadius: "var(--radius-pill)", border: "none",
                      background: podeAvancar() ? DARK : BEIGE_MID,
                      color: podeAvancar() ? TXT_LIGHT : TXT_MUTED,
                      fontSize: 15, fontWeight: 600,
                      cursor: podeAvancar() ? "pointer" : "not-allowed",
                      transition: "all 0.18s",
                    }}
                  >
                    {step === 2 ? "Revisar e confirmar →" : "Próximo →"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
