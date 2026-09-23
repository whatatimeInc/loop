/**
 * Booking confirmation e-mail: pure builders for the message the guest receives
 * right after `POST /api/sessions` inserts the row.
 *
 * Nothing here touches the network. The route hands the result to Resend; the
 * tests exercise every text, escaping and calendar rule without a key.
 */
import { utcToZoned } from "./slots.ts";

type Env = Record<string, string | undefined>;

export type ResendConfig = { apiKey: string; from: string };

/**
 * Mail is on only when both the API key and the verified sender are set.
 * A partial configuration is treated as "off", never as "try anyway".
 */
export function resendConfig(env: Env = process.env): ResendConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.RESEND_FROM?.trim() ?? "";
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

/** Same rule as the confirmation page: no trailing slash, localhost when unset. */
export function siteUrlFrom(env: Env = process.env): string {
  return (env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "") || "http://localhost:3100";
}

// ── when ────────────────────────────────────────────────────────────────────

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export type SessionWhen = { weekday: string; date: string; time: string };

/** Wall clock of an instant in America/Sao_Paulo, spelled out in Portuguese. */
export function formatSessionWhen(startsAt: string | Date): SessionWhen {
  const zoned = utcToZoned(new Date(startsAt));
  const [year, month, day] = zoned.dateStr.split("-").map(Number);
  const hh = String(Math.floor(zoned.minutes / 60)).padStart(2, "0");
  const mm = String(zoned.minutes % 60).padStart(2, "0");
  return {
    weekday: WEEKDAYS[zoned.weekday],
    date: `${day} de ${MONTHS[month - 1]} de ${year}`,
    time: `${hh}:${mm}`,
  };
}

// ── ics ─────────────────────────────────────────────────────────────────────

export type IcsInput = {
  id: string;
  startsAt: string | Date;
  durationMinutes: number;
  mentorName: string;
  roomUrl: string;
  /** Moment the invite was produced (DTSTAMP); injectable for tests. */
  now?: Date;
};

/** "YYYYMMDDTHHMMSSZ" — the compact UTC form both ICS and Google Calendar take. */
function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 §3.3.11 TEXT escaping: backslash, semicolon, comma and newlines. */
function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/**
 * RFC 5545 §3.1 line folding: content lines are at most 75 octets; longer ones
 * continue on the next line after a single space. Folding counts octets, not
 * characters, so a multi-byte character is never split in the middle.
 */
function foldLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch, "utf8");
    // The continuation line starts with a space that counts toward its 75 octets.
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.map((part, i) => (i === 0 ? part : ` ${part}`));
}

export function sessionIcs(input: IcsInput): string {
  const start = new Date(input.startsAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const stamp = input.now ?? new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Loop.Talk//PT",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.id}@looptalk`,
    `DTSTAMP:${utcStamp(stamp)}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${icsText(`Loop.Talk com ${input.mentorName}`)}`,
    `DESCRIPTION:${icsText(`Sessão de mentoria via Loop.Talk. Entre pela sala: ${input.roomUrl}`)}`,
    `LOCATION:${icsText(input.roomUrl)}`,
    `URL:${input.roomUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.flatMap(foldLine).join("\r\n");
}

// ── message ─────────────────────────────────────────────────────────────────

export const ICS_FILENAME = "loop-talk-sessao.ics";
export const ICS_CONTENT_TYPE = "text/calendar; charset=utf-8; method=PUBLISH";

export type ConfirmationEmailInput = {
  from: string;
  to: string;
  guestName: string | null;
  session: IcsInput;
};

export type ConfirmationEmail = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  attachments: { filename: string; contentType: string; content: string }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One idempotency key per session, so a retried request cannot send twice. */
export function confirmationIdempotencyKey(sessionId: string): string {
  return `session-confirmation/${sessionId}`;
}

export function buildConfirmationEmail(input: ConfirmationEmailInput): ConfirmationEmail {
  const { session } = input;
  const when = formatSessionWhen(session.startsAt);
  const greeting = input.guestName ? `Olá, ${input.guestName}!` : "Olá!";
  const whenLine = `${when.weekday}, ${when.date}, às ${when.time} (horário de Brasília)`;

  const text = [
    greeting,
    "",
    `Sua sessão com ${session.mentorName} está confirmada.`,
    "",
    `Quando: ${whenLine}`,
    `Duração: ${session.durationMinutes} min`,
    `Sala: ${session.roomUrl}`,
    "",
    "Entre pela sala no horário. O acesso libera pouco antes do início.",
    "O convite de calendário (.ics) segue em anexo.",
    "",
    "Loop.Talk",
  ].join("\n");

  const e = escapeHtml;
  const html = [
    `<div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#111827">`,
    `<p>${e(greeting)}</p>`,
    `<p>Sua sessão com <strong>${e(session.mentorName)}</strong> está confirmada.</p>`,
    `<p><strong>Quando:</strong> ${e(whenLine)}<br>`,
    `<strong>Duração:</strong> ${session.durationMinutes} min</p>`,
    `<p><a href="${e(session.roomUrl)}" style="display:inline-block;padding:12px 20px;background:#c6f135;color:#111827;text-decoration:none;border-radius:8px;font-weight:bold">Entrar na sala</a></p>`,
    `<p style="font-size:14px;color:#6b7280">Se o botão não abrir, copie este link: ${e(session.roomUrl)}</p>`,
    `<p style="font-size:14px;color:#6b7280">O acesso libera pouco antes do início. O convite de calendário (.ics) segue em anexo.</p>`,
    `<p>Loop.Talk</p>`,
    `</div>`,
  ].join("\n");

  return {
    from: input.from,
    to: [input.to],
    subject: `Sessão confirmada com ${session.mentorName} — ${when.date}`,
    text,
    html,
    attachments: [
      {
        filename: ICS_FILENAME,
        contentType: ICS_CONTENT_TYPE,
        content: Buffer.from(sessionIcs(session), "utf8").toString("base64"),
      },
    ],
  };
}

// ── confirmation page ───────────────────────────────────────────────────────

/** How long after booking the confirmation page still waits for the send mark. */
export const CONFIRMATION_MARK_WINDOW_MS = 60_000;

/**
 * The send runs in after(), so a page opened right after booking can read the
 * row before the mark lands. The page waits (briefly) only for a fresh booking
 * and only when mail is configured; otherwise there is nothing to wait for.
 */
export function shouldAwaitConfirmationMark(input: {
  createdAt: string | Date;
  mailConfigured: boolean;
  now?: Date;
  windowMs?: number;
}): boolean {
  if (!input.mailConfigured) return false;
  const created = new Date(input.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  const now = (input.now ?? new Date()).getTime();
  return now - created < (input.windowMs ?? CONFIRMATION_MARK_WINDOW_MS);
}
