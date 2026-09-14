"use client";

import Link from "next/link";
import { utcToZoned } from "@/lib/slots";
import { Check, Calendar, VideoCamera } from "iconoir-react";

// ─── props ────────────────────────────────────────────────────────────────────
// Plain, serializable data loaded by app/confirmacao/[bookingId]/page.tsx.

export type ConfirmacaoMentor = {
  name: string;            // "First Last"
  firstName: string;
  username: string;        // profile slug
  photoUrl: string | null; // absolute URL, null → initials
  category: string | null; // AREA_LABEL[area]
};

export type ConfirmacaoSessao = {
  id: string;             // public.sessions.id (uuid)
  startsAt: string;       // ISO instant
  durationMinutes: number;
  priceCents: number;
  roomUrl: string;        // absolute /sala/<id>
  mentor: ConfirmacaoMentor;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Cents → "1.234,56" (the "R$" prefix stays in the markup). */
function formatPreco(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Wall-clock parts of an instant in America/Sao_Paulo. */
function relogio(iso: string) {
  const zoned = utcToZoned(new Date(iso));
  const [ano, mes, dia] = zoned.dateStr.split("-").map(Number);
  return { ano, mes, dia, hora: Math.floor(zoned.minutes / 60), minuto: zoned.minutes % 60 };
}

// ─── botões de calendário ─────────────────────────────────────────────────────

function CalendarButtons({ sessao }: { sessao: ConfirmacaoSessao }) {
  const inicio = new Date(sessao.startsAt);
  const fim = new Date(inicio.getTime() + sessao.durationMinutes * 60_000);

  // Google Calendar and the ICS feed both take the UTC instant in its compact
  // "YYYYMMDDTHHMMSSZ" form — a bare wall clock would be read as UTC and shift the
  // event by the offset. Outlook takes the ISO instant from toISOString().
  function utcStamp(d: Date) {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  const titulo = encodeURIComponent(`Loop.Talk com ${sessao.mentor.name}`);
  const descricao = encodeURIComponent(`Sessão de mentoria via Loop.Talk. Entre pela sala: ${sessao.roomUrl}`);
  const local = encodeURIComponent(sessao.roomUrl);

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${utcStamp(inicio)}/${utcStamp(fim)}&details=${descricao}&location=${local}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${titulo}&startdt=${inicio.toISOString()}&enddt=${fim.toISOString()}&body=${descricao}&location=${local}`;

  function downloadIcs() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Loop.Talk//PT",
      "BEGIN:VEVENT",
      `SUMMARY:Loop.Talk com ${sessao.mentor.name}`,
      `DTSTART:${utcStamp(inicio)}`,
      `DTEND:${utcStamp(fim)}`,
      `DESCRIPTION:Sessão de mentoria via Loop.Talk. Entre pela sala: ${sessao.roomUrl}`,
      `LOCATION:${sessao.roomUrl}`,
      `URL:${sessao.roomUrl}`,
      `UID:${sessao.id}@looptalk`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "looptalk-sessao.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 font-medium mb-1">Adicionar ao calendário</p>
      <div className="grid grid-cols-3 gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-md py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
            <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Google
        </a>
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-md py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
          Outlook
        </a>
        <button
          onClick={downloadIcs}
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-md py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
            <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Apple
        </button>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────────

export function ConfirmacaoFlow({ session }: { session: ConfirmacaoSessao }) {
  const { ano, mes, dia, hora, minuto } = relogio(session.startsAt);
  const dataFormatada = `${dia} de ${MESES[mes - 1]} de ${ano}`;
  const horaFormatada = `${pad(hora)}:${pad(minuto)}`;

  const initials = session.mentor.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Ícone de sucesso */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center mb-5">
            <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center">
              <Check className="w-6 h-6 text-dark" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessão confirmada!</h1>
          <p className="text-gray-500 text-base max-w-sm">
            Sua sessão está reservada na agenda de {session.mentor.firstName}. Guarde este link:
            é por aqui que você entra na sala.
          </p>
        </div>

        {/* Card de detalhes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Header com mentor */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-100">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {session.mentor.photoUrl ? (
                <img
                  src={session.mentor.photoUrl}
                  alt={session.mentor.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                  {initials}
                </div>
              )}
            </div>
            <div>
              {session.mentor.category && (
                <p className="text-xs text-gray-400 mb-0.5">{session.mentor.category}</p>
              )}
              <p className="font-bold text-gray-900 text-lg">{session.mentor.name}</p>
            </div>
          </div>

          {/* Detalhes da sessão */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Data</p>
                <p className="font-bold text-gray-900 text-sm leading-tight">{dataFormatada}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Horário</p>
                <p className="font-bold text-gray-900 text-sm">{horaFormatada}</p>
                <p className="text-xs text-gray-400">Brasília</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Duração</p>
                <p className="font-bold text-gray-900 text-sm">{session.durationMinutes} min</p>
              </div>
            </div>

            {/* Valor da sessão */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Valor da sessão</span>
              <span className="font-bold text-gray-900 text-lg">R$ {formatPreco(session.priceCents)}</span>
            </div>

            {/* ID do agendamento */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">ID do agendamento</span>
              <span className="text-xs text-gray-500 font-mono">{session.id}</span>
            </div>
          </div>
        </div>

        {/* Adicionar ao calendário */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <CalendarButtons sessao={session} />
        </div>

        {/* Próximos passos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Próximos passos</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Adicione ao calendário</p>
                <p className="text-xs text-gray-500 mt-0.5">Use os botões acima para não esquecer a sessão.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Entre na sala no horário</p>
                <p className="text-xs text-gray-500 mt-0.5">O botão abaixo libera pouco antes do início.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Deixe sua avaliação ao final</p>
                <p className="text-xs text-gray-500 mt-0.5">Sua opinião ajuda outros seguidores a escolherem bem.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/sala/${session.id}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <VideoCamera className="w-4 h-4" />
            Entrar na sala de vídeo
          </Link>
          <Link
            href="/agenda"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Ver minha agenda
          </Link>
        </div>
      </div>
    </div>
  );
}
