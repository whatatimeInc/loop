"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { categorias, type Categoria } from "@/lib/mockExperts";
import { IconCheck } from "@/components/icons";
import {
  IconCategoriaCarreira,
  IconCategoriaSaude,
  IconCategoriaArte,
  IconCategoriaGastronomia,
  IconCategoriaModa,
  IconCategoriaCasa,
} from "@/components/icons";

// ─── tipos ─────────────────────────────────────────────────────────────────────

interface FormData {
  nome: string;
  bio: string;
  fotoPreview: string | null;
  categoria: Categoria | null;
  duracoes: number[];
  precoBase: number;
  googleCalendar: boolean;
  diasDisponiveis: number[];  // 0=Dom … 6=Sáb
  horarioInicio: string;
  horarioFim: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  pixChave: string;
  doacao: boolean;
  doacaoInstituicao: string;
}

const INITIAL: FormData = {
  nome: "",
  bio: "",
  fotoPreview: null,
  categoria: null,
  duracoes: [30, 60],
  precoBase: 120,
  googleCalendar: false,
  diasDisponiveis: [1, 2, 3, 4, 5],
  horarioInicio: "09:00",
  horarioFim: "18:00",
  instagram: "",
  linkedin: "",
  twitter: "",
  pixChave: "",
  doacao: false,
  doacaoInstituicao: "",
};

const DURACOES_OPCOES = [30, 45, 60];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const categoriaIcones: Record<Categoria, React.ReactNode> = {
  "Carreira e Negócios": <IconCategoriaCarreira className="w-7 h-7" />,
  "Saúde e Bem Estar":   <IconCategoriaSaude className="w-7 h-7" />,
  "Criatividade":        <IconCategoriaArte className="w-7 h-7" />,
  "Gastronomia":         <IconCategoriaGastronomia className="w-7 h-7" />,
  "Estilo de Vida":      <IconCategoriaModa className="w-7 h-7" />,
  "Tecnologia":          <IconCategoriaCasa className="w-7 h-7" />,
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function precoPorDuracao(precoBase: number, min: number) {
  return Math.round((precoBase * min) / 60);
}

// ─── toggle genérico ───────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative flex-shrink-0 transition-colors"
      style={{
        width: 48,
        height: 28,
        borderRadius: 999,
        background: value ? "#CEFD58" : "#E7DAC8",
      }}
      aria-checked={value}
      role="switch"
    >
      <span
        className="absolute top-1 transition-transform"
        style={{
          left: 4,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#181D27",
          transform: value ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

// ─── step 1: perfil ────────────────────────────────────────────────────────────

function StepPerfil({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Seu perfil público</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Essa é a primeira impressão que os seguidores terão de você.</p>
      </div>

      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="relative overflow-hidden transition-opacity hover:opacity-80"
          style={{ width: 96, height: 96, borderRadius: "50%", background: "#E7DAC8", border: "2px dashed #C4B8A8" }}
        >
          {data.fotoPreview ? (
            <Image src={data.fotoPreview} alt="foto" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1" style={{ color: "#717680" }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[10px] font-medium">Adicionar foto</span>
            </div>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange({ fotoPreview: URL.createObjectURL(f) });
        }} />
        {data.fotoPreview && (
          <button onClick={() => onChange({ fotoPreview: null })} className="text-xs transition-opacity hover:opacity-60" style={{ color: "#717680" }}>
            Remover foto
          </button>
        )}
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Nome completo *</label>
        <input
          type="text"
          value={data.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Como você quer ser chamado?"
          className="w-full px-4 py-3.5 text-sm rounded-xl focus:outline-none transition-colors"
          style={{ border: "1px solid #E7DAC8", background: "#FCFBF8", color: "#181D27" }}
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold flex items-center justify-between" style={{ color: "#414651" }}>
          Bio *
          <span className="font-normal" style={{ color: "#717680" }}>{data.bio.length}/300</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value.slice(0, 300) })}
          placeholder="Conte quem você é, o que você ensina e para quem..."
          rows={4}
          className="w-full px-4 py-3.5 text-sm rounded-xl focus:outline-none resize-none transition-colors"
          style={{ border: "1px solid #E7DAC8", background: "#FCFBF8", color: "#181D27" }}
        />
        {data.bio.length > 0 && data.bio.length < 50 && (
          <p className="text-xs" style={{ color: "#D92D20" }}>Mínimo 50 caracteres ({data.bio.length}/50)</p>
        )}
      </div>
    </div>
  );
}

// ─── step 2: categoria ─────────────────────────────────────────────────────────

function StepCategoria({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Qual é a sua área?</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Escolha a categoria que melhor representa o seu conhecimento.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categorias.map((cat) => {
          const ativo = data.categoria === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange({ categoria: cat })}
              className="rounded-2xl p-5 text-left transition-all"
              style={{
                border: ativo ? "2px solid #181D27" : "1px solid #E7DAC8",
                background: ativo ? "#181D27" : "#FCFBF8",
                color: ativo ? "#FDFDFD" : "#181D27",
              }}
            >
              <div className="mb-3">{categoriaIcones[cat]}</div>
              <p className="text-sm font-semibold leading-tight">{cat}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── step 3: preços e durações ─────────────────────────────────────────────────

function StepPrecos({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  function toggleDuracao(min: number) {
    const atual = data.duracoes;
    if (atual.includes(min)) {
      if (atual.length === 1) return;
      onChange({ duracoes: atual.filter((d) => d !== min) });
    } else {
      onChange({ duracoes: [...atual, min].sort((a, b) => a - b) });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Preços e durações</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Defina o valor por hora e as durações que você oferece.</p>
      </div>

      {/* Preço por hora */}
      <div className="flex flex-col gap-4">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Preço por hora (R$)</label>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onChange({ precoBase: Math.max(30, data.precoBase - 10) })}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            style={{ border: "1px solid #E7DAC8", color: "#181D27", background: "#FCFBF8" }}
          >−</button>
          <div className="flex-1 text-center">
            <span className="text-4xl font-normal" style={{ color: "#181D27" }}>R$ {data.precoBase}</span>
            <span className="text-sm ml-1" style={{ color: "#717680" }}>/hora</span>
          </div>
          <button
            onClick={() => onChange({ precoBase: Math.min(1000, data.precoBase + 10) })}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            style={{ border: "1px solid #E7DAC8", color: "#181D27", background: "#FCFBF8" }}
          >+</button>
        </div>
        <input
          type="range" min={30} max={500} step={10}
          value={data.precoBase}
          onChange={(e) => onChange({ precoBase: Number(e.target.value) })}
          className="w-full accent-[#CEFD58]"
        />
        <div className="flex justify-between text-xs" style={{ color: "#C4B8A8" }}>
          <span>R$ 30</span><span>R$ 500</span>
        </div>
      </div>

      {/* Durações */}
      <div className="flex flex-col gap-4">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Durações disponíveis</label>
        <div className="grid grid-cols-3 gap-3">
          {DURACOES_OPCOES.map((min) => {
            const ativo = data.duracoes.includes(min);
            const preco = precoPorDuracao(data.precoBase, min);
            return (
              <button
                key={min}
                onClick={() => toggleDuracao(min)}
                className="rounded-xl py-4 text-center transition-all"
                style={{
                  border: ativo ? "2px solid #181D27" : "1px solid #E7DAC8",
                  background: ativo ? "#181D27" : "#FCFBF8",
                  color: ativo ? "#FDFDFD" : "#181D27",
                }}
              >
                <p className="text-lg font-normal">{min} min</p>
                <p className="text-xs mt-1" style={{ color: ativo ? "#D5D7DA" : "#717680" }}>R$ {fmt(preco)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview receita */}
      <div className="rounded-2xl p-5" style={{ background: "#FCFBF8", border: "1px solid #E7DAC8" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#535862" }}>Receita estimada por sessão</p>
        <div className="flex flex-col gap-2">
          {data.duracoes.map((min) => {
            const bruto = precoPorDuracao(data.precoBase, min);
            const liquido = Math.round(bruto * 0.85);
            return (
              <div key={min} className="flex justify-between text-sm">
                <span style={{ color: "#535862" }}>{min} min</span>
                <span className="font-semibold" style={{ color: "#181D27" }}>R$ {fmt(liquido)} <span className="font-normal text-xs" style={{ color: "#717680" }}>líquido</span></span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-3" style={{ color: "#717680" }}>* Após taxa de 15% da plataforma</p>
      </div>
    </div>
  );
}

// ─── step 4: agenda + google calendar ──────────────────────────────────────────

function StepAgenda({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  function toggleDia(d: number) {
    const atual = data.diasDisponiveis;
    if (atual.includes(d)) {
      if (atual.length === 1) return;
      onChange({ diasDisponiveis: atual.filter((x) => x !== d) });
    } else {
      onChange({ diasDisponiveis: [...atual, d].sort() });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Sua disponibilidade</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Configure os dias e horários em que você atende, e opcionalmente sincronize com o Google Calendar.</p>
      </div>

      {/* Google Calendar */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{ border: "1px solid #E7DAC8", background: "#FCFBF8" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff", border: "1px solid #E7DAC8" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#181D27" }}>Google Calendar</p>
              <p className="text-xs" style={{ color: "#535862" }}>
                {data.googleCalendar
                  ? "Agenda conectada — suas sessões serão sincronizadas automaticamente"
                  : "Gerencie sessões junto com sua agenda pessoal"}
              </p>
            </div>
          </div>
          <Toggle value={data.googleCalendar} onChange={() => onChange({ googleCalendar: !data.googleCalendar })} />
        </div>

        {data.googleCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 pt-4"
            style={{ borderTop: "1px solid #E7DAC8" }}
          >
            {[
              "Sessões confirmadas aparecem automaticamente na sua agenda",
              "Bloqueios de horário no Google Calendar são respeitados",
              "Lembretes e notificações via Google",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs" style={{ color: "#414651" }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#CEFD58" }}>
                  <IconCheck className="w-2.5 h-2.5 text-[#181D27]" />
                </span>
                {t}
              </div>
            ))}
            <button
              className="mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#181D27", color: "#FDFDFD", borderRadius: 8 }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Autorizar acesso ao Google Calendar
            </button>
          </motion.div>
        )}
      </div>

      {/* Dias disponíveis */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Dias disponíveis</label>
        <div className="grid grid-cols-7 gap-2">
          {DIAS.map((dia, i) => {
            const ativo = data.diasDisponiveis.includes(i);
            return (
              <button
                key={dia}
                onClick={() => toggleDia(i)}
                className="py-3 rounded-xl text-xs font-semibold transition-all"
                style={{
                  border: ativo ? "2px solid #181D27" : "1px solid #E7DAC8",
                  background: ativo ? "#181D27" : "#FCFBF8",
                  color: ativo ? "#CEFD58" : "#535862",
                }}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horários */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Horário de atendimento</label>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "#717680" }}>Das</span>
            <input
              type="time"
              value={data.horarioInicio}
              onChange={(e) => onChange({ horarioInicio: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ border: "1px solid #E7DAC8", background: "#FCFBF8", color: "#181D27" }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "#717680" }}>Até</span>
            <input
              type="time"
              value={data.horarioFim}
              onChange={(e) => onChange({ horarioFim: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ border: "1px solid #E7DAC8", background: "#FCFBF8", color: "#181D27" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── step 5: redes sociais ─────────────────────────────────────────────────────

function StepRedes({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Redes sociais</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Ajude os seguidores a conhecer mais sobre você. Todos opcionais.</p>
      </div>
      <div className="flex flex-col gap-4">
        {[
          { key: "instagram" as const, label: "Instagram", prefix: "instagram.com/", placeholder: "@seuperfil" },
          { key: "linkedin"  as const, label: "LinkedIn",  prefix: "linkedin.com/in/", placeholder: "seu-nome" },
          { key: "twitter"   as const, label: "X / Twitter", prefix: "x.com/", placeholder: "@seuperfil" },
        ].map(({ key, label, prefix, placeholder }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-xs font-semibold" style={{ color: "#414651" }}>{label}</label>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #E7DAC8" }}>
              <span className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ background: "#F6F1E9", color: "#717680", borderRight: "1px solid #E7DAC8" }}>
                {prefix}
              </span>
              <input
                type="text"
                value={data[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                placeholder={placeholder}
                className="flex-1 px-4 py-3.5 text-sm focus:outline-none"
                style={{ background: "#FCFBF8", color: "#181D27" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4" style={{ background: "#CEFD58" }}>
        <p className="text-xs" style={{ color: "#181D27" }}>
          <span className="font-semibold">Dica:</span> Creators com pelo menos uma rede social recebem 40% mais agendamentos.
        </p>
      </div>
    </div>
  );
}

// ─── step 6: pagamento ─────────────────────────────────────────────────────────

function StepPagamento({ data, onChange }: { data: FormData; onChange: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-normal mb-1" style={{ color: "#181D27" }}>Recebimento</h2>
        <p className="text-sm" style={{ color: "#535862" }}>Configure como você quer receber seus pagamentos semanais.</p>
      </div>

      {/* Chave Pix */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold" style={{ color: "#414651" }}>Chave Pix *</label>
        <input
          type="text"
          value={data.pixChave}
          onChange={(e) => onChange({ pixChave: e.target.value })}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className="w-full px-4 py-3.5 text-sm rounded-xl focus:outline-none"
          style={{ border: "1px solid #E7DAC8", background: "#FCFBF8", color: "#181D27" }}
        />
        <p className="text-xs" style={{ color: "#717680" }}>Os repasses são feitos toda segunda-feira via Pix.</p>
      </div>

      {/* Doação */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{ border: "1px solid #E7DAC8", background: "#FCFBF8" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🤝</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#181D27" }}>Doe sua receita para uma causa</p>
              <p className="text-xs mt-0.5" style={{ color: "#535862" }}>
                Opte por destinar parte ou toda a sua receita para uma instituição. Um badge exclusivo aparecerá no seu perfil público.
              </p>
            </div>
          </div>
          <Toggle value={data.doacao} onChange={() => onChange({ doacao: !data.doacao })} />
        </div>

        <AnimatePresence>
          {data.doacao && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-4 pt-4"
              style={{ borderTop: "1px solid #E7DAC8" }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#414651" }}>Nome da instituição</label>
                <input
                  type="text"
                  value={data.doacaoInstituicao}
                  onChange={(e) => onChange({ doacaoInstituicao: e.target.value })}
                  placeholder="ex: Instituto Ayrton Senna, AACD..."
                  className="w-full px-4 py-3.5 text-sm rounded-xl focus:outline-none"
                  style={{ border: "1px solid #E7DAC8", background: "#F6F1E9", color: "#181D27" }}
                />
              </div>
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "#CEFD58" }}>
                <span className="text-lg flex-shrink-0">✨</span>
                <p className="text-xs" style={{ color: "#181D27" }}>
                  <span className="font-semibold">Badge "Impacto Social"</span> — aparece no seu perfil público destacando seu compromisso com a causa.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Taxa */}
      <div className="rounded-2xl p-5" style={{ background: "#FCFBF8", border: "1px solid #E7DAC8" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#535862" }}>Como funciona a taxa</p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "#535862" }}>Valor da sessão</span>
            <span className="font-semibold" style={{ color: "#181D27" }}>R$ {fmt(precoPorDuracao(120, 30))}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#535862" }}>Taxa face.Talk (15%)</span>
            <span style={{ color: "#D92D20" }}>− R$ {fmt(Math.round(precoPorDuracao(120, 30) * 0.15))}</span>
          </div>
          <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #E7DAC8" }}>
            <span className="font-semibold" style={{ color: "#181D27" }}>Você recebe</span>
            <span className="font-semibold" style={{ color: "#181D27" }}>R$ {fmt(Math.round(precoPorDuracao(120, 30) * 0.85))}</span>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: "#717680" }}>Exemplo: sessão 30 min · preço base R$ 120/hora</p>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

const STEPS = ["Perfil", "Categoria", "Preços", "Agenda", "Redes", "Pagamento"];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};
const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

export function CreatorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);

  function patch(p: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  function avancar() { setDir(1); setStep((s) => s + 1); }
  function voltar()  { setDir(-1); setStep((s) => s - 1); }

  function podeProsseguir() {
    if (step === 0) return data.nome.trim().length >= 2 && data.bio.trim().length >= 50;
    if (step === 1) return data.categoria !== null;
    if (step === 2) return data.duracoes.length >= 1;
    if (step === 3) return data.diasDisponiveis.length >= 1;
    if (step === 4) return true;
    if (step === 5) return data.pixChave.trim().length >= 5;
    return false;
  }

  const progresso = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen" style={{ background: "#F6F1E9" }}>

      {/* Header sticky */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "rgba(246,241,233,0.85)", borderBottom: "1px solid #E7DAC8" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "#181D27" }}>Criar perfil</span>
          <span className="text-xs" style={{ color: "#717680" }}>
            {step + 1} de {STEPS.length}
          </span>
        </div>
        {/* Barra de progresso */}
        <div className="h-0.5 w-full" style={{ background: "#E7DAC8" }}>
          <motion.div
            className="h-full"
            style={{ background: "#CEFD58" }}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-28">

        {/* Stepper */}
        <div className="flex items-center mb-10 overflow-x-auto pb-1">
          {STEPS.map((label, i) => {
            const concluido = i < step;
            const atual = i === step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                    style={{
                      background: concluido ? "#CEFD58" : atual ? "#181D27" : "#E7DAC8",
                      color: concluido ? "#181D27" : atual ? "#FDFDFD" : "#717680",
                    }}
                  >
                    {concluido ? <IconCheck className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className="text-[10px] font-medium whitespace-nowrap"
                    style={{ color: atual ? "#181D27" : "#717680" }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 mb-4 rounded transition-colors"
                    style={{ background: concluido ? "#CEFD58" : "#E7DAC8" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Conteúdo animado */}
        <div className="relative overflow-hidden min-h-[420px]">
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
              {step === 0 && <StepPerfil    data={data} onChange={patch} />}
              {step === 1 && <StepCategoria data={data} onChange={patch} />}
              {step === 2 && <StepPrecos    data={data} onChange={patch} />}
              {step === 3 && <StepAgenda    data={data} onChange={patch} />}
              {step === 4 && <StepRedes     data={data} onChange={patch} />}
              {step === 5 && <StepPagamento data={data} onChange={patch} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegação */}
        <div
          className="flex justify-between items-center mt-10 pt-6"
          style={{ borderTop: "1px solid #E7DAC8" }}
        >
          <button
            onClick={voltar}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-60"
            style={{
              color: "#414651",
              visibility: step === 0 ? "hidden" : "visible",
            }}
          >
            ← Voltar
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={avancar}
              disabled={!podeProsseguir()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ background: "#181D27", color: "#FDFDFD" }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              disabled={!podeProsseguir()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ background: "#CEFD58", color: "#181D27" }}
            >
              Publicar perfil
              <IconCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
