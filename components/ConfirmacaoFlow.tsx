"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { experts } from "@/lib/mockExperts";
import { IconCheck, IconCalendar, IconVideo } from "@/components/icons";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function formatPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function precoPorDuracao(precoBase: number, duracao: number) {
  return Math.round((precoBase * duracao) / 60);
}

function CalendarButtons({ bookingId, data, hora, expertNome }: {
  bookingId: string;
  data: string;
  hora: string;
  expertNome: string;
}) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const [horaH, horaM] = hora.split(":").map(Number);

  const inicio = new Date(ano, mes - 1, dia, horaH, horaM);
  const fim = new Date(inicio.getTime() + 60 * 60 * 1000);

  function pad(n: number) { return String(n).padStart(2, "0"); }
  function toGoogleDate(d: Date) {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  }

  const titulo = encodeURIComponent(`face.Talk com ${expertNome}`);
  const descricao = encodeURIComponent(`Sessão de mentoria via face.Talk. ID: ${bookingId}`);
  const local = encodeURIComponent("face.Talk — link enviado por e-mail");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${toGoogleDate(inicio)}/${toGoogleDate(fim)}&details=${descricao}&location=${local}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${titulo}&startdt=${inicio.toISOString()}&enddt=${fim.toISOString()}&body=${descricao}&location=${local}`;

  function downloadIcs() {
    function toIcsDate(d: Date) {
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    }
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//face.Talk//PT",
      "BEGIN:VEVENT",
      `SUMMARY:face.Talk com ${expertNome}`,
      `DTSTART:${toIcsDate(inicio)}`,
      `DTEND:${toIcsDate(fim)}`,
      `DESCRIPTION:Sessão de mentoria via face.Talk. ID: ${bookingId}`,
      `LOCATION:face.Talk — link enviado por e-mail`,
      `UID:${bookingId}@facetalk`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "facetalk-sessao.ics";
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
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
          Outlook
        </a>
        <button
          onClick={downloadIcs}
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

export function ConfirmacaoFlow() {
  const { bookingId } = useParams<{ bookingId: string }>();

  // Extrai slug do bookingId: "slug-timestamp13"
  const match = bookingId?.match(/^(.+)-\d{13}$/);
  const slug = match?.[1] ?? "";
  const expert = experts.find((e) => e.slug === slug);

  // Mock: data/hora fixos pois não temos backend ainda
  const mockData = (() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 3);
    return amanha.toISOString().split("T")[0];
  })();
  const mockHora = "15:00";
  const mockDuracao = expert?.duracoes.includes(30) ? 30 : (expert?.duracoes[0] ?? 30);

  const [ano, mes, dia] = mockData.split("-").map(Number);
  const dataFormatada = `${dia} de ${MESES[mes - 1]} de ${ano}`;

  const preco = expert ? precoPorDuracao(expert.preco, mockDuracao) : 0;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Ícone de sucesso */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center mb-5">
            <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center">
              <IconCheck className="w-6 h-6 text-dark" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessão confirmada!</h1>
          <p className="text-gray-500 text-base max-w-sm">
            Seu pagamento foi processado e a sessão está agendada. Você receberá os detalhes por e-mail.
          </p>
        </div>

        {/* Card de detalhes */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden mb-6">
          {/* Header com mentor */}
          {expert && (
            <div className="flex items-center gap-4 p-6 border-b border-gray-100">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={`/mentors/${expert.slug}/profile.webp`}
                  alt={expert.nome}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{expert.categoria}</p>
                <p className="font-bold text-gray-900 text-lg">{expert.nome}</p>
              </div>
            </div>
          )}

          {/* Detalhes da sessão */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Data</p>
                <p className="font-bold text-gray-900 text-sm leading-tight">{dataFormatada}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Horário</p>
                <p className="font-bold text-gray-900 text-sm">{mockHora}</p>
                <p className="text-xs text-gray-400">Brasília</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Duração</p>
                <p className="font-bold text-gray-900 text-sm">{mockDuracao} min</p>
              </div>
            </div>

            {/* Total pago */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Total pago</span>
              <span className="font-bold text-gray-900 text-lg">R$ {formatPreco(preco)}</span>
            </div>

            {/* ID do agendamento */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">ID do agendamento</span>
              <span className="text-xs text-gray-500 font-mono">{bookingId}</span>
            </div>
          </div>
        </div>

        {/* Adicionar ao calendário */}
        {expert && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-6">
            <CalendarButtons
              bookingId={bookingId}
              data={mockData}
              hora={mockHora}
              expertNome={expert.nome}
            />
          </div>
        )}

        {/* Próximos passos */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Próximos passos</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Verifique seu e-mail</p>
                <p className="text-xs text-gray-500 mt-0.5">Enviamos os detalhes completos e o link da videochamada para você.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Adicione ao calendário</p>
                <p className="text-xs text-gray-500 mt-0.5">Use os botões acima para não esquecer a sessão.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-dark">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Entre na sala no horário</p>
                <p className="text-xs text-gray-500 mt-0.5">Clique no botão abaixo ou no link do e-mail para entrar na videochamada.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/sala/${bookingId}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <IconVideo className="w-4 h-4" />
            Entrar na sala de vídeo
          </Link>
          <Link
            href="/explorar"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <IconCalendar className="w-4 h-4" />
            Ver minha agenda
          </Link>
        </div>
      </div>
    </div>
  );
}
