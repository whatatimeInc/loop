"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { categorias, type Categoria } from "@/lib/mockExperts";
import { IconCheck, IconArrow } from "@/components/icons";
import {
  IconCategoriaCarreira,
  IconCategoriaSaude,
  IconCategoriaArte,
  IconCategoriaGastronomia,
  IconCategoriaModa,
  IconCategoriaCasa,
} from "@/components/icons";

// ─── tipos ────────────────────────────────────────────────────────────────────

interface FormData {
  // step 1 — perfil
  nome: string;
  bio: string;
  fotoPreview: string | null;

  // step 2 — categoria
  categoria: Categoria | null;

  // step 3 — preços e durações
  duracoes: number[];
  precoBase: number; // preço por hora

  // step 4 — redes sociais
  instagram: string;
  linkedin: string;
  twitter: string;

  // step 5 — pagamento
  pixApenas: boolean;
  pixChave: string;
}

const INITIAL: FormData = {
  nome: "",
  bio: "",
  fotoPreview: null,
  categoria: null,
  duracoes: [30, 60],
  precoBase: 120,
  instagram: "",
  linkedin: "",
  twitter: "",
  pixApenas: false,
  pixChave: "",
};

const DURACOES_OPCOES = [15, 30, 45, 60, 90];

const categoriaIcones: Record<Categoria, React.ReactNode> = {
  "Carreira e Negócios": <IconCategoriaCarreira className="w-7 h-7" />,
  "Saúde e Bem Estar":  <IconCategoriaSaude className="w-7 h-7" />,
  "Criatividade":       <IconCategoriaArte className="w-7 h-7" />,
  "Gastronomia":        <IconCategoriaGastronomia className="w-7 h-7" />,
  "Estilo de Vida":     <IconCategoriaModa className="w-7 h-7" />,
  "Tecnologia":         <IconCategoriaCasa className="w-7 h-7" />,
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function precoPorDuracao(precoBase: number, min: number) {
  return Math.round((precoBase * min) / 60);
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

// ─── step 1: perfil ───────────────────────────────────────────────────────────

function StepPerfil({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ fotoPreview: url });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Seu perfil público</h2>
      <p className="text-gray-500 text-sm mb-8">Essa é a primeira impressão que os seguidores terão de você.</p>

      {/* Foto */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => inputRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-gray-400 transition-colors group"
        >
          {data.fotoPreview ? (
            <Image src={data.fotoPreview} alt="foto" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600 transition-colors">
              <svg viewBox="0 0 24 24" className="w-7 h-7 mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[10px] font-medium">Adicionar foto</span>
            </div>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        {data.fotoPreview && (
          <button onClick={() => onChange({ fotoPreview: null })} className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Remover foto
          </button>
        )}
      </div>

      {/* Nome */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-600 mb-2">Nome completo *</label>
        <input
          type="text"
          value={data.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Como você quer ser chamado?"
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime transition-colors"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Bio *
          <span className="ml-2 font-normal text-gray-400">({data.bio.length}/300)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value.slice(0, 300) })}
          placeholder="Conte quem você é, o que você ensina e para quem isso é ideal..."
          rows={4}
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime resize-none transition-colors"
        />
        {data.bio.length > 0 && data.bio.length < 50 && (
          <p className="text-xs text-amber-500 mt-1">Mínimo 50 caracteres para uma boa bio ({data.bio.length}/50)</p>
        )}
      </div>
    </div>
  );
}

// ─── step 2: categoria ────────────────────────────────────────────────────────

function StepCategoria({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Qual é a sua área?</h2>
      <p className="text-gray-500 text-sm mb-8">Escolha a categoria que melhor representa o seu conhecimento.</p>

      <div className="grid grid-cols-2 gap-3">
        {categorias.map((cat) => {
          const ativo = data.categoria === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange({ categoria: cat })}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                ativo ? "border-lime bg-lime/10" : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className={`mb-3 transition-colors ${ativo ? "text-dark" : "text-gray-400"}`}>
                {categoriaIcones[cat]}
              </div>
              <p className={`text-sm font-semibold leading-tight ${ativo ? "text-gray-900" : "text-gray-700"}`}>{cat}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── step 3: preços e durações ────────────────────────────────────────────────

function StepPrecos({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  function toggleDuracao(min: number) {
    const atual = data.duracoes;
    if (atual.includes(min)) {
      if (atual.length === 1) return; // pelo menos 1
      onChange({ duracoes: atual.filter((d) => d !== min) });
    } else {
      onChange({ duracoes: [...atual, min].sort((a, b) => a - b) });
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Preços e durações</h2>
      <p className="text-gray-500 text-sm mb-8">Defina o valor por hora e as durações que você oferece.</p>

      {/* Preço por hora */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-gray-600 mb-3">Preço por hora (R$)</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange({ precoBase: Math.max(30, data.precoBase - 10) })}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors font-bold text-lg"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-4xl font-bold text-gray-900">R$ {data.precoBase}</span>
            <span className="text-gray-400 text-sm ml-1">/hora</span>
          </div>
          <button
            onClick={() => onChange({ precoBase: Math.min(1000, data.precoBase + 10) })}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={30}
          max={500}
          step={10}
          value={data.precoBase}
          onChange={(e) => onChange({ precoBase: Number(e.target.value) })}
          className="w-full mt-4 accent-lime"
        />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>R$ 30</span>
          <span>R$ 500</span>
        </div>
      </div>

      {/* Durações */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-3">Durações disponíveis</label>
        <div className="grid grid-cols-5 gap-2">
          {DURACOES_OPCOES.map((min) => {
            const ativo = data.duracoes.includes(min);
            const preco = precoPorDuracao(data.precoBase, min);
            return (
              <button
                key={min}
                onClick={() => toggleDuracao(min)}
                className={`rounded-xl border-2 py-3 text-center transition-all ${
                  ativo ? "border-lime bg-lime/10" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <p className="text-base font-bold text-gray-900">{min}</p>
                <p className="text-[10px] text-gray-400">min</p>
                <p className="text-[10px] font-semibold text-gray-600 mt-1">R$ {preco}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview de receita estimada */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-3">Receita estimada por sessão</p>
        <div className="space-y-2">
          {data.duracoes.map((min) => {
            const bruto = precoPorDuracao(data.precoBase, min);
            const liquido = Math.round(bruto * 0.85);
            return (
              <div key={min} className="flex justify-between text-sm">
                <span className="text-gray-600">{min} min</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">R$ {fmt(liquido)}</span>
                  <span className="text-xs text-gray-400 ml-1">líquido</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">* Após taxa de 15% da plataforma</p>
      </div>
    </div>
  );
}

// ─── step 4: redes sociais ────────────────────────────────────────────────────

function StepRedes({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Redes sociais</h2>
      <p className="text-gray-500 text-sm mb-8">Ajude os seguidores a conhecer mais sobre você. Todos os campos são opcionais.</p>

      <div className="space-y-4">
        {[
          { key: "instagram" as const, label: "Instagram", placeholder: "@seuperfil", prefix: "instagram.com/" },
          { key: "linkedin" as const, label: "LinkedIn", placeholder: "seu-nome", prefix: "linkedin.com/in/" },
          { key: "twitter" as const, label: "X / Twitter", placeholder: "@seuperfil", prefix: "x.com/" },
        ].map(({ key, label, placeholder, prefix }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-600 mb-2">{label}</label>
            <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-lime transition-colors">
              <span className="px-4 py-3.5 text-xs text-gray-400 border-r border-gray-100 bg-gray-50 whitespace-nowrap">
                {prefix}
              </span>
              <input
                type="text"
                value={data[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                placeholder={placeholder}
                className="flex-1 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none bg-white"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-lime/10 border border-lime/30 rounded-2xl p-4">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Dica:</span> Criadores com pelo menos uma rede social recebem 40% mais agendamentos.
        </p>
      </div>
    </div>
  );
}

// ─── step 5: pagamento ────────────────────────────────────────────────────────

function StepPagamento({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Recebimento</h2>
      <p className="text-gray-500 text-sm mb-8">Configure como você quer receber seus pagamentos semanais.</p>

      {/* Chave Pix */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-2">Chave Pix *</label>
        <input
          type="text"
          value={data.pixChave}
          onChange={(e) => onChange({ pixChave: e.target.value })}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime transition-colors"
        />
        <p className="text-xs text-gray-400 mt-2">Os repasses são feitos toda segunda-feira via Pix.</p>
      </div>

      {/* Toggle Pix apenas */}
      <div className="mb-6 bg-white rounded-2xl border-2 border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Aceitar apenas Pix</p>
            <p className="text-xs text-gray-500">
              Quando ativo, seus seguidores só poderão pagar via Pix. O pagamento é confirmado instantaneamente, sem taxas de cartão.
            </p>
          </div>
          <button
            onClick={() => onChange({ pixApenas: !data.pixApenas })}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
              data.pixApenas ? "bg-lime" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                data.pixApenas ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {data.pixApenas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <IconCheck className="w-4 h-4 text-lime flex-shrink-0" />
              Confirmação instantânea do pagamento
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5">
              <IconCheck className="w-4 h-4 text-lime flex-shrink-0" />
              Sem taxas de processamento de cartão
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5">
              <IconCheck className="w-4 h-4 text-lime flex-shrink-0" />
              Repasse no mesmo dia para valores acima de R$ 50
            </div>
          </motion.div>
        )}
      </div>

      {/* Taxa da plataforma */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-600 mb-3">Como funciona a taxa</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Valor da sessão</span>
            <span className="font-medium text-gray-900">R$ {fmt(precoPorDuracao(120, 30))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Taxa face.Talk (15%)</span>
            <span className="text-red-400">− R$ {fmt(Math.round(precoPorDuracao(120, 30) * 0.15))}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
            <span className="text-gray-900">Você recebe</span>
            <span className="text-gray-900">R$ {fmt(Math.round(precoPorDuracao(120, 30) * 0.85))}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-3">Exemplo para sessão de 30 min · preço base R$ 120/hora</p>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

const STEPS = ["Perfil", "Categoria", "Preços", "Redes", "Pagamento"];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};
const transition = { duration: 0.22, ease: "easeInOut" as const };

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
    if (step === 3) return true; // redes sociais são opcionais
    if (step === 4) return data.pixChave.trim().length >= 5;
    return false;
  }

  function publicar() {
    // Em produção: salva no Supabase e redireciona para o perfil
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Criar perfil</span>
          <span className="text-xs text-gray-400">{step + 1} de {STEPS.length}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-24">
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
                      concluido ? "bg-lime text-dark" : atual ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
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
        <div className="relative overflow-hidden min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
              {step === 0 && <StepPerfil data={data} onChange={patch} />}
              {step === 1 && <StepCategoria data={data} onChange={patch} />}
              {step === 2 && <StepPrecos data={data} onChange={patch} />}
              {step === 3 && <StepRedes data={data} onChange={patch} />}
              {step === 4 && <StepPagamento data={data} onChange={patch} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegação */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={voltar}
            className={`px-5 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors ${step === 0 ? "invisible" : ""}`}
          >
            ← Voltar
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={avancar}
              disabled={!podeProsseguir()}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
            >
              Próximo
              <IconArrow className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={publicar}
              disabled={!podeProsseguir()}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime text-dark text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lime/90 transition-all"
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
