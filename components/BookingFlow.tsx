"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Expert } from "@/lib/mockExperts";
import { Logo } from "@/components/Logo";

// ─── tokens ───────────────────────────────────────────────────────────────────

const DARK      = "#272518";
const PANEL_BG  = "#FFFFFF";
const PANEL_BDR = "#E0DDC1";
const LIME      = "#EAEA68";
const BEIGE_BG  = "#F4F2EB";
const BEIGE_MID = "#E0DDC1";
const BEIGE_CRD = "#FCFBF8";
const TXT_DARK  = "#272518";
const TXT_MUTED = "#807F71";
const TXT_LIGHT = "#FCFBF8";
const CARD_BG   = "#FFFFFF";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DIAS_HDR  = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MESES     = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CRT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
function precoPor(expert: Expert, min: number) {
  return Math.round((expert.preco * min) / 60);
}
function dataLonga(d: Date) {
  const dia = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
  return `${dia}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
function gerarSlots(d: Date): string[] {
  if (d.getDay() === 0) return [];
  const base = d.getDay() === 6
    ? ["09:00","10:00","11:00"]
    : ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];
  return base.filter((_, i) => (i + d.getDate()) % 3 !== 1);
}
function gerarSessionId() {
  return `LT-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── animation ────────────────────────────────────────────────────────────────

const slideV = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};
const slideT = { duration: 0.28, ease: "easeInOut" as const };

// ─── Mock QR ──────────────────────────────────────────────────────────────────

const QR_ROWS = [
  "1111111011010111111","1000001010010000001","1011101001011011101",
  "1011101110101011101","1011101011011011101","1000001001001000001",
  "1111111010101111111","0000000110000000000","1100101110101101101",
  "0011010001011010010","1001101101110101001","0110010010001100110",
  "1010101010110101010","0000000101001010100","1111111011011011111",
  "1000001000110100001","1011101011010001101","1000001010001010001",
  "1111111011101111111",
];
function QrCode() {
  const cell = 9, pad = 16, n = QR_ROWS[0].length;
  const size = n * cell + pad * 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx={8} />
      {QR_ROWS.map((row, ri) =>
        row.split("").map((bit, ci) =>
          bit === "1" ? (
            <rect key={`${ri}-${ci}`} x={pad+ci*cell} y={pad+ri*cell} width={cell} height={cell} fill={DARK} />
          ) : null
        )
      )}
    </svg>
  );
}

const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136a2b4c6d8-e0f2-4a6b-8c0d-2e4f6a8b0c2d5204000053039865802BR5925FACE TALK PAGAMENTOS6009SAOPAULO62070503***6304A1B2";

// ─── PainelResumo ─────────────────────────────────────────────────────────────

function PainelResumo({ expert, duracao, data, horario }: {
  expert: Expert;
  duracao: number | null;
  data: Date | null;
  horario: string | null;
}) {
  const total = duracao ? precoPor(expert, duracao) : null;

  const rows = [
    { label: "Duração", value: duracao ? `${duracao} min` : null },
    { label: "Data",    value: data    ? `${data.getDate()} de ${MESES_CRT[data.getMonth()]}` : null },
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
      {/* Expert */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <Image src={`/mentors/${expert.slug}/profile.webp`} alt={expert.nome} fill className="object-cover object-top" sizes="80px" />
        </div>
        <div>
          <p style={{ color: TXT_DARK, fontSize: 16, fontWeight: 600 }}>{expert.nome}</p>
          <span style={{
            display: "inline-block", marginTop: 6, background: BEIGE_BG,
            borderRadius: 4, padding: "4px 10px", fontSize: 12, color: TXT_MUTED,
          }}>
            {expert.categoria}
          </span>
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
        <motion.span
          key={total ?? "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 20, fontWeight: 700, color: total ? TXT_DARK : BEIGE_MID }}
        >
          {total ? `R$ ${fmt(total)}` : "—"}
        </motion.span>
      </div>
    </div>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ["Data", "Login", "Mensagem", "Pagamento"];

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
              background: done ? LIME : active ? DARK : "#DAD9D5",
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

// ─── Step 0: Sessão ───────────────────────────────────────────────────────────

function StepSessao({ expert, duracao, onSelect }: {
  expert: Expert; duracao: number | null; onSelect: (v: number) => void;
}) {
  const duracoes = expert.duracoes.slice(0, 3);
  const mid = duracoes[Math.floor(duracoes.length / 2)];
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>Quanto tempo você precisa?</h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 28 }}>Escolha a duração ideal para o seu objetivo.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {duracoes.map((min) => {
          const ativo = duracao === min;
          const popular = min === mid;
          return (
            <button
              key={min}
              onClick={() => onSelect(min)}
              style={{
                border: "none",
                borderRadius: 10, padding: "20px 16px",
                background: ativo ? LIME : BEIGE_BG,
                cursor: "pointer", position: "relative",
                transition: "all 0.18s", textAlign: "center",
              }}
            >
              {popular && (
                <span style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: DARK, color: TXT_LIGHT, fontSize: 10, fontWeight: 700,
                  borderRadius: 12, padding: "2px 10px", whiteSpace: "nowrap",
                }}>Mais popular</span>
              )}
              <p style={{ fontSize: 24, fontWeight: 700, color: TXT_DARK }}>{min}</p>
              <p style={{ fontSize: 13, color: TXT_MUTED }}>minutos</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK, marginTop: 8 }}>
                R$ {fmt(precoPor(expert, min))}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Horário (calendário) ─────────────────────────────────────────────

function StepHorario({ data, horario, onData, onHorario }: {
  data: Date | null; horario: string | null;
  onData: (d: Date) => void; onHorario: (h: string) => void;
}) {
  const hoje = useRef(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }).current();
  const [mes, setMes] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const ano = mes.getFullYear();
  const m   = mes.getMonth();
  const totalDias = new Date(ano, m + 1, 0).getDate();
  // Mon-first offset: Sun=0→6, Mon=1→0, Tue=2→1 …
  const offset = (new Date(ano, m, 1).getDay() + 6) % 7;

  function isDisp(dia: number) {
    const d = new Date(ano, m, dia);
    d.setHours(0,0,0,0);
    if (d <= hoje) return false;
    if (d.getDay() === 0) return false;
    return gerarSlots(d).length > 0;
  }

  const slots = data ? gerarSlots(data) : [];

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
            const disponivel = isDisp(dia);
            const passado    = d <= hoje || d.getDay() === 0;
            const selecionado = data?.toDateString() === d.toDateString();
            const temSlots   = disponivel && !selecionado;

            return (
              <div key={dia} style={{ display: "flex", justifyContent: "center" }}>
                <button
                  disabled={!disponivel}
                  onClick={() => { onData(new Date(ano, m, dia)); onHorario(""); }}
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
            {slots.length === 0 ? (
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

// ─── Step 2: Social Login ─────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.4-8H6.1C9.5 35.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C41.5 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
    </svg>
  );
}

function StepLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  function handleLogin(provider: "google" | "apple") {
    setLoading(provider);
    setTimeout(() => {
      onLogin(provider === "google" ? "Vanessa M." : "Vanessa M.");
    }, 900);
  }

  const btnBase: React.CSSProperties = {
    width: "100%", padding: "14px 20px", borderRadius: 8,
    fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    transition: "all 0.18s", border: "none",
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TXT_DARK, marginBottom: 6 }}>Acesse sua conta</h2>
      <p style={{ fontSize: 14, color: TXT_MUTED, marginBottom: 32 }}>
        Entre para confirmar o agendamento. Rápido e sem senha.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => handleLogin("google")}
          disabled={!!loading}
          style={{
            ...btnBase,
            background: loading === "google" ? BEIGE_MID : CARD_BG,
            border: `1.5px solid ${BEIGE_MID}`,
            color: TXT_DARK,
          }}
        >
          {loading === "google" ? (
            <span style={{ fontSize: 13, color: TXT_MUTED }}>Conectando…</span>
          ) : (
            <><GoogleIcon /> Continuar com Google</>
          )}
        </button>

        <button
          onClick={() => handleLogin("apple")}
          disabled={!!loading}
          style={{
            ...btnBase,
            background: loading === "apple" ? "#111" : DARK,
            color: TXT_LIGHT,
          }}
        >
          {loading === "apple" ? (
            <span style={{ fontSize: 13, color: "#A39E79" }}>Conectando…</span>
          ) : (
            <><AppleIcon /> Continuar com Apple</>
          )}
        </button>
      </div>

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

// ─── Step 3: Mensagem ─────────────────────────────────────────────────────────

function StepMensagem({ expert, mensagem, onChange }: {
  expert: Expert; mensagem: string; onChange: (v: string) => void;
}) {
  const nome = expert.nome.split(" ")[0];
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
        Opcional — você pode pular e ir direto para o pagamento.
      </p>
    </div>
  );
}

// ─── Payment sub-components ───────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
      <rect width="38" height="24" rx="4" fill="#1A1F71" />
      <text x="19" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="14" cy="12" r="7" fill="#EB001B" />
      <circle cx="24" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
    </svg>
  );
}

function PixLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#32BCAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Step 4: Pagamento ────────────────────────────────────────────────────────

function StepPagamento({ expert, duracao, data, horario, onPago }: {
  expert: Expert; duracao: number; data: Date; horario: string; onPago: () => void;
}) {
  const total = precoPor(expert, duracao);
  const [aba, setAba] = useState<"pix" | "cartao">("pix");

  // Pix state
  const [secs, setSecs] = useState(300);
  const [copiado, setCopiado] = useState(false);

  // Card state
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (aba !== "pix" || secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, aba]);

  function copiar() {
    navigator.clipboard.writeText(PIX_CODE).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  function pagarCartao() {
    setProcessando(true);
    setTimeout(() => { setProcessando(false); onPago(); }, 1800);
  }

  const cardValido = numero.replace(/\s/g, "").length === 16 && nome.trim().length > 2 && validade.length === 5 && cvv.length >= 3;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss2 = String(secs % 60).padStart(2, "0");

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
    <div>
      {/* Resumo da sessão */}
      <div style={{
        background: BEIGE_BG, border: `1px solid ${BEIGE_MID}`,
        borderRadius: 8, padding: "12px 16px", marginBottom: 20,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center",
      }}>
        <div>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Com</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK }}>{expert.nome.split(" ")[0]}</p>
        </div>
        <div style={{ borderLeft: `1px solid ${BEIGE_MID}`, borderRight: `1px solid ${BEIGE_MID}` }}>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{dataLonga(data)}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK }}>{horario} · {duracao} min</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: TXT_MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: TXT_DARK }}>R$ {fmt(total)}</p>
        </div>
      </div>

      {/* Selos de segurança */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
        padding: "10px 14px", background: "#F0FAF6",
        border: "1px solid #C8EAE1", borderRadius: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2D7D5E", fontSize: 12, fontWeight: 600 }}>
          <LockIcon />
          Pagamento 100% seguro
        </div>
        <div style={{ width: 1, height: 16, background: "#C8EAE1" }} />
        <span style={{ fontSize: 11, color: "#4A9B7F" }}>Criptografia SSL 256-bit</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <VisaLogo />
          <MastercardLogo />
        </div>
      </div>

      {/* Abas */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 24,
        borderBottom: `1px solid ${BEIGE_MID}`, paddingBottom: 0,
      }}>
        {([
          { id: "pix", label: "Pix", icon: <PixLogo /> },
          { id: "cartao", label: "Cartão de crédito", icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          )},
        ] as const).map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setAba(id as "pix" | "cartao")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: aba === id ? 600 : 400,
              color: aba === id ? TXT_DARK : TXT_MUTED,
              borderBottom: aba === id ? `2px solid ${TXT_DARK}` : "2px solid transparent",
              marginBottom: -1, transition: "all 0.15s",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <AnimatePresence mode="wait">
        {aba === "pix" ? (
          <motion.div key="pix" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0 }}>
                <QrCode />
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  {secs <= 0 ? (
                    <p style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>QR Code expirado</p>
                  ) : (
                    <p style={{ fontSize: 12, color: TXT_MUTED }}>
                      Expira em <strong style={{ color: secs < 60 ? "#EF4444" : TXT_DARK }}>{mm}:{ss2}</strong>
                    </p>
                  )}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: TXT_DARK, marginBottom: 8 }}>Copie o código Pix</p>
                <div style={{
                  background: BEIGE_BG, border: `1px solid ${BEIGE_MID}`,
                  borderRadius: 6, padding: "10px 14px", fontSize: 11,
                  color: TXT_MUTED, wordBreak: "break-all", lineHeight: 1.5, marginBottom: 10,
                }}>
                  {PIX_CODE}
                </div>
                <button
                  onClick={copiar}
                  style={{
                    width: "100%", padding: 10, borderRadius: 6,
                    border: `1px solid ${BEIGE_MID}`,
                    background: copiado ? LIME : CARD_BG,
                    color: copiado ? DARK : TXT_DARK,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {copiado ? "✓ Copiado!" : "Copiar código"}
                </button>
                <button
                  onClick={onPago}
                  style={{
                    width: "100%", marginTop: 10, padding: 13, borderRadius: 6,
                    border: "none", background: DARK, color: TXT_LIGHT,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Já paguei →
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="cartao" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Número do cartão */}
              <div>
                <label style={labelStyle}>Número do cartão</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={numero}
                    onChange={(e) => setNumero(formatCard(e.target.value))}
                    style={{ ...inputStyle, paddingRight: 100 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
                  />
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
                    <VisaLogo />
                    <MastercardLogo />
                  </div>
                </div>
              </div>

              {/* Nome no cartão */}
              <div>
                <label style={labelStyle}>Nome impresso no cartão</label>
                <input
                  type="text"
                  placeholder="NOME SOBRENOME"
                  value={nome}
                  onChange={(e) => setNome(e.target.value.toUpperCase())}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
                />
              </div>

              {/* Validade + CVV */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Validade</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={validade}
                    onChange={(e) => setValidade(formatExpiry(e.target.value))}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
                    CVV
                    <span title="3 dígitos no verso do cartão" style={{ cursor: "help", color: BEIGE_MID }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = TXT_DARK)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = BEIGE_MID)}
                  />
                </div>
              </div>

              {/* Parcelas */}
              <div>
                <label style={labelStyle}>Parcelamento</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => setParcelas(p)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 6, border: "none",
                        background: parcelas === p ? LIME : BEIGE_BG,
                        cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: TXT_DARK }}>
                        {p}x
                      </div>
                      <div style={{ fontSize: 11, color: TXT_MUTED }}>
                        R$ {fmt(Math.ceil(total / p))}
                        {p > 1 && <span style={{ color: "#4A9B7F", fontWeight: 600 }}> s/juros</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={pagarCartao}
                disabled={!cardValido || processando}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 6, border: "none",
                  background: cardValido && !processando ? DARK : BEIGE_MID,
                  color: cardValido && !processando ? TXT_LIGHT : TXT_MUTED,
                  fontSize: 15, fontWeight: 600, cursor: cardValido && !processando ? "pointer" : "not-allowed",
                  transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {processando ? (
                  "Processando…"
                ) : (
                  <><LockIcon /> Pagar R$ {fmt(total)}</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé de segurança */}
      <div style={{
        marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 11, color: TXT_MUTED, display: "flex", alignItems: "center", gap: 4 }}>
          <LockIcon /> Dados protegidos por criptografia
        </span>
        <span style={{ fontSize: 11, color: TXT_MUTED }}>·</span>
        <span style={{ fontSize: 11, color: TXT_MUTED }}>Não armazenamos dados do cartão</span>
        <span style={{ fontSize: 11, color: TXT_MUTED }}>·</span>
        <span style={{ fontSize: 11, color: TXT_MUTED }}>PCI DSS compliant</span>
      </div>
    </div>
  );
}

// ─── Step 4: Confirmação (success screen) ─────────────────────────────────────

function StepConfirmacao({ expert, duracao, data, horario }: {
  expert: Expert; duracao: number; data: Date; horario: string;
}) {
  const total = precoPor(expert, duracao);
  const dias = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mesesCrt = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const dataLabel = `${dias[data.getDay()]}, ${data.getDate()} ${mesesCrt[data.getMonth()]}`;

  const tileStyle: React.CSSProperties = {
    flex: 1, padding: 16,
    background: BEIGE_BG,
    outline: "2px solid white", outlineOffset: -1,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  };
  const tileLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: "#626053",
    lineHeight: "12px", textAlign: "center", margin: 0,
  };
  const tileValue: React.CSSProperties = {
    fontSize: 14, color: TXT_DARK,
    lineHeight: "20px", textAlign: "center", margin: 0,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "#FFFFFF",
        borderRadius: 12,
        outline: `1px solid ${BEIGE_MID}`,
        outlineOffset: -1,
        padding: "32px 24px",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        gap: 24,
      }}>

        {/* Icon + title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            style={{
              width: 44, height: 44, borderRadius: "50%", background: LIME,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 13l6 6 10-10" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ textAlign: "center", fontSize: 16, fontWeight: 400, color: TXT_DARK, margin: 0 }}>
              Sessão confirmada
            </p>
            <p style={{ textAlign: "center", fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>
              Enviamos a confirmação e o link da reunião para o seu e-mail.
            </p>
          </div>
        </div>

        {/* Summary tiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Expert row + Date/Duration/Total row */}
          <div style={{ borderRadius: 8, overflow: "hidden" }}>
            {/* Expert */}
            <div style={{
              background: BEIGE_BG,
              outline: "2px solid white", outlineOffset: -1,
              padding: 12,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ position: "relative", width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                <Image src={`/mentors/${expert.slug}/profile.webp`} alt={expert.nome} fill className="object-cover object-top" sizes="56px" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#626053", lineHeight: "12px", margin: 0 }}>
                  {expert.categoria}
                </p>
                <p style={{ fontSize: 14, color: TXT_DARK, lineHeight: "20px", margin: 0 }}>
                  {expert.nome}
                </p>
              </div>
            </div>
            {/* Data / Duração / Total */}
            <div style={{ display: "flex" }}>
              <div style={tileStyle}>
                <p style={tileLabel}>{dataLabel}</p>
                <p style={tileValue}>{horario}</p>
              </div>
              <div style={tileStyle}>
                <p style={tileLabel}>Duração</p>
                <p style={tileValue}>{duracao} min</p>
              </div>
              <div style={tileStyle}>
                <p style={tileLabel}>Total</p>
                <p style={tileValue}>R$ {fmt(total)}</p>
              </div>
            </div>
          </div>

          {/* Pagamento row */}
          <div style={{
            background: BEIGE_BG, borderRadius: 4,
            padding: "0 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#626053", margin: 0 }}>Pagamento</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
              <span style={{ fontSize: 14, color: TXT_DARK }}>Crédito • 0000</span>
              <div style={{ width: 34, height: 24, borderRadius: 4, overflow: "hidden" }}>
                <VisaLogo />
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href="#"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 20px",
              background: DARK, borderRadius: 8,
              fontSize: 16, fontWeight: 600, color: "#FCFBF8",
              textDecoration: "none",
            }}
          >
            Adicionar ao Google Calendar
          </a>
          <Link
            href="/dashboard"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 20px",
              background: BEIGE_CRD, borderRadius: 8,
              outline: "1px solid #8E8857", outlineOffset: -1,
              fontSize: 16, fontWeight: 600, color: TXT_DARK,
              textDecoration: "none",
            }}
          >
            Meus agendamentos
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── BookingFlow ──────────────────────────────────────────────────────────────

export function BookingFlow({ expert, duracaoInicial, header, footer }: {
  expert: Expert;
  duracaoInicial: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);

  // duracao is fixed from the slug page selection
  const duracao = duracaoInicial;

  const [data,     setData]     = useState<Date | null>(null);
  const [horario,  setHorario]  = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function avancar() { setDir(1); setStep((s) => s + 1); }
  function voltar()  { setDir(-1); setStep((s) => s - 1); }

  function handleLogin(_name: string) {
    setLoggedIn(true);
    setDir(1);
    setStep((s) => s + 1);
  }

  function podeAvancar() {
    if (step === 0) return data !== null && !!horario;
    if (step === 1) return loggedIn; // auto-advances
    if (step === 2) return true;     // mensagem é opcional
    return false;
  }

  // Steps: 0=Data, 1=Login, 2=Mensagem, 3=Pagamento, 4=Sucesso
  // Nav bar: steps 0-2 only (Pagamento has own CTA, Sucesso is final)
  const showNav  = step < 3;
  // Login (step 1) auto-advances — no "Próximo" button needed
  const showNext = showNav && step !== 1;
  // Progress bar: hide on success screen
  const isSuccess = step === 4;

  return (
    <div style={{ minHeight: "100vh", background: BEIGE_BG }}>

      {/* Success: global Header; Flow: custom booking nav */}
      {isSuccess ? header : (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 72,
          backdropFilter: "blur(12px)",
          background: "rgba(246,241,233,0.88)",
          borderBottom: `1px solid ${BEIGE_MID}`,
        }}>
          <Logo size="header" />
          <Link href={`/${expert.slug}`} style={{ fontSize: 14, color: TXT_MUTED, textDecoration: "none", fontWeight: 500 }}>
            ← Voltar ao perfil
          </Link>
        </div>
      )}

      {/* Layout principal */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          maxWidth: isSuccess ? 600 : 960,
          margin: "0 auto",
          padding: "108px 16px 80px",
          gap: 32, alignItems: "flex-start",
          transition: "max-width 0.3s",
        }}
      >

        {/* Painel esquerdo — hidden on mobile and on success screen */}
        {!isSuccess && (
          <div className="hidden md:block">
            <PainelResumo expert={expert} duracao={duracao} data={data} horario={horario} />
          </div>
        )}

        {/* Card principal */}
        <div
          className="p-6 md:p-10"
          style={{
            flex: 1, background: BEIGE_BG, borderRadius: 12,
            border: `1px solid ${BEIGE_MID}`,
          }}
        >

          {/* Step indicator — hidden on success screen */}
          {!isSuccess && (
            <div style={{ marginBottom: 36, overflowX: "auto" }}>
              <StepIndicator current={step} />
            </div>
          )}

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
                    data={data} horario={horario}
                    onData={(d) => { setData(d); setHorario(null); }}
                    onHorario={setHorario}
                  />
                )}
                {step === 1 && (
                  <StepLogin onLogin={handleLogin} />
                )}
                {step === 2 && (
                  <StepMensagem expert={expert} mensagem={mensagem} onChange={setMensagem} />
                )}
                {step === 3 && (
                  <StepPagamento
                    expert={expert}
                    duracao={duracao} data={data!} horario={horario!}
                    onPago={avancar}
                  />
                )}
                {step === 4 && (
                  <StepConfirmacao
                    expert={expert}
                    duracao={duracao} data={data!} horario={horario!}
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
                      width: "100%", padding: "14px 0", borderRadius: 6, border: "none",
                      background: podeAvancar() ? DARK : BEIGE_MID,
                      color: podeAvancar() ? TXT_LIGHT : TXT_MUTED,
                      fontSize: 15, fontWeight: 600,
                      cursor: podeAvancar() ? "pointer" : "not-allowed",
                      transition: "all 0.18s",
                    }}
                  >
                    {step === 2 ? "Ir para pagamento →" : "Continuar"}
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
                    padding: "10px 20px", borderRadius: 6,
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
                      padding: "12px 28px", borderRadius: 6, border: "none",
                      background: podeAvancar() ? DARK : BEIGE_MID,
                      color: podeAvancar() ? TXT_LIGHT : TXT_MUTED,
                      fontSize: 15, fontWeight: 600,
                      cursor: podeAvancar() ? "pointer" : "not-allowed",
                      transition: "all 0.18s",
                    }}
                  >
                    {step === 2 ? "Ir para pagamento →" : "Próximo →"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success: global Footer */}
      {isSuccess && footer}
    </div>
  );
}
