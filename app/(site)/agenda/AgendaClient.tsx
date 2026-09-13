"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { utcToZoned } from "@/lib/slots";
import { Calendar, VideoCamera, StarSolid } from "iconoir-react";

// ─── props (loaded by page.tsx from public.sessions) ─────────────────────────

export type AgendaSessao = {
  id: string;              // sessions.id (uuid)
  startsAt: string;        // ISO instant
  durationMinutes: number;
  priceCents: number;
  status: string;          // agendada | concluída | cancelada | mentor_no_show | guest_no_show
  mentorName: string;
  mentorUsername: string;  // profile slug — /<username> is the creator page
  mentorPhotoUrl: string | null;
  mentorCategory: string | null;
  myRating: number | null; // the guest's own review of this session
};

type StatusSessao = "proxima" | "acontecendo" | "concluida" | "cancelada";

type Sessao = AgendaSessao & { situacao: StatusSessao };

/** A session releases its room 10 minutes before the start. */
const EARLY_ENTRY_MINUTES = 10;

// ─── helpers ──────────────────────────────────────────────────────────────────

const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatData(iso: string) {
  const z = utcToZoned(new Date(iso));
  const [, mes, dia] = z.dateStr.split("-").map(Number);
  return `${DIAS_SEMANA[z.weekday]}, ${dia} ${MESES_CURTO[mes - 1]}`;
}

function formatHora(iso: string) {
  const z = utcToZoned(new Date(iso));
  return `${pad(Math.floor(z.minutes / 60))}:${pad(z.minutes % 60)}`;
}

function formatPreco(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Whole days between two "YYYY-MM-DD" strings (both parsed as UTC midnight). */
function diasEntre(de: string, para: string) {
  return Math.round((Date.parse(para) - Date.parse(de)) / 86_400_000);
}

function diasAte(iso: string) {
  const hoje = utcToZoned(new Date()).dateStr;
  const alvo = utcToZoned(new Date(iso)).dateStr;
  const diff = diasEntre(hoje, alvo);
  if (diff <= 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

/** DB status + clock → what the card shows. */
function situacaoDe(s: AgendaSessao, now: number): StatusSessao {
  if (s.status === "cancelada" || s.status === "mentor_no_show" || s.status === "guest_no_show") {
    return "cancelada";
  }
  const start = new Date(s.startsAt).getTime();
  const end = start + s.durationMinutes * 60_000;
  if (now >= start - EARLY_ENTRY_MINUTES * 60_000 && now <= end) return "acontecendo";
  if (s.status === "concluída" || now > end) return "concluida";
  return "proxima";
}

// ─── avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
          {initials}
        </div>
      )}
    </div>
  );
}

// ─── card de sessão ───────────────────────────────────────────────────────────

function CardSessao({ sessao }: { sessao: Sessao }) {
  const proxima = sessao.situacao === "proxima" || sessao.situacao === "acontecendo";

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${
      proxima ? "border-gray-200" : "border-gray-100"
    }`}>
      <div className="flex items-start gap-4 p-5">
        <Avatar name={sessao.mentorName} photoUrl={sessao.mentorPhotoUrl} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{sessao.mentorName}</p>
            <StatusBadge status={sessao.situacao} />
          </div>
          {sessao.mentorCategory && <p className="text-xs text-gray-400 mb-2">{sessao.mentorCategory}</p>}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatData(sessao.startsAt)}
            </span>
            <span>{formatHora(sessao.startsAt)}</span>
            <span>{sessao.durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className={`px-5 pb-4 flex items-center justify-between border-t ${proxima ? "border-gray-100" : "border-gray-50"}`}>
        <span className="text-xs text-gray-400 pt-3">R$ {formatPreco(sessao.priceCents)}</span>

        <div className="flex items-center gap-2 pt-3">
          {proxima && (
            <>
              <span className="text-xs text-lime font-semibold">{diasAte(sessao.startsAt)}</span>
              <Link
                href={`/sala/${sessao.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                <VideoCamera className="w-3.5 h-3.5" />
                Entrar
              </Link>
            </>
          )}
          {sessao.situacao === "concluida" && sessao.myRating === null && (
            <Link
              href={`/avaliar/${sessao.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <StarSolid className="w-3.5 h-3.5 text-amber-400" />
              Avaliar
            </Link>
          )}
          {sessao.situacao === "concluida" && sessao.myRating !== null && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarSolid key={n} className={`w-3.5 h-3.5 ${n <= (sessao.myRating ?? 0) ? "text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
          )}
          {sessao.situacao === "cancelada" && sessao.mentorUsername && (
            <Link
              href={`/${sessao.mentorUsername}`}
              className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Reagendar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusSessao }) {
  const map: Record<StatusSessao, { label: string; className: string }> = {
    proxima: { label: "Confirmada", className: "bg-lime/20 text-dark" },
    acontecendo: { label: "Ao vivo", className: "bg-red-100 text-red-600" },
    concluida: { label: "Concluída", className: "bg-gray-100 text-gray-500" },
    cancelada: { label: "Cancelada", className: "bg-red-50 text-red-400" },
  };
  const { label, className } = map[status];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${className}`}>
      {label}
    </span>
  );
}

// ─── estado vazio ─────────────────────────────────────────────────────────────

function Empty({ tab }: { tab: "proximas" | "historico" }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {tab === "proximas" ? (
          <Calendar className="w-7 h-7 text-gray-300" />
        ) : (
          <StarSolid className="w-7 h-7 text-gray-300" />
        )}
      </div>
      <p className="font-semibold text-gray-500 mb-1">
        {tab === "proximas" ? "Nenhuma sessão agendada" : "Sem histórico ainda"}
      </p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        {tab === "proximas"
          ? "Explore mentores e agende sua primeira sessão."
          : "Suas sessões concluídas aparecerão aqui."}
      </p>
      <Link
        href="/explorar"
        className="px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        Explorar mentores
      </Link>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────

type Tab = "proximas" | "historico";

export function AgendaClient({ sessoes }: { sessoes: AgendaSessao[] }) {
  const [tab, setTab] = useState<Tab>("proximas");

  const now = Date.now();
  const comSituacao: Sessao[] = sessoes.map((s) => ({ ...s, situacao: situacaoDe(s, now) }));

  const proximas = comSituacao
    .filter((s) => s.situacao === "proxima" || s.situacao === "acontecendo")
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const historico = comSituacao.filter((s) => s.situacao === "concluida" || s.situacao === "cancelada");

  const lista = tab === "proximas" ? proximas : historico;

  const concluidas = historico.filter((s) => s.situacao === "concluida");

  // KPIs rápidos
  const totalGasto = concluidas.reduce((acc, s) => acc + s.priceCents, 0);
  const notas = comSituacao.map((s) => s.myRating).filter((n): n is number => n !== null);
  const mediaNota = notas.length > 0 ? notas.reduce((acc, n) => acc + n, 0) / notas.length : 0;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Minha agenda</h1>
          <p className="text-gray-500 text-sm">Gerencie suas sessões e histórico</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{proximas.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Próximas</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{concluidas.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Concluídas</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {mediaNota > 0 ? mediaNota.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Nota média</p>
          </div>
        </div>

        {/* Total investido */}
        {totalGasto > 0 && (
          <div className="bg-gray-900 rounded-lg px-5 py-4 flex items-center justify-between mb-8">
            <p className="text-gray-400 text-sm">Total investido em mentoria</p>
            <p className="text-white font-bold text-lg">R$ {formatPreco(totalGasto)}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {(["proximas", "historico"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "proximas" ? `Próximas (${proximas.length})` : `Histórico (${historico.length})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {lista.length === 0 ? (
              <Empty tab={tab} />
            ) : (
              <div className="flex flex-col gap-3">
                {lista.map((s) => (
                  <CardSessao key={s.id} sessao={s} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA explorar */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-3">Quer aprender mais?</p>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-white transition-colors"
          >
            Explorar mentores
          </Link>
        </div>
      </div>
    </div>
  );
}
