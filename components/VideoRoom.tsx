"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { experts } from "@/lib/mockExperts";

// ─── ícones inline ────────────────────────────────────────────────────────────

function IconMic({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconCamera({ off }: { off: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.84 16.84A4 4 0 018.06 8.06" />
      <path d="M20.12 20.12A10.94 10.94 0 0115 14M1 1l22 22" />
      <path d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h9.5" />
      <path d="M15 13V5a2 2 0 00-2-2h-.5M21 8.5V17a2 2 0 01-2 2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c1.12.45 2.3.77 3.53.94a2 2 0 011.84 1.99V21a2 2 0 01-2.18 2C9.31 22.15 2 14.84 2 6a2 2 0 012-2h3.5a2 2 0 012 1.72c.16 1.22.47 2.4.91 3.52a2 2 0 01-.44 2.11l-1.27 1.27-.02-.11z" />
    </svg>
  );
}

// ─── helpers de tempo ─────────────────────────────────────────────────────────

function formatTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── fases ────────────────────────────────────────────────────────────────────

type Fase = "lobby" | "incall" | "ended";

// ─── LOBBY ────────────────────────────────────────────────────────────────────

function Lobby({ expert, onEntrar }: {
  expert: NonNullable<ReturnType<typeof experts.find>>;
  onEntrar: () => void;
}) {
  const [micOk, setMicOk] = useState(false);
  const [camOk, setCamOk] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setMicOk(true); setCamOk(true); }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 text-white">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Preview câmera (mock) */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800 mb-8">
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
            Câmera — preview
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${micOk ? "bg-lime" : "bg-gray-500"} transition-colors`} />
            <span className="text-xs text-gray-300">{micOk ? "Mic ativo" : "Verificando..."}</span>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${camOk ? "bg-lime" : "bg-gray-500"} transition-colors`} />
            <span className="text-xs text-gray-300">{camOk ? "Câmera ativa" : "Verificando..."}</span>
          </div>
        </div>

        {/* Info mentor */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image src={`/mentors/${expert.slug}/profile.webp`} alt={expert.nome} fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sessão com</p>
            <p className="font-semibold">{expert.nome}</p>
          </div>
        </div>

        <button
          onClick={onEntrar}
          disabled={!micOk || !camOk}
          className="w-full py-4 rounded-lg bg-lime text-dark font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lime/90 transition-all"
        >
          {micOk && camOk ? "Entrar na sessão" : "Verificando dispositivos..."}
        </button>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Sua câmera e microfone serão ligados ao entrar.
        </p>
      </div>
    </div>
  );
}

// ─── MODAL +TEMPO ─────────────────────────────────────────────────────────────

function ModalGift({ onSelect, onClose }: {
  onSelect: (mins: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-xs"
      >
        <div className="flex items-center gap-2 mb-2">
          <IconGift />
          <h3 className="font-bold text-white text-lg">Presente de tempo</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Adicione mais tempo à sessão. O mentor receberá proporcionalmente.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onSelect(1)}
            className="border-2 border-lime rounded-lg py-4 text-center hover:bg-lime/10 transition-colors"
          >
            <p className="text-2xl font-bold text-white">+1</p>
            <p className="text-xs text-gray-400 mt-1">minuto</p>
            <p className="text-xs text-lime mt-1 font-medium">Grátis</p>
          </button>
          <button
            onClick={() => onSelect(15)}
            className="border-2 border-gray-700 rounded-lg py-4 text-center hover:border-lime hover:bg-lime/10 transition-colors"
          >
            <p className="text-2xl font-bold text-white">+15</p>
            <p className="text-xs text-gray-400 mt-1">minutos</p>
            <p className="text-xs text-lime mt-1 font-medium">R$ cobrado</p>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── IN-CALL ──────────────────────────────────────────────────────────────────

function InCall({ expert, duracao, onEncerrar }: {
  expert: NonNullable<ReturnType<typeof experts.find>>;
  duracao: number;
  onEncerrar: () => void;
}) {
  const totalSeconds = duracao * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [giftAdded, setGiftAdded] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          onEncerrar();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [onEncerrar]);

  function handleGift(mins: number) {
    setRemaining((r) => r + mins * 60);
    setGiftAdded(mins);
    setShowGift(false);
    setTimeout(() => setGiftAdded(null), 3000);
  }

  const elapsed = totalSeconds - remaining;
  const progress = Math.min(elapsed / totalSeconds, 1);
  const isAlmostOver = remaining <= 60;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Vídeo principal (mentor) */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image src={`/mentors/${expert.slug}/profile.webp`} alt={expert.nome} fill className="object-cover" sizes="128px" />
          </div>
        </div>

        {/* Self-view (pip) */}
        <div className="absolute bottom-4 right-4 w-24 aspect-video rounded-md bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
          <span className="text-xs text-gray-400">Você</span>
        </div>

        {/* Timer */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-mono font-bold text-base transition-colors ${
          isAlmostOver ? "bg-red-500/90 text-white" : "bg-black/60 text-white"
        }`}>
          {formatTimer(remaining)}
        </div>

        {/* Barra de progresso */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-lime transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Toast gift */}
        <AnimatePresence>
          {giftAdded !== null && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 bg-lime text-dark px-4 py-2 rounded-full text-sm font-bold shadow-lg"
            >
              +{giftAdded} min adicionado!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aviso quase acabando */}
        <AnimatePresence>
          {isAlmostOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-28 left-4 right-4 bg-red-500/90 rounded-lg px-4 py-3 text-center text-sm font-medium"
            >
              Menos de 1 minuto restante — deseja adicionar mais tempo?
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="bg-gray-900 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMicMuted((v) => !v)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              micMuted ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <IconMic muted={micMuted} />
          </button>
          <button
            onClick={() => setCamOff((v) => !v)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              camOff ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <IconCamera off={camOff} />
          </button>
        </div>

        <button
          onClick={() => setShowGift(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          <IconGift />
          <span>Presente</span>
        </button>

        <button
          onClick={onEncerrar}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <IconPhone />
        </button>
      </div>

      <AnimatePresence>
        {showGift && <ModalGift onSelect={handleGift} onClose={() => setShowGift(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── ENDED ────────────────────────────────────────────────────────────────────

function Ended({ expert, bookingId, router }: {
  expert: NonNullable<ReturnType<typeof experts.find>>;
  bookingId: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 text-white text-center">
      <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden">
          <Image src={`/mentors/${expert.slug}/profile.webp`} alt={expert.nome} fill className="object-cover" sizes="56px" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">Sessão encerrada</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        Foi incrível! Que tal deixar uma avaliação para {expert.nome}?
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push(`/avaliar/${bookingId}`)}
          className="w-full py-4 rounded-lg bg-lime text-dark font-bold text-sm hover:bg-lime/90 transition-all"
        >
          Avaliar sessão ⭐
        </button>
        <button
          onClick={() => router.push("/explorar")}
          className="w-full py-4 rounded-lg border border-gray-700 text-gray-300 font-medium text-sm hover:bg-gray-800 transition-all"
        >
          Explorar outros mentores
        </button>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

export function VideoRoom() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();

  const match = bookingId?.match(/^(.+)-\d{13}$/);
  const slug = match?.[1] ?? "";
  const expert = experts.find((e) => e.slug === slug);

  const [fase, setFase] = useState<Fase>("lobby");
  const mockDuracao = expert?.duracoes.includes(30) ? 30 : (expert?.duracoes[0] ?? 30);

  const encerrar = useCallback(() => setFase("ended"), []);

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p className="text-gray-400">Sessão não encontrada.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {fase === "lobby" && (
        <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Lobby expert={expert} onEntrar={() => setFase("incall")} />
        </motion.div>
      )}
      {fase === "incall" && (
        <motion.div key="incall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <InCall expert={expert} duracao={mockDuracao} onEncerrar={encerrar} />
        </motion.div>
      )}
      {fase === "ended" && (
        <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Ended expert={expert} bookingId={bookingId} router={router} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
