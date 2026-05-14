"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { experts } from "@/lib/mockExperts";
import { IconStar, IconCalendar, IconVideo, IconCheck } from "@/components/icons";

// ─── mock do criador logado ───────────────────────────────────────────────────

const MENTOR = experts[0]; // andre-carvalhal como mock do criador logado

// ─── tipos ────────────────────────────────────────────────────────────────────

type StatusSessao = "proxima" | "concluida" | "cancelada";

interface SessaoDash {
  id: string;
  seguidorNome: string;
  seguidorAvatar: string;
  data: Date;
  duracao: number;
  valor: number;
  status: StatusSessao;
  nota?: number;
}

interface Payout {
  semana: string;
  bruto: number;
  taxa: number;
  liquido: number;
  status: "pago" | "pendente" | "processando";
  data?: Date;
}

// ─── mock data ────────────────────────────────────────────────────────────────

function gerarSessoes(): SessaoDash[] {
  const agora = new Date();
  function d(dias: number, hora: number) {
    const x = new Date(agora);
    x.setDate(x.getDate() + dias);
    x.setHours(hora, 0, 0, 0);
    return x;
  }
  const avatares = [
    "https://randomuser.me/api/portraits/women/12.jpg",
    "https://randomuser.me/api/portraits/men/34.jpg",
    "https://randomuser.me/api/portraits/women/56.jpg",
    "https://randomuser.me/api/portraits/men/78.jpg",
    "https://randomuser.me/api/portraits/women/90.jpg",
    "https://randomuser.me/api/portraits/men/22.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
  ];
  return [
    { id: "1", seguidorNome: "Camila Rocha", seguidorAvatar: avatares[0], data: d(1, 14), duracao: 30, valor: 125, status: "proxima" },
    { id: "2", seguidorNome: "Rafael Lima", seguidorAvatar: avatares[1], data: d(3, 10), duracao: 60, valor: 250, status: "proxima" },
    { id: "3", seguidorNome: "Ana Beatriz", seguidorAvatar: avatares[2], data: d(-1, 15), duracao: 30, valor: 125, status: "concluida", nota: 5 },
    { id: "4", seguidorNome: "João Victor", seguidorAvatar: avatares[3], data: d(-4, 11), duracao: 45, valor: 188, status: "concluida", nota: 4 },
    { id: "5", seguidorNome: "Mariana Silva", seguidorAvatar: avatares[4], data: d(-7, 16), duracao: 30, valor: 125, status: "concluida", nota: 5 },
    { id: "6", seguidorNome: "Pedro Alves", seguidorAvatar: avatares[5], data: d(-10, 9), duracao: 60, valor: 250, status: "concluida", nota: 3 },
    { id: "7", seguidorNome: "Letícia Nunes", seguidorAvatar: avatares[6], data: d(-15, 14), duracao: 30, valor: 125, status: "cancelada" },
  ];
}

function gerarPayouts(): Payout[] {
  const agora = new Date();
  function semana(offset: number) {
    const d = new Date(agora);
    d.setDate(d.getDate() - offset * 7);
    const fim = new Date(d);
    const ini = new Date(d);
    ini.setDate(ini.getDate() - 6);
    return `${ini.getDate()}/${ini.getMonth() + 1} – ${fim.getDate()}/${fim.getMonth() + 1}`;
  }
  return [
    { semana: semana(0), bruto: 500, taxa: 75, liquido: 425, status: "processando" },
    { semana: semana(1), bruto: 688, taxa: 103, liquido: 585, status: "pago", data: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d; })() },
    { semana: semana(2), bruto: 375, taxa: 56, liquido: 319, status: "pago", data: (() => { const d = new Date(); d.setDate(d.getDate() - 12); return d; })() },
    { semana: semana(3), bruto: 250, taxa: 37, liquido: 213, status: "pago", data: (() => { const d = new Date(); d.setDate(d.getDate() - 19); return d; })() },
  ];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmt(v: number) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); }
function fmtData(d: Date) { return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} ${MESES_CURTO[d.getMonth()]}`; }
function fmtHora(d: Date) { return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function diasAte(d: Date) {
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

// ─── mini-gráfico de barras (receita semanal) ─────────────────────────────────

function MiniBarChart({ payouts }: { payouts: Payout[] }) {
  const max = Math.max(...payouts.map((p) => p.liquido));
  const reversed = [...payouts].reverse();
  return (
    <div className="flex items-end gap-1.5 h-16">
      {reversed.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-lg transition-all ${
              p.status === "processando" ? "bg-lime/50" : "bg-lime"
            }`}
            style={{ height: `${(p.liquido / max) * 52}px` }}
          />
          <span className="text-[9px] text-gray-400 leading-none">{p.semana.split("–")[0].trim()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── card de sessão ───────────────────────────────────────────────────────────

function CardSessaoDash({ sessao }: { sessao: SessaoDash }) {
  const proxima = sessao.status === "proxima";
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-0">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
        <Image src={sessao.seguidorAvatar} alt={sessao.seguidorNome} fill className="object-cover" sizes="40px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{sessao.seguidorNome}</p>
        <p className="text-xs text-gray-400">{fmtData(sessao.data)} · {fmtHora(sessao.data)} · {sessao.duracao} min</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">R$ {fmt(sessao.valor)}</p>
        {proxima && (
          <span className="text-[10px] font-semibold text-lime">{diasAte(sessao.data)}</span>
        )}
        {sessao.status === "concluida" && sessao.nota && (
          <div className="flex items-center gap-0.5 justify-end mt-0.5">
            {[1,2,3,4,5].map((n) => (
              <IconStar key={n} className={`w-3 h-3 ${n <= sessao.nota! ? "text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
        )}
        {sessao.status === "cancelada" && (
          <span className="text-[10px] text-red-400">Cancelada</span>
        )}
      </div>
    </div>
  );
}

// ─── seção payout ─────────────────────────────────────────────────────────────

function SecaoPayout({ payouts }: { payouts: Payout[] }) {
  const pendente = payouts.find((p) => p.status === "processando");
  return (
    <div className="bg-gray-900 rounded-3xl p-6 text-white">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-gray-400 text-xs mb-1">Próximo repasse (Pix)</p>
          <p className="text-3xl font-bold">
            R$ {pendente ? fmt(pendente.liquido) : "0,00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {pendente
              ? `Semana ${pendente.semana} · taxa 15%`
              : "Sem repasse pendente"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime/20 text-lime text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          Processando
        </div>
      </div>

      {/* Mini gráfico */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-3">Receita líquida — últimas 4 semanas</p>
        <MiniBarChart payouts={payouts} />
      </div>

      {/* Histórico de repasses */}
      <div className="border-t border-gray-800 pt-4 space-y-3">
        {payouts.filter((p) => p.status === "pago").map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">{p.semana}</p>
              <p className="text-xs text-gray-500">
                {p.data ? `Pago em ${p.data.getDate()}/${p.data.getMonth() + 1}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">R$ {fmt(p.liquido)}</p>
              <div className="flex items-center gap-1 justify-end">
                <IconCheck className="w-3 h-3 text-lime" />
                <span className="text-[10px] text-lime">Pago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────

type Tab = "proximas" | "historico";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("proximas");
  const sessoes = gerarSessoes();
  const payouts = gerarPayouts();

  const proximas = sessoes.filter((s) => s.status === "proxima");
  const historico = sessoes.filter((s) => s.status !== "proxima");

  const receitaTotal = sessoes.filter((s) => s.status === "concluida").reduce((a, s) => a + s.valor, 0);
  const mediaNota = (() => {
    const comNota = sessoes.filter((s) => s.nota !== undefined);
    if (!comNota.length) return 0;
    return comNota.reduce((a, s) => a + (s.nota ?? 0), 0) / comNota.length;
  })();
  const taxaConversao = Math.round((sessoes.filter((s) => s.status === "concluida").length / Math.max(sessoes.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-24">

        {/* Header com perfil */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image src={`/mentors/${MENTOR.slug}/profile.webp`} alt={MENTOR.nome} fill className="object-cover" sizes="48px" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Olá,</p>
              <p className="font-bold text-gray-900">{MENTOR.nome.split(" ")[0]}</p>
            </div>
          </div>
          <Link
            href={`/${MENTOR.slug}`}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
          >
            Ver perfil público
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Receita total</p>
            <p className="text-2xl font-bold text-gray-900">R$ {fmt(receitaTotal)}</p>
            <p className="text-xs text-gray-400 mt-1">sessões concluídas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Nota média</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-900">{mediaNota > 0 ? mediaNota.toFixed(1) : "—"}</p>
              {mediaNota > 0 && <IconStar className="w-4 h-4 text-amber-400 mb-0.5" />}
            </div>
            <p className="text-xs text-gray-400 mt-1">de 5.0 possíveis</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Próximas sessões</p>
            <p className="text-2xl font-bold text-gray-900">{proximas.length}</p>
            <p className="text-xs text-lime font-semibold mt-1">agendadas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Taxa de conclusão</p>
            <p className="text-2xl font-bold text-gray-900">{taxaConversao}%</p>
            <p className="text-xs text-gray-400 mt-1">das sessões</p>
          </div>
        </div>

        {/* Payout */}
        <div className="mb-6">
          <SecaoPayout payouts={payouts} />
        </div>

        {/* Sessões */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1 p-3 border-b border-gray-100">
            {(["proximas", "historico"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "proximas" ? `Próximas (${proximas.length})` : `Histórico (${historico.length})`}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="px-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {(tab === "proximas" ? proximas : historico).length === 0 ? (
                  <div className="py-12 text-center">
                    <IconCalendar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Nenhuma sessão aqui ainda.</p>
                  </div>
                ) : (
                  (tab === "proximas" ? proximas : historico).map((s) => (
                    <CardSessaoDash key={s.id} sessao={s} />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Rodapé */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{sessoes.length} sessões no total</p>
            <Link
              href={`/${MENTOR.slug}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <IconVideo className="w-3.5 h-3.5" />
              Entrar na sala
            </Link>
          </div>
        </div>

        {/* CTA configurar perfil */}
        <div className="mt-6 bg-lime/10 border border-lime/30 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Complete seu perfil</p>
            <p className="text-xs text-gray-500 mt-0.5">Adicione foto de capa e redes sociais para atrair mais seguidores.</p>
          </div>
          <Link
            href="/criar"
            className="flex-shrink-0 ml-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            Editar
          </Link>
        </div>

      </div>
    </div>
  );
}
