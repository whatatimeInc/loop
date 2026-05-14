"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Expert } from "@/lib/mockExperts";
import { IconCheck, IconArrow } from "@/components/icons";
import { Button } from "@/components/ui/Button";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const HORARIOS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
// slots bloqueados (mock — números de índice variam por dia, mas aqui fixo pro MVP)
const HORARIOS_OCUPADOS = new Set(["10:00", "14:00"]);

function gerarDatas() {
  const hoje = new Date();
  const result: { valor: string; diaSemana: string; dia: number; mes: string }[] = [];
  let i = 1; // começa amanhã
  while (result.length < 14) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() !== 0) { // sem domingo
      result.push({
        valor: d.toISOString().split("T")[0],
        diaSemana: DIAS_SEMANA[d.getDay()],
        dia: d.getDate(),
        mes: MESES[d.getMonth()],
      });
    }
    i++;
  }
  return result;
}

function formatPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function precoPorDuracao(precoBase: number, duracao: number) {
  return Math.round((precoBase * duracao) / 60);
}

// ─── animação de slide entre steps ────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};
const transition = { duration: 0.22, ease: "easeInOut" as const };

// ─── steps ────────────────────────────────────────────────────────────────────

const STEPS = ["Duração", "Data", "Horário", "Briefing"];

interface Selecao {
  duracao: number | null;
  data: string | null;
  hora: string | null;
  briefing: string;
}

// ─── sub-componentes de cada step ─────────────────────────────────────────────

function StepDuracao({ expert, selecao, onSelect }: {
  expert: Expert;
  selecao: Selecao;
  onSelect: (duracao: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Quanto tempo você precisa?</h2>
      <p className="text-gray-500 text-sm mb-8">
        Escolha a duração ideal para o seu objetivo.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {expert.duracoes.map((min) => {
          const preco = precoPorDuracao(expert.preco, min);
          const ativo = selecao.duracao === min;
          return (
            <button
              key={min}
              onClick={() => onSelect(min)}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                ativo
                  ? "border-lime bg-lime/10"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{min}<span className="text-base font-normal text-gray-500 ml-1">min</span></p>
              <p className="text-gray-600 text-sm mt-1">R$ {formatPreco(preco)}</p>
              {min === 30 && (
                <span className="inline-block mt-2 text-[10px] font-semibold bg-lime text-dark px-2 py-0.5 rounded-full">
                  Mais popular
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepData({ selecao, onSelect }: {
  selecao: Selecao;
  onSelect: (data: string) => void;
}) {
  const datas = gerarDatas();
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Qual dia funciona pra você?</h2>
      <p className="text-gray-500 text-sm mb-8">
        Próximas 2 semanas disponíveis (exceto domingos).
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {datas.map((d) => {
          const ativo = selecao.data === d.valor;
          return (
            <button
              key={d.valor}
              onClick={() => onSelect(d.valor)}
              className={`rounded-xl border-2 py-3 text-center transition-all ${
                ativo
                  ? "border-lime bg-lime/10"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p className="text-xs text-gray-400 font-medium">{d.diaSemana}</p>
              <p className="text-xl font-bold text-gray-900 leading-none mt-1">{d.dia}</p>
              <p className="text-xs text-gray-400 mt-1">{d.mes}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepHorario({ selecao, onSelect }: {
  selecao: Selecao;
  onSelect: (hora: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Que horário prefere?</h2>
      <p className="text-gray-500 text-sm mb-8">
        Horários em Brasília (GMT-3).
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {HORARIOS.map((h) => {
          const ocupado = HORARIOS_OCUPADOS.has(h);
          const ativo = selecao.hora === h;
          return (
            <button
              key={h}
              disabled={ocupado}
              onClick={() => !ocupado && onSelect(h)}
              className={`rounded-xl border-2 py-3 text-center font-medium transition-all text-sm ${
                ocupado
                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  : ativo
                  ? "border-lime bg-lime/10 text-gray-900"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              {h}
              {ocupado && <span className="block text-[10px] text-gray-300 font-normal mt-0.5">Ocupado</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepBriefing({ expert, selecao, onChange }: {
  expert: Expert;
  selecao: Selecao;
  onChange: (briefing: string) => void;
}) {
  const MIN_CHARS = 50;
  const valido = selecao.briefing.trim().length >= MIN_CHARS;

  // formata data pro resumo
  const dataFormatada = selecao.data
    ? (() => {
        const [ano, mes, dia] = selecao.data.split("-").map(Number);
        return `${dia} de ${MESES[mes - 1]}`;
      })()
    : "";

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Conte o que você precisa</h2>
      <p className="text-gray-500 text-sm mb-6">
        Seu briefing ajuda o mentor a se preparar e aproveitar 100% do tempo juntos.
      </p>

      {/* Resumo da seleção */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 text-sm">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div className="px-2">
            <p className="text-gray-400 text-xs mb-1">Duração</p>
            <p className="font-semibold text-gray-900">{selecao.duracao} min</p>
          </div>
          <div className="px-2">
            <p className="text-gray-400 text-xs mb-1">Data</p>
            <p className="font-semibold text-gray-900">{dataFormatada}</p>
          </div>
          <div className="px-2">
            <p className="text-gray-400 text-xs mb-1">Horário</p>
            <p className="font-semibold text-gray-900">{selecao.hora}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Total</span>
          <span className="font-bold text-gray-900">
            R$ {formatPreco(precoPorDuracao(expert.preco, selecao.duracao ?? 30))}
          </span>
        </div>
      </div>

      <textarea
        value={selecao.briefing}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Ex: Tenho ${selecao.duracao} minutos e preciso de ajuda com...`}
        rows={5}
        className="w-full rounded-2xl border-2 border-gray-200 p-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime resize-none transition-colors"
      />
      <div className="flex justify-between mt-2">
        <p className={`text-xs ${valido ? "text-gray-400" : "text-amber-500"}`}>
          {valido
            ? "Ótimo! Seu mentor vai adorar essa clareza."
            : `Mínimo ${MIN_CHARS} caracteres (${selecao.briefing.trim().length}/${MIN_CHARS})`}
        </p>
        <p className="text-xs text-gray-300">{selecao.briefing.length}</p>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

export function BookingFlow({ expert }: { expert: Expert }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 = avança, -1 = volta
  const [selecao, setSelecao] = useState<Selecao>({
    duracao: expert.duracoes.includes(30) ? 30 : expert.duracoes[0],
    data: null,
    hora: null,
    briefing: "",
  });

  function avancar() {
    setDir(1);
    setStep((s) => s + 1);
  }

  function voltar() {
    setDir(-1);
    setStep((s) => s - 1);
  }

  function podeProsseguir() {
    if (step === 0) return selecao.duracao !== null;
    if (step === 1) return selecao.data !== null;
    if (step === 2) return selecao.hora !== null;
    if (step === 3) return selecao.briefing.trim().length >= 50;
    return false;
  }

  function confirmar() {
    const bookingId = `${expert.slug}-${Date.now()}`;
    router.push(`/checkout/${bookingId}`);
  }

  return (
    <div>
      {/* Progress stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((label, i) => {
          const concluido = i < step;
          const atual = i === step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    concluido
                      ? "bg-lime text-dark"
                      : atual
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {concluido ? <IconCheck className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${atual ? "text-gray-900" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-colors ${concluido ? "bg-lime" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Conteúdo animado */}
      <div className="relative overflow-hidden min-h-[340px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {step === 0 && (
              <StepDuracao
                expert={expert}
                selecao={selecao}
                onSelect={(duracao) => setSelecao((s) => ({ ...s, duracao }))}
              />
            )}
            {step === 1 && (
              <StepData
                selecao={selecao}
                onSelect={(data) => setSelecao((s) => ({ ...s, data, hora: null }))}
              />
            )}
            {step === 2 && (
              <StepHorario
                selecao={selecao}
                onSelect={(hora) => setSelecao((s) => ({ ...s, hora }))}
              />
            )}
            {step === 3 && (
              <StepBriefing
                expert={expert}
                selecao={selecao}
                onChange={(briefing) => setSelecao((s) => ({ ...s, briefing }))}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="ghost"
          size="md"
          onClick={voltar}
          className={step === 0 ? "invisible" : ""}
        >
          ← Voltar
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={avancar}
            disabled={!podeProsseguir()}
          >
            Próximo
            <IconArrow className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={confirmar}
            disabled={!podeProsseguir()}
          >
            Confirmar agendamento
            <IconArrow className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
