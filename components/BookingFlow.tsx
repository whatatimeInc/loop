"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Expert } from "@/lib/mockExperts";
import { Logo } from "@/components/Logo";

// ─── design tokens ────────────────────────────────────────────────────────────

const DARK = "#181D27";
const PANEL_BG = "#1E2330";
const PANEL_BORDER = "#2E3447";
const LIME = "#CEFD58";
const BEIGE_BG = "#F6F1E9";
const BEIGE_MID = "#E7DAC8";
const BEIGE_CARD = "#FCFBF8";
const TEXT_DARK = "#181D27";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#E9EAEB";
const CARD_BG = "#FFFFFF";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function gerarDatas() {
  const hoje = new Date();
  const result: Date[] = [];
  let i = 1;
  while (result.length < 14) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() !== 0) result.push(d); // sem domingo
    i++;
  }
  return result;
}

function gerarSlots(d: Date): string[] {
  if (d.getDay() === 0) return [];
  const base = d.getDay() === 6
    ? ["09:00", "10:00", "11:00"]
    : ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  return base.filter((_, i) => (i + d.getDate()) % 3 !== 1);
}

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function precoPor(expert: Expert, min: number) {
  return Math.round((expert.preco * min) / 60);
}

function dataLonga(d: Date) {
  return `${DIAS_SEMANA[d.getDay()].slice(0, 3)}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function gerarSessionId(slug: string) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `FST-${n}`;
}

// ─── animation ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};
const slideTrans = { duration: 0.28, ease: "easeInOut" as const };

// ─── Mock QR Code ─────────────────────────────────────────────────────────────

const QR_ROWS = [
  "1111111011010111111",
  "1000001010010000001",
  "1011101001011011101",
  "1011101110101011101",
  "1011101011011011101",
  "1000001001001000001",
  "1111111010101111111",
  "0000000110000000000",
  "1100101110101101101",
  "0011010001011010010",
  "1001101101110101001",
  "0110010010001100110",
  "1010101010110101010",
  "0000000101001010100",
  "1111111011011011111",
  "1000001000110100001",
  "1011101011010001101",
  "1000001010001010001",
  "1111111011101111111",
];

function QrCode() {
  const cell = 9;
  const pad = 16;
  const size = QR_ROWS[0].length * cell + pad * 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" rx={8} />
      {QR_ROWS.map((row, ri) =>
        row.split("").map((bit, ci) =>
          bit === "1" ? (
            <rect
              key={`${ri}-${ci}`}
              x={pad + ci * cell}
              y={pad + ri * cell}
              width={cell}
              height={cell}
              fill={DARK}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Pix code ─────────────────────────────────────────────────────────────────

const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136a2b4c6d8-e0f2-4a6b-8c0d-2e4f6a8b0c2d5204000053039865802BR5925FACE TALK PAGAMENTOS6009SAOPAULO62070503***6304A1B2";

// ─── PERGUNTAS intake ─────────────────────────────────────────────────────────

const PERGUNTAS = [
  "O que você quer resolver nessa sessão? Seja específico sobre o desafio.",
  "Qual é o seu nível de experiência com o tema que vamos abordar?",
  "Tem alguma coisa que você já tentou fazer para resolver isso?",
];

// ─── Painel lateral (resumo) ───────────────────────────────────────────────────

function PainelResumo({
  expert,
  duracao,
  data,
  horario,
}: {
  expert: Expert;
  duracao: number | null;
  data: Date | null;
  horario: string | null;
}) {
  const total = duracao ? precoPor(expert, duracao) : null;

  return (
    <div
      style={{
        background: PANEL_BG,
        border: `1px solid ${PANEL_BORDER}`,
        borderRadius: 20,
        width: 300,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "sticky",
        top: 112,
      }}
    >
      {/* Expert info */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative rounded-full overflow-hidden" style={{ width: 80, height: 80 }}>
          <Image
            src={`/mentors/${expert.slug}/profile.webp`}
            alt={expert.nome}
            fill
            className="object-cover object-top"
            sizes="80px"
          />
        </div>
        <div>
          <p style={{ color: TEXT_LIGHT, fontSize: 16, fontWeight: 600 }}>{expert.nome}</p>
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              color: "#94A3B8",
            }}
          >
            {expert.categoria}
          </span>
        </div>
      </div>

      {/* Divider + Resumo */}
      <div style={{ borderTop: `1px solid ${PANEL_BORDER}` }}>
        <p style={{ color: "#64748B", fontSize: 12, fontWeight: 500, marginTop: 20, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Resumo
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {duracao && (
              <motion.div
                key="duracao"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ color: "#94A3B8", fontSize: 13 }}>Duração</span>
                <span style={{ color: TEXT_LIGHT, fontSize: 13, fontWeight: 500 }}>{duracao} min</span>
              </motion.div>
            )}
            {data && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ color: "#94A3B8", fontSize: 13 }}>Data</span>
                <span style={{ color: TEXT_LIGHT, fontSize: 13, fontWeight: 500 }}>
                  {data.getDate()} de {MESES_CURTO[data.getMonth()]}
                </span>
              </motion.div>
            )}
            {horario && (
              <motion.div
                key="horario"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ color: "#94A3B8", fontSize: 13 }}>Horário</span>
                <span style={{ color: TEXT_LIGHT, fontSize: 13, fontWeight: 500 }}>{horario}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Total */}
      <AnimatePresence>
        {total !== null && (
          <motion.div
            key="total"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              borderTop: `1px solid ${PANEL_BORDER}`,
              paddingTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#94A3B8", fontSize: 13 }}>Total</span>
            <span style={{ color: LIME, fontSize: 20, fontWeight: 700 }}>R$ {fmt(total)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ["Sessão", "Horário", "Dados", "Briefing", "Pagamento", "Confirmação"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done ? LIME : active ? DARK : "transparent",
                  border: done ? "none" : active ? "none" : `1.5px solid ${BEIGE_MID}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#fff" : TEXT_MUTED }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, color: active ? TEXT_DARK : TEXT_MUTED, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                style={{
                  height: 1.5,
                  width: 32,
                  background: i < current ? LIME : BEIGE_MID,
                  marginBottom: 18,
                  marginLeft: 4,
                  marginRight: 4,
                  flexShrink: 0,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Sessão (duração) ─────────────────────────────────────────────────

function StepSessao({ expert, duracao, onSelect }: {
  expert: Expert;
  duracao: number | null;
  onSelect: (v: number) => void;
}) {
  const mid = expert.duracoes[Math.floor(expert.duracoes.length / 2)];
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Quanto tempo você precisa?</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 28 }}>Escolha a duração ideal para o seu objetivo.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {expert.duracoes.slice(0, 3).map((min) => {
          const preco = precoPor(expert, min);
          const ativo = duracao === min;
          const popular = min === mid;
          return (
            <button
              key={min}
              onClick={() => onSelect(min)}
              style={{
                border: ativo ? `2px solid ${DARK}` : `1.5px solid ${BEIGE_MID}`,
                borderRadius: 16,
                padding: "20px 16px",
                background: ativo ? DARK : CARD_BG,
                cursor: "pointer",
                position: "relative",
                transition: "all 0.18s",
                textAlign: "center",
              }}
            >
              {popular && (
                <span style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: LIME,
                  color: DARK,
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: "2px 10px",
                  whiteSpace: "nowrap",
                }}>
                  Mais popular
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: ativo ? `2px solid ${LIME}` : `2px solid ${BEIGE_MID}`,
                  background: ativo ? LIME : "transparent",
                  flexShrink: 0,
                  transition: "all 0.18s",
                }} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: ativo ? TEXT_LIGHT : TEXT_DARK }}>{min}</p>
              <p style={{ fontSize: 13, color: ativo ? "#94A3B8" : TEXT_MUTED }}>minutos</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: ativo ? LIME : TEXT_DARK, marginTop: 8 }}>
                R$ {fmt(preco)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Horário (data + slot) ────────────────────────────────────────────

function StepHorario({ data, horario, onData, onHorario }: {
  data: Date | null;
  horario: string | null;
  onData: (d: Date) => void;
  onHorario: (h: string) => void;
}) {
  const datas = gerarDatas();
  const slots = data ? gerarSlots(data) : [];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Qual dia e horário?</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 24 }}>Próximas 2 semanas disponíveis. Horários em Brasília (GMT-3).</p>

      {/* Day pills */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
        {datas.map((d) => {
          const ativo = data?.toDateString() === d.toDateString();
          return (
            <button
              key={d.toISOString()}
              onClick={() => { onData(d); onHorario(""); }}
              style={{
                flexShrink: 0,
                width: 54,
                height: 68,
                borderRadius: 12,
                border: ativo ? `2px solid ${DARK}` : `1.5px solid ${BEIGE_MID}`,
                background: ativo ? DARK : CARD_BG,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 500, color: ativo ? "#94A3B8" : TEXT_MUTED }}>
                {DIAS_SEMANA[d.getDay()]}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: ativo ? TEXT_LIGHT : TEXT_DARK, lineHeight: 1 }}>
                {d.getDate()}
              </span>
              <span style={{ fontSize: 10, color: ativo ? "#94A3B8" : TEXT_MUTED }}>
                {MESES_CURTO[d.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {data && (
        <div>
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 12, fontWeight: 500 }}>
            {dataLonga(data)}
          </p>
          {slots.length === 0 ? (
            <p style={{ fontSize: 14, color: TEXT_MUTED }}>Sem horários disponíveis nesse dia.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {slots.map((h) => {
                const ativo = horario === h;
                return (
                  <button
                    key={h}
                    onClick={() => onHorario(h)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      border: ativo ? `2px solid ${DARK}` : `1.5px solid ${BEIGE_MID}`,
                      background: ativo ? DARK : CARD_BG,
                      color: ativo ? TEXT_LIGHT : TEXT_DARK,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!data && (
        <p style={{ fontSize: 14, color: TEXT_MUTED, fontStyle: "italic" }}>Selecione um dia para ver os horários disponíveis.</p>
      )}
    </div>
  );
}

// ─── Step 2: Dados pessoais ───────────────────────────────────────────────────

function StepDados({ nome, email, onChange }: {
  nome: string;
  email: string;
  onChange: (field: "nome" | "email", val: string) => void;
}) {
  const inputStyle = {
    width: "100%",
    borderRadius: 12,
    border: `1.5px solid ${BEIGE_MID}`,
    background: BEIGE_CARD,
    padding: "14px 16px",
    fontSize: 14,
    color: TEXT_DARK,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Seus dados de contato</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 28 }}>Para enviarmos a confirmação e o link da sala.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: TEXT_DARK, marginBottom: 6 }}>Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onChange("nome", e.target.value)}
            placeholder="Como prefere ser chamado(a)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: TEXT_DARK, marginBottom: 6 }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
            Você receberá a confirmação e o link da reunião por e-mail.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Intake / Briefing ────────────────────────────────────────────────

function StepIntake({ respostas, onChange }: {
  respostas: string[];
  onChange: (i: number, val: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Conte o que você precisa</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 28 }}>
        Essas informações ajudam o mentor a se preparar. Responda o que conseguir — tudo é opcional.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {PERGUNTAS.map((pergunta, i) => (
          <div key={i}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: TEXT_DARK, marginBottom: 8 }}>
              {i + 1}. {pergunta}
            </label>
            <textarea
              value={respostas[i]}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="Opcional…"
              rows={3}
              style={{
                width: "100%",
                borderRadius: 12,
                border: `1.5px solid ${BEIGE_MID}`,
                background: BEIGE_CARD,
                padding: "12px 16px",
                fontSize: 14,
                color: TEXT_DARK,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Pagamento (Pix) ──────────────────────────────────────────────────

function StepPagamento({ expert, duracao, data, horario, nome, onPago }: {
  expert: Expert;
  duracao: number;
  data: Date;
  horario: string;
  nome: string;
  onPago: () => void;
}) {
  const total = precoPor(expert, duracao);
  const [secs, setSecs] = useState(300);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  function copiar() {
    navigator.clipboard.writeText(PIX_CODE).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const expirou = secs <= 0;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Pagamento via Pix</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 24 }}>
        Escaneie o QR Code ou copie o código abaixo. Sua sessão será confirmada assim que o pagamento for identificado.
      </p>

      {/* Resumo */}
      <div style={{
        background: BEIGE_CARD,
        border: `1px solid ${BEIGE_MID}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        textAlign: "center",
      }}>
        <div>
          <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2 }}>Com</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>{expert.nome.split(" ")[0]}</p>
        </div>
        <div style={{ borderLeft: `1px solid ${BEIGE_MID}`, borderRight: `1px solid ${BEIGE_MID}` }}>
          <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2 }}>{dataLonga(data)}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>{horario}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2 }}>Total</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>R$ {fmt(total)}</p>
        </div>
      </div>

      {/* QR + código */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <QrCode />
          {/* Timer */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            {expirou ? (
              <p style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>QR Code expirado</p>
            ) : (
              <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                Expira em <strong style={{ color: secs < 60 ? "#EF4444" : TEXT_DARK }}>{mm}:{ss}</strong>
              </p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: TEXT_DARK, marginBottom: 8 }}>Ou copie o código Pix</p>
          <div style={{
            background: BEIGE_CARD,
            border: `1.5px solid ${BEIGE_MID}`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 11,
            color: TEXT_MUTED,
            wordBreak: "break-all",
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            {PIX_CODE}
          </div>
          <button
            onClick={copiar}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: `1.5px solid ${BEIGE_MID}`,
              background: copiado ? LIME : CARD_BG,
              color: copiado ? DARK : TEXT_DARK,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copiado ? "✓ Copiado!" : "Copiar código"}
          </button>

          <button
            onClick={onPago}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: LIME,
              color: DARK,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Já paguei →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Confirmação ──────────────────────────────────────────────────────

function StepConfirmacao({ expert, duracao, data, horario, nome }: {
  expert: Expert;
  duracao: number;
  data: Date;
  horario: string;
  nome: string;
}) {
  const sessionId = useRef(gerarSessionId(expert.slug)).current;

  return (
    <div style={{ textAlign: "center" }}>
      {/* Checkmark animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: LIME,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16l6 6 10-10" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT_DARK, marginBottom: 6 }}>Sessão confirmada! 🎉</h2>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 28 }}>
        Enviamos a confirmação e o link da reunião para o seu e-mail.
      </p>

      {/* Card resumo */}
      <div style={{
        background: BEIGE_CARD,
        border: `1px solid ${BEIGE_MID}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        textAlign: "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>ID da sessão</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, fontFamily: "monospace" }}>{sessionId}</span>
        </div>
        {[
          ["Mentor", expert.nome],
          ["Data", dataLonga(data)],
          ["Horário", horario],
          ["Duração", `${duracao} minutos`],
          ["Total pago", `R$ ${fmt(precoPor(expert, duracao))}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${BEIGE_MID}` }}>
            <span style={{ fontSize: 13, color: TEXT_MUTED }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_DARK }}>{value}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href={`/${expert.slug}`}
          style={{
            display: "block",
            padding: "14px",
            borderRadius: 12,
            background: DARK,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Acessar sala de espera
        </Link>
        <button
          style={{
            padding: "14px",
            borderRadius: 12,
            border: `1.5px solid ${BEIGE_MID}`,
            background: "transparent",
            color: TEXT_DARK,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Adicionar ao calendário (.ics)
        </button>
      </div>
    </div>
  );
}

// ─── BookingFlow (main) ───────────────────────────────────────────────────────

export function BookingFlow({ expert }: { expert: Expert }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // form state
  const [duracao, setDuracao] = useState<number | null>(null);
  const [data, setData] = useState<Date | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [respostas, setRespostas] = useState(["", "", ""]);

  function avancar() {
    setDir(1);
    setStep((s) => s + 1);
  }

  function voltar() {
    setDir(-1);
    setStep((s) => s - 1);
  }

  function podeAvancar() {
    if (step === 0) return duracao !== null;
    if (step === 1) return data !== null && !!horario;
    if (step === 2) return nome.trim().length >= 2 && email.includes("@");
    if (step === 3) return true; // briefing opcional
    return false;
  }

  const showNav = step < 4; // oculto no pagamento e confirmação

  return (
    <div style={{ minHeight: "100vh", background: BEIGE_BG }}>

      {/* ── Nav header ── */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 72,
        backdropFilter: "blur(12px)",
        background: "rgba(246,241,233,0.85)",
        borderBottom: `1px solid ${BEIGE_MID}`,
      }}>
        <Logo size="header" />
        <Link
          href={`/${expert.slug}`}
          style={{ fontSize: 14, color: TEXT_MUTED, textDecoration: "none", fontWeight: 500 }}
        >
          ← Voltar ao perfil
        </Link>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "108px 24px 80px", display: "flex", gap: 32, alignItems: "flex-start" }}>

        {/* Painel esquerdo */}
        <PainelResumo expert={expert} duracao={duracao} data={data} horario={horario} />

        {/* Card principal */}
        <div style={{ flex: 1, background: CARD_BG, borderRadius: 24, padding: 40, border: `1px solid ${BEIGE_MID}` }}>

          {/* Step indicator */}
          <div style={{ marginBottom: 36, overflowX: "auto" }}>
            <StepIndicator current={step} />
          </div>

          {/* Conteúdo animado */}
          <div style={{ minHeight: 380, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTrans}
              >
                {step === 0 && (
                  <StepSessao
                    expert={expert}
                    duracao={duracao}
                    onSelect={setDuracao}
                  />
                )}
                {step === 1 && (
                  <StepHorario
                    data={data}
                    horario={horario}
                    onData={(d) => { setData(d); setHorario(null); }}
                    onHorario={setHorario}
                  />
                )}
                {step === 2 && (
                  <StepDados
                    nome={nome}
                    email={email}
                    onChange={(field, val) => field === "nome" ? setNome(val) : setEmail(val)}
                  />
                )}
                {step === 3 && (
                  <StepIntake
                    respostas={respostas}
                    onChange={(i, val) => setRespostas((r) => { const n = [...r]; n[i] = val; return n; })}
                  />
                )}
                {step === 4 && (
                  <StepPagamento
                    expert={expert}
                    duracao={duracao!}
                    data={data!}
                    horario={horario!}
                    nome={nome}
                    onPago={avancar}
                  />
                )}
                {step === 5 && (
                  <StepConfirmacao
                    expert={expert}
                    duracao={duracao!}
                    data={data!}
                    horario={horario!}
                    nome={nome}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navegação */}
          {showNav && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
              paddingTop: 24,
              borderTop: `1px solid ${BEIGE_MID}`,
            }}>
              <button
                onClick={voltar}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1.5px solid ${BEIGE_MID}`,
                  background: "transparent",
                  color: TEXT_MUTED,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  visibility: step === 0 ? "hidden" : "visible",
                }}
              >
                ← Voltar
              </button>

              <button
                onClick={avancar}
                disabled={!podeAvancar()}
                style={{
                  padding: "12px 28px",
                  borderRadius: 10,
                  border: "none",
                  background: podeAvancar() ? DARK : BEIGE_MID,
                  color: podeAvancar() ? TEXT_LIGHT : TEXT_MUTED,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: podeAvancar() ? "pointer" : "not-allowed",
                  transition: "all 0.18s",
                }}
              >
                {step === 3 ? "Ir para pagamento →" : "Próximo →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
