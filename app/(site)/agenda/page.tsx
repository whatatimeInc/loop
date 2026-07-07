"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { experts } from "@/lib/mockExperts";
import { IconCalendar, IconVideo, IconStar } from "@/components/icons";

// ─── tipos e mock ─────────────────────────────────────────────────────────────

type StatusSessao = "proxima" | "acontecendo" | "concluida" | "cancelada";

interface Sessao {
  bookingId: string;
  expertSlug: string;
  data: Date;
  duracao: number;
  preco: number;
  status: StatusSessao;
  nota?: number;
}

function gerarMock(): Sessao[] {
  const agora = new Date();

  function dataRelativa(dias: number, hora: number, min = 0) {
    const d = new Date(agora);
    d.setDate(d.getDate() + dias);
    d.setHours(hora, min, 0, 0);
    return d;
  }

  return [
    {
      bookingId: `andre-carvalhal-${Date.now() + 1}`,
      expertSlug: "andre-carvalhal",
      data: dataRelativa(2, 15),
      duracao: 30,
      preco: 125,
      status: "proxima",
    },
    {
      bookingId: `estevan-sartoreli-${Date.now() + 2}`,
      expertSlug: "estevan-sartoreli",
      data: dataRelativa(5, 10),
      duracao: 60,
      preco: 200,
      status: "proxima",
    },
    {
      bookingId: `andre-do-amaral-${Date.now() - 10000}`,
      expertSlug: "andre-do-amaral",
      data: dataRelativa(-3, 14),
      duracao: 30,
      preco: 90,
      status: "concluida",
      nota: 5,
    },
    {
      bookingId: `felipe-memoria-${Date.now() - 20000}`,
      expertSlug: "felipe-memoria",
      data: dataRelativa(-10, 11),
      duracao: 45,
      preco: 150,
      status: "concluida",
      nota: 4,
    },
    {
      bookingId: `leandro-assis-${Date.now() - 30000}`,
      expertSlug: "leandro-assis",
      data: dataRelativa(-18, 16),
      duracao: 30,
      preco: 110,
      status: "concluida",
      nota: 5,
    },
    {
      bookingId: `ludolf-david-${Date.now() - 40000}`,
      expertSlug: "ludolf-david",
      data: dataRelativa(-25, 9),
      duracao: 60,
      preco: 180,
      status: "cancelada",
    },
  ];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatData(d: Date) {
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} ${MESES_CURTO[d.getMonth()]}`;
}

function formatHora(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function diasAte(d: Date) {
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

// ─── card de sessão ───────────────────────────────────────────────────────────

function CardSessao({ sessao }: { sessao: Sessao }) {
  const expert = experts.find((e) => e.slug === sessao.expertSlug);
  if (!expert) return null;

  const proxima = sessao.status === "proxima" || sessao.status === "acontecendo";

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${
      proxima ? "border-gray-200" : "border-gray-100"
    }`}>
      <div className="flex items-start gap-4 p-5">
        {/* Foto */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={`/mentors/${expert.slug}/profile.webp`}
            alt={expert.nome}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{expert.nome}</p>
            <StatusBadge status={sessao.status} />
          </div>
          <p className="text-xs text-gray-400 mb-2">{expert.categoria}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <IconCalendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatData(sessao.data)}
            </span>
            <span>{formatHora(sessao.data)}</span>
            <span>{sessao.duracao} min</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className={`px-5 pb-4 flex items-center justify-between border-t ${proxima ? "border-gray-100" : "border-gray-50"}`}>
        <span className="text-xs text-gray-400 pt-3">R$ {formatPreco(sessao.preco)}</span>

        <div className="flex items-center gap-2 pt-3">
          {sessao.status === "proxima" && (
            <>
              <span className="text-xs text-lime font-semibold">{diasAte(sessao.data)}</span>
              <Link
                href={`/sala/${sessao.bookingId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                <IconVideo className="w-3.5 h-3.5" />
                Entrar
              </Link>
            </>
          )}
          {sessao.status === "concluida" && sessao.nota === undefined && (
            <Link
              href={`/avaliar/${sessao.bookingId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <IconStar className="w-3.5 h-3.5 text-amber-400" />
              Avaliar
            </Link>
          )}
          {sessao.status === "concluida" && sessao.nota !== undefined && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <IconStar key={n} className={`w-3.5 h-3.5 ${n <= sessao.nota! ? "text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
          )}
          {sessao.status === "cancelada" && (
            <Link
              href={`/${expert.slug}`}
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
          <IconCalendar className="w-7 h-7 text-gray-300" />
        ) : (
          <IconStar className="w-7 h-7 text-gray-300" />
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

export default function AgendaPage() {
  const [tab, setTab] = useState<Tab>("proximas");
  const sessoes = gerarMock();

  const proximas = sessoes.filter((s) => s.status === "proxima" || s.status === "acontecendo");
  const historico = sessoes.filter((s) => s.status === "concluida" || s.status === "cancelada");

  const lista = tab === "proximas" ? proximas : historico;

  // KPIs rápidos
  const totalGasto = historico
    .filter((s) => s.status === "concluida")
    .reduce((acc, s) => acc + s.preco, 0);
  const mediaNota =
    historico.filter((s) => s.nota !== undefined).length > 0
      ? historico.filter((s) => s.nota !== undefined).reduce((acc, s) => acc + (s.nota ?? 0), 0) /
        historico.filter((s) => s.nota !== undefined).length
      : 0;

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
            <p className="text-2xl font-bold text-gray-900">{historico.filter((s) => s.status === "concluida").length}</p>
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
                  <CardSessao key={s.bookingId} sessao={s} />
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
