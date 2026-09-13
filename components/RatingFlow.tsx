"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { utcToZoned } from "@/lib/slots";
import { StarSolid } from "iconoir-react";

// ─── props (loaded by app/(site)/avaliar/[bookingId]/page.tsx) ────────────────

export type RatingSessao = {
  id: string;               // sessions.id (uuid)
  mentorName: string;       // "First Last"
  mentorFirstName: string;
  mentorUsername: string;   // profile slug
  mentorPhotoUrl: string | null;
  durationMinutes: number;
  startsAt: string;         // ISO instant
};

// ─── rótulos por nota ─────────────────────────────────────────────────────────

const ROTULOS: Record<number, string> = {
  1: "Não correspondeu às expectativas",
  2: "Abaixo do esperado",
  3: "Foi ok",
  4: "Boa sessão!",
  5: "Incrível! Superou tudo",
};

const SUGESTOES = [
  "Muito bem preparado",
  "Explicação clara",
  "Escutou com atenção",
  "Deu exemplos práticos",
  "Pontual",
  "Empático",
  "Me ajudou a avançar",
  "Recomendaria a todos",
];

const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatDataCurta(iso: string) {
  const z = utcToZoned(new Date(iso));
  const [, mes, dia] = z.dateStr.split("-").map(Number);
  return `${dia} ${MESES_CURTO[mes - 1]}`;
}

/** The API stores one text field — fold the picked tags into it. */
function textoDaAvaliacao(comentario: string, tags: string[]): string | null {
  const partes = [comentario.trim(), tags.join(", ")].filter(Boolean);
  return partes.length > 0 ? partes.join("\n\n") : null;
}

// ─── componente de estrelas ───────────────────────────────────────────────────

function Estrelas({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const ativo = hover || valor;

  return (
    <div className="flex gap-2 justify-center" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <StarSolid
            className={`w-10 h-10 transition-colors ${
              n <= ativo ? "text-amber-400" : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── step 1: avaliação do mentor ─────────────────────────────────────────────

function StepAvaliarMentor({ session, onProximo }: {
  session: RatingSessao;
  onProximo: (nota: number, tags: string[], comentario: string) => void;
}) {
  const [nota, setNota] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const podeProsseguir = nota > 0;
  const initials = session.mentorName.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center text-center">
      {/* Foto + nome */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 ring-4 ring-lime/30 bg-gray-100">
        {session.mentorPhotoUrl ? (
          <img
            src={session.mentorPhotoUrl}
            alt={session.mentorName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-500">
            {initials}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">
        Sessão de {session.durationMinutes} min · {formatDataCurta(session.startsAt)}
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{session.mentorName}</h2>
      <p className="text-sm text-gray-500 mb-8">Como foi sua sessão?</p>

      {/* Estrelas */}
      <Estrelas valor={nota} onChange={setNota} />

      <AnimatePresence>
        {nota > 0 && (
          <motion.p
            key={nota}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gray-500 mt-3 h-5"
          >
            {ROTULOS[nota]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tags de elogio */}
      <AnimatePresence>
        {nota >= 4 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-full mt-6"
          >
            <p className="text-xs text-gray-400 mb-3">O que você mais gostou? (opcional)</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGESTOES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? "bg-lime border-lime text-dark"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comentário */}
      <AnimatePresence>
        {nota > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-full mt-6"
          >
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte mais sobre sua experiência... (opcional)"
              rows={3}
              className="w-full rounded-lg border-2 border-gray-200 p-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime resize-none transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onProximo(nota, tags, comentario)}
        disabled={!podeProsseguir}
        className="w-full mt-8 py-4 rounded-lg bg-gray-900 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
      >
        Continuar
      </button>
    </div>
  );
}

// ─── step 2: o mentor avalia você (perspectiva do seguidor) ──────────────────

function StepAvaliarVoce({ onEnviar, enviando, erro }: {
  onEnviar: () => void;
  enviando: boolean;
  erro: string | null;
}) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">O mentor também avalia você</h2>
      <p className="text-sm text-gray-500 mb-8">
        Como foi sua experiência com o seguidor? (perspectiva do mentor)
      </p>

      <Estrelas valor={nota} onChange={setNota} />

      <AnimatePresence>
        {nota > 0 && (
          <motion.p
            key={nota}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gray-500 mt-3 h-5"
          >
            {ROTULOS[nota]}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nota > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-full mt-6"
          >
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentário sobre o seguidor... (opcional)"
              rows={3}
              className="w-full rounded-lg border-2 border-gray-200 p-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime resize-none transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {erro && (
        <p className="w-full mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      <button
        onClick={onEnviar}
        disabled={nota === 0 || enviando}
        className="w-full mt-8 py-4 rounded-lg bg-gray-900 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
      >
        {enviando ? "Enviando..." : "Enviar avaliações"}
      </button>

      <button
        onClick={onEnviar}
        disabled={enviando}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
      >
        Pular esta etapa
      </button>
    </div>
  );
}

// ─── step 3: obrigado ─────────────────────────────────────────────────────────

function StepObrigado({ session, notaMentor, router }: {
  session: RatingSessao;
  notaMentor: number;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animação de confete estilizada */}
      <div className="relative w-24 h-24 mb-6">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: Math.cos((i / 8) * Math.PI * 2) * 48,
              y: Math.sin((i / 8) * Math.PI * 2) * 48,
            }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: i % 2 === 0 ? "#C6F135" : "#1a1a1a",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-lime flex items-center justify-center">
            <StarSolid className="w-9 h-9 text-dark" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado!</h2>
      <p className="text-gray-500 text-sm mb-2">
        Sua avaliação foi enviada com sucesso.
      </p>

      {notaMentor >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 mb-8 bg-lime/10 border border-lime/30 rounded-lg px-5 py-4 max-w-xs"
        >
          <p className="text-sm text-gray-700">
            Que tal recomendar {session.mentorName} para um amigo?
          </p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: `Sessão com ${session.mentorName} no Loop.Talk`,
                    text: `Tive uma sessão incrível com ${session.mentorName}! Recomendo muito.`,
                    url: window.location.origin + `/${session.mentorUsername}`,
                  })
                  .catch(() => {});
              }
            }}
            className="mt-3 flex items-center gap-2 mx-auto text-xs font-semibold text-dark bg-lime px-4 py-2 rounded-full hover:bg-lime/90 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Compartilhar
          </button>
        </motion.div>
      )}

      {notaMentor < 4 && <div className="mb-8" />}

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => router.push(`/${session.mentorUsername}`)}
          className="w-full py-4 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all"
        >
          Ver perfil de {session.mentorName}
        </button>
        <button
          onClick={() => router.push("/explorar")}
          className="w-full py-4 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
        >
          Explorar outros mentores
        </button>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

const variants = {
  enter: { x: 48, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -48, opacity: 0 },
};
const transition = { duration: 0.22, ease: "easeInOut" as const };

export function RatingFlow({ session }: { session: RatingSessao }) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [notaMentor, setNotaMentor] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: notaMentor, text: textoDaAvaliacao(comentario, tags) }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setErro(payload?.error ?? "Não foi possível enviar sua avaliação. Tente novamente.");
        return;
      }
      setStep(2);
    } catch {
      setErro("Não foi possível enviar sua avaliação. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-6 pt-12 pb-24">
        {/* Indicador de progresso */}
        <div className="flex gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="mentor" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
              <StepAvaliarMentor
                session={session}
                onProximo={(nota, novasTags, novoComentario) => {
                  setNotaMentor(nota);
                  setTags(novasTags);
                  setComentario(novoComentario);
                  setStep(1);
                }}
              />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="voce" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
              <StepAvaliarVoce onEnviar={enviar} enviando={enviando} erro={erro} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="obrigado" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
              <StepObrigado session={session} notaMentor={notaMentor} router={router} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
