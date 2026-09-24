"use client";

import {
  useEffect, useState, useRef, useCallback,
} from "react";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipantLeft,
  DailyEventObjectNetworkQualityEvent,
} from "@daily-co/daily-js";
import type { SessionData, Persona, ChatMessage, TimeExtension } from "./types";
import { acceptedMinutes, requestOutcome } from "@/lib/extensions";

/** How long a requester waits for an answer over the call before asking the database. */
const ANSWER_RECONCILE_MS = 45_000;
/** In-call sync cadence: catches a request or answer whose call message was lost. */
const SYNC_INTERVAL_MS = 30_000;
/** Failed pre-end reads (one per tick) tolerated before the call ends anyway. */
const PRE_END_MAX_ATTEMPTS = 10;
/** A sync read that takes longer than this counts as failed. */
const SYNC_TIMEOUT_MS = 8_000;
import { tokens } from "@/components/ui/tokens";

// ── icons ─────────────────────────────────────────────────────────────────────

function IcoMic({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IcoCam({ off }: { off: boolean }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h9.5" />
      <path d="M15 13V5a2 2 0 00-2-2h-.5M21 8.5V17a2 2 0 01-2 2" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function IcoScreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IcoChat({ unread }: { unread: number }) {
  return (
    <div style={{ position: "relative" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      {unread > 0 && (
        <span style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "#C0392B", color: "var(--color-bg-white)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {unread}
        </span>
      )}
    </div>
  );
}

function IcoPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c1.12.45 2.3.77 3.53.94a2 2 0 011.84 1.99V21a2 2 0 01-2.18 2C9.31 22.15 2 14.84 2 6a2 2 0 012-2h3.5a2 2 0 012 1.72c.16 1.22.47 2.4.91 3.52a2 2 0 01-.44 2.11l-1.27 1.27-.02-.11z" />
    </svg>
  );
}

function IcoSignal({ quality }: { quality: "good" | "fair" | "poor" }) {
  const c = quality === "good" ? "var(--color-success)" : quality === "fair" ? "#F5A623" : "#C0392B";
  const heights = [6, 10, 14];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
      {heights.map((h, i) => {
        const active = quality === "good" ? true : quality === "fair" ? i < 2 : i < 1;
        return <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: active ? c : "color-mix(in srgb, var(--color-bg-white) 25%, transparent)" }} />;
      })}
    </div>
  );
}

// ── timer helpers ─────────────────────────────────────────────────────────────

function formatTime(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Chat sidebar ──────────────────────────────────────────────────────────────

function ChatSidebar({
  messages, persona, onSend, onClose,
}: {
  messages: ChatMessage[];
  persona: Persona;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send() {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  }

  return (
    <div style={{
      width: 280, height: "100%", background: "#111", display: "flex", flexDirection: "column",
      borderLeft: "1px solid color-mix(in srgb, var(--color-bg-white) 8%, transparent)", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid color-mix(in srgb, var(--color-bg-white) 8%, transparent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#F0EFEB" }}>Chat da sessão</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m) => {
          const mine = m.sender === persona;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "8px 12px", borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: mine ? tokens.lime : "color-mix(in srgb, var(--color-bg-white) 10%, transparent)",
                color: mine ? "var(--color-gray-900)" : "#F0EFEB", fontSize: 13,
              }}>
                {!mine && <div style={{ fontSize: 11, color: "var(--color-gray-500)", marginBottom: 4 }}>{m.senderName}</div>}
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px", borderTop: "1px solid color-mix(in srgb, var(--color-bg-white) 8%, transparent)", display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Mensagem..."
          style={{
            flex: 1, background: "color-mix(in srgb, var(--color-bg-white) 8%, transparent)", border: "none", borderRadius: 8,
            padding: "8px 12px", color: "#F0EFEB", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none",
          }}
        />
        <button onClick={send} style={{ padding: "8px 12px", background: tokens.lime, border: "none", borderRadius: 8, color: "var(--color-gray-900)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>→</button>
      </div>
    </div>
  );
}

// ── End modal ─────────────────────────────────────────────────────────────────

function EndModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1E1E1E", borderRadius: 16, padding: "28px 32px", maxWidth: 340, width: "90%", fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#F0EFEB", margin: "0 0 8px" }}>Encerrar sessão?</p>
        <p style={{ fontSize: 14, color: "var(--color-gray-500)", margin: "0 0 24px" }}>Esta ação encerrará a chamada para todos os participantes.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid color-mix(in srgb, var(--color-bg-white) 20%, transparent)", borderRadius: 8, color: "#F0EFEB", cursor: "pointer", fontSize: 14 }}>
            Continuar
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", background: "#C0392B", border: "none", borderRadius: 8, color: "var(--color-bg-white)", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Time extension ────────────────────────────────────────────────────────────

function ExtensionBanner({ onRequest, pending }: { onRequest: () => void; pending: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      position: "absolute", top: 48, left: 0, right: 0, zIndex: 50,
      background: "rgba(26,26,26,0.92)", borderBottom: "1px solid color-mix(in srgb, var(--color-bg-white) 8%, transparent)",
      padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      fontFamily: "Inter, sans-serif",
    }}>
      <span style={{ fontSize: 14, color: "#F0EFEB" }}>Sua sessão termina em 5 minutos.</span>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={onRequest}
          disabled={pending}
          style={{
            padding: "8px 16px", background: tokens.lime, border: "none", borderRadius: 8,
            color: "var(--color-gray-900)", fontSize: 13, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.5 : 1,
          }}
        >
          {pending ? "Aguardando..." : "Pedir mais tempo"}
        </button>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer", fontSize: 13 }}>
          Fechar
        </button>
      </div>
    </div>
  );
}

function ExtensionRequestModal({ persona, onSelect, onDismiss }: {
  persona: Persona;
  onSelect: (mins: 5 | 10 | 15) => void;
  onDismiss: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1E1E1E", borderRadius: 16, padding: "28px 32px", maxWidth: 340, width: "90%", fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#F0EFEB", margin: "0 0 6px" }}>Adicionar tempo?</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {([5, 10, 15] as const).map((m) => (
            <button key={m} onClick={() => onSelect(m)} style={{
              flex: 1, padding: "14px 0", background: "transparent", border: "2px solid color-mix(in srgb, var(--color-bg-white) 20%, transparent)",
              borderRadius: 10, color: "#F0EFEB", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.lime)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-bg-white) 20%, transparent)")}
            >
              +{m} min
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-gray-500)", margin: "0 0 16px", textAlign: "center" }}>
          Esta sessão é um presente — sem cobrança adicional.
        </p>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "var(--color-gray-500)", fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center" }}>
          Não, obrigado
        </button>
      </div>
    </div>
  );
}

function ExtensionIncomingModal({ ext, otherName, onAccept, onDecline }: {
  ext: TimeExtension;
  otherName: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1E1E1E", borderRadius: 16, padding: "28px 32px", maxWidth: 340, width: "90%", fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#F0EFEB", margin: "0 0 20px" }}>
          {otherName} quer adicionar {ext.minutes_added} minutos. Aceitar?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid color-mix(in srgb, var(--color-bg-white) 20%, transparent)", borderRadius: 8, color: "#F0EFEB", cursor: "pointer", fontSize: 14 }}>Recusar</button>
          <button onClick={onAccept} style={{ flex: 1, padding: "12px", background: tokens.lime, border: "none", borderRadius: 8, color: "var(--color-gray-900)", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}

// ── Main VideoCall component ──────────────────────────────────────────────────

export function VideoCall({
  session,
  persona,
  token,
  sessionStartedAt,
  extraMinutes = 0,
  onTokenRefreshed,
  onExtensionAccepted,
  onEnd,
  onConnectionLost,
}: {
  session: SessionData;
  persona: Persona;
  token: string | null;
  sessionStartedAt: number;
  /** Minutes already granted by accepted extensions before this mount. */
  extraMinutes?: number;
  /** A longer token re-issued when this side accepts an extension. */
  onTokenRefreshed?: (token: string) => void;
  /** Minutes granted by an extension accepted during this mount (either side). */
  onExtensionAccepted?: (minutes: number) => void;
  onEnd: () => void;
  onConnectionLost: () => void;
}) {
  const callRef = useRef<DailyCall | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const selfViewRef = useRef<HTMLDivElement>(null);

  // State
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<"good" | "fair" | "poor">("good");
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Granted extension time lives in extraMsRef (below): the countdown is
  // always derived from it (see remainingFor), never added to it, so seeding
  // it and the initial countdown from the same prop counts the minutes once.
  const remainingFor = useCallback(
    (extra: number) => Math.max(0, sessionStartedAt + session.duration * 60 * 1000 + extra - Date.now()),
    [sessionStartedAt, session.duration],
  );
  const [remainingMs, setRemainingMs] = useState<number>(() => remainingFor(extraMinutes * 60 * 1000));
  const [extNotice, setExtNotice] = useState<string | null>(null);
  // Synchronous guards: a double click must not send two requests or two answers.
  const extBusyRef = useRef(false);
  // The request this side is waiting an answer for, and the reconcile timer
  // that runs when no answer arrives over the call channel.
  const myRequestRef = useRef<TimeExtension | null>(null);
  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Accepted minutes this mount already holds (seeded from the prop), so the
  // mount-time rehydrate reports to the parent only what it did not know yet.
  const knownMinutesRef = useRef(extraMinutes);
  // False once unmounted: a sync that resolves afterwards applies nothing.
  const mountedRef = useRef(false);
  // Latest sync function and incoming request, for the timer and the join effect.
  const syncFromServerRef = useRef<(fresh?: boolean) => Promise<boolean>>(async () => false);
  const incomingRef = useRef<TimeExtension | null>(null);
  // Bumped on every local write or answer received. A read that started
  // before the bump is discarded when it lands: it predates what it would
  // settle, and the fresh read chained behind it carries the truth.
  const writeGenRef = useRef(0);
  // True while a pre-end sync is in flight; endedRef sticks once onEnd ran,
  // so a tick queued meanwhile cannot end the call twice.
  const endingRef = useRef(false);
  const endedRef = useRef(false);
  // Until the first sync settles, the countdown treats the session as if a
  // request might be pending: a reload seconds before the end must not end
  // the call before the database has been asked.
  const initialSyncDoneRef = useRef(false);
  // Failed pre-end reads are retried a bounded number of times before ending.
  const preEndAttemptsRef = useRef(0);
  // True when the server confirmed an accept whose minutes this side has not
  // applied yet (the follow-up read failed): the countdown must not end the
  // call while such a grant is outstanding; the next successful sync clears it.
  const grantOutstandingRef = useRef(false);
  const noteWrite = () => { writeGenRef.current += 1; };
  // Granted extension time in ms; a ref so the timer tick and long-lived
  // handlers always read the latest value (renders come from remainingMs).
  const extraMsRef = useRef(extraMinutes * 60 * 1000);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timers live until unmount only: the join effect re-runs on a token change
  // (reconnect) and must not drop a reconcile that is still waiting.
  useEffect(() => () => {
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);
  const [showExtBanner, setShowExtBanner] = useState(false);
  const [extPending, setExtPending] = useState(false);
  const [showExtRequestModal, setShowExtRequestModal] = useState(false);
  const [incomingExt, setIncomingExt] = useState<TimeExtension | null>(null);

  // Latest chatOpen for handlers that must not re-run the call effect
  const chatOpenRef = useRef(false);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);
  // Set together with the state, synchronously: the timer tick reads the ref
  // and must not see a request one render late.
  const setIncoming = useCallback((ext: TimeExtension | null) => {
    // Adopting a NEW request (from a message, a 409, or a read) is a local
    // write: a read already in flight must not undo it when it lands. Re-setting
    // the same row (periodic reads) changes nothing and bumps nothing.
    if (ext && ext.id !== incomingRef.current?.id) writeGenRef.current += 1;
    incomingRef.current = ext;
    setIncomingExt(ext);
  }, []);
  // Same for the parent's accept callback: the join effect must never depend on it.
  const onExtensionAcceptedRef = useRef(onExtensionAccepted);
  useEffect(() => { onExtensionAcceptedRef.current = onExtensionAccepted; }, [onExtensionAccepted]);

  // Timer — recomputes the countdown every second from the booked end plus
  // the granted extension time, so a grant moves the end at the next tick.
  useEffect(() => {
    const interval = setInterval(() => {
      // The ref, not the closed-over state: a tick already queued when a
      // grant lands must see the new end, or it could end the call.
      const left = remainingFor(extraMsRef.current);
      setRemainingMs(left);
      if (left === 0 && (endingRef.current || endedRef.current)) return; // sync in flight, or already ended
      const mustAskFirst = () =>
        !!myRequestRef.current || !!incomingRef.current || !initialSyncDoneRef.current || grantOutstandingRef.current;
      if (left === 0 && mustAskFirst()) {
        // An answer may be recorded without its message having reached us:
        // ask the database once before ending the call. The interval keeps
        // running, so a grant found there simply moves the countdown on.
        endingRef.current = true;
        void syncFromServerRef.current(true).then((ok) => {
          endingRef.current = false;
          if (remainingFor(extraMsRef.current) > 0) {
            // Time was granted: the next deadline starts with a fresh budget.
            preEndAttemptsRef.current = 0;
            return;
          }
          if (endedRef.current) return;
          // A failed read is not "no extension": while an answer is awaited
          // or shown, try again on the next ticks before giving up.
          if (!ok && mustAskFirst() && preEndAttemptsRef.current < PRE_END_MAX_ATTEMPTS) {
            preEndAttemptsRef.current += 1;
            return;
          }
          endedRef.current = true;
          clearInterval(interval);
          onEnd();
        });
        return;
      }
      // Show 5-min banner
      if (left > 0 && left <= 5 * 60 * 1000 + 500 && left > 5 * 60 * 1000 - 500) {
        setShowExtBanner(true);
      }
      if (left === 0) { endedRef.current = true; clearInterval(interval); onEnd(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingFor, onEnd]);

  // Controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [resetControlsTimer]);

  const otherProfile = persona === "mentor" ? session.guest : session.mentor;
  const otherName = [otherProfile.name, otherProfile.last_name].filter(Boolean).join(" ") || "Participante";

  // Daily.co call setup
  useEffect(() => {
    const roomUrl = session.daily_room_url;
    if (!roomUrl) return;
    let cancelled = false;
    let handle: DailyCall | null = null;

    (async () => {
      // Daily allows one call object per page and destroy() only frees the
      // slot once its teardown finishes, so wait for any leftover instance
      // before creating ours (a remount would otherwise throw and blank the page).
      const leftover = DailyIframe.getCallInstance();
      if (leftover) { try { await leftover.destroy(); } catch { /* already gone */ } }
      if (cancelled) return;

      const call = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dailyConfig: { experimentalChromeVideoMuteLightOff: true } as any,
      });
      callRef.current = call;

      call.join({
        url: roomUrl,
        token: token ?? undefined,
      }).catch(console.error);

      // Remote video: tracks arrive AFTER participant-joined (the track is
      // still "loading" at join time), so attach on track-started and replace
      // the element when the track changes. Remote audio also needs an element
      // in call-object mode, or the other side is silent.
      const attachRemote = (participant: { session_id: string; local: boolean }, track: MediaStreamTrack) => {
        const container = videoContainerRef.current;
        if (!container || participant.local) return;
        const selector = `[data-session-id="${participant.session_id}"][data-kind="${track.kind}"]`;
        let el = container.querySelector<HTMLMediaElement>(selector);
        if (!el) {
          el = document.createElement(track.kind === "video" ? "video" : "audio");
          el.autoplay = true;
          el.dataset.sessionId = participant.session_id;
          el.dataset.kind = track.kind;
          if (el instanceof HTMLVideoElement) {
            el.playsInline = true;
            el.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
          }
          container.appendChild(el);
        }
        el.srcObject = new MediaStream([track]);
        el.play().catch(() => {});
      };

      call.on("participant-left", (event: DailyEventObjectParticipantLeft) => {
        videoContainerRef.current
          ?.querySelectorAll(`[data-session-id="${event.participant.session_id}"]`)
          .forEach((el) => el.remove());
      });

      call.on("track-stopped", (event) => {
        if (event.participant && !event.participant.local && event.track) {
          videoContainerRef.current
            ?.querySelector(`[data-session-id="${event.participant.session_id}"][data-kind="${event.track.kind}"]`)
            ?.remove();
        }
      });

      // Self-view
      call.on("track-started", (event) => {
        if (event.participant && !event.participant.local && event.track) {
          attachRemote(event.participant, event.track);
          return;
        }
        if (event.participant?.local && event.track?.kind === "video" && selfViewRef.current) {
          let video = selfViewRef.current.querySelector("video");
          if (!video) {
            video = document.createElement("video");
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.style.cssText = "width:100%;height:100%;object-fit:cover;";
            selfViewRef.current.appendChild(video);
          }
          video.srcObject = new MediaStream([event.track]);
        }
      });

      // Network quality
      call.on("network-quality-change", (event: DailyEventObjectNetworkQualityEvent) => {
        const q = event.quality;
        setNetworkQuality(q >= 80 ? "good" : q >= 40 ? "fair" : "poor");
      });

      // Chat via app messages
      call.on("app-message", (event) => {
        const data = event.data as { type: string; text?: string; senderName?: string; sender?: Persona; ext?: TimeExtension };
        if (data.type === "chat" && data.text) {
          const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            sender: data.sender ?? ("guest" as Persona),
            senderName: data.senderName ?? "Participante",
            text: data.text,
            ts: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
          if (!chatOpenRef.current) setUnreadCount((c) => c + 1);
        }
        if (data.type === "time-extension-request" && data.ext) {
          // Only the other side's request is something to answer.
          if (data.ext.requested_by === persona) return;
          setIncoming(data.ext);
          setExtPending(true);
        }
        // Answers count only for the request this side is still waiting for:
        // a late message after the reconcile already settled it adds nothing.
        // Answers over the call only say "go and look": the sync settles the
        // awaited request from the database and applies any grant, so a
        // forged, stale or premature message changes nothing by itself, and
        // the request stays awaited (pre-end sync included) until then.
        if (data.type === "time-extension-accepted" || data.type === "time-extension-declined") {
          const mine = myRequestRef.current;
          if (!mine || (data.ext && mine.id !== data.ext.id)) return;
          writeGenRef.current += 1;
          void syncFromServerRef.current(true);
        }
      });

      // Connection issues
      call.on("error", (e) => { console.error("Daily error:", e); onConnectionLost(); });
      handle = call;
    })();

    return () => {
      cancelled = true;
      callRef.current = null;
      const c = handle ?? DailyIframe.getCallInstance();
      if (c) c.destroy().catch(() => {});
    };
    // persona is fixed for a mount and setIncoming is stable: neither re-runs the join.
  }, [session.daily_room_url, token, onConnectionLost, persona, setIncoming]);

  // Controls
  function toggleMic() {
    callRef.current?.setLocalAudio(micMuted);
    setMicMuted((v) => !v);
  }
  function toggleCam() {
    callRef.current?.setLocalVideo(camOff);
    setCamOff((v) => !v);
  }
  function toggleScreen() {
    if (!screenSharing) {
      callRef.current?.startScreenShare();
      setScreenSharing(true);
    } else {
      callRef.current?.stopScreenShare();
      setScreenSharing(false);
    }
  }
  function handleEndConfirm() {
    callRef.current?.leave().catch(() => {});
    onEnd();
  }

  function sendChat(text: string) {
    const msg: ChatMessage = {
      id: `${Date.now()}-local`,
      sender: persona,
      senderName: persona === "mentor"
        ? [session.mentor.name, session.mentor.last_name].filter(Boolean).join(" ")
        : [session.guest.name, session.guest.last_name].filter(Boolean).join(" "),
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    sendAppMessage({ type: "chat", text, sender: persona, senderName: msg.senderName });
  }

  function showExtNotice(text: string) {
    setExtNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setExtNotice(null), 5000);
  }

  /** Applies granted minutes once: countdown, parent state and the known total move together. */
  const applyGrant = useCallback((minutes: number) => {
    if (minutes <= 0) return;
    knownMinutesRef.current += minutes;
    const extra = extraMsRef.current + minutes * 60 * 1000;
    extraMsRef.current = extra;
    // The timer would catch up at its next tick; move the countdown now so
    // the new end is visible (and end-of-call cannot fire) in the meantime.
    setRemainingMs(remainingFor(extra));
    onExtensionAcceptedRef.current?.(minutes);
  }, [remainingFor]);
  // The join effect reads it through a ref: it must not re-run for a grant.
  const applyGrantRef = useRef(applyGrant);
  useEffect(() => { applyGrantRef.current = applyGrant; }, [applyGrant]);

  function settleMyRequest() {
    myRequestRef.current = null;
    if (answerTimerRef.current) { clearTimeout(answerTimerRef.current); answerTimerRef.current = null; }
  }

  /** App messages throw when the call is not joined; the database is the source of truth anyway. */
  function sendAppMessage(message: unknown) {
    try { callRef.current?.sendAppMessage(message, "*"); } catch (err) { console.error("App message failed:", err); }
  }

  /**
   * No answer arrived over the call channel (the other side's message may
   * have been lost): read the row and settle from the database.
   */
  async function reconcileMyRequest() {
    const mine = myRequestRef.current;
    if (!mine || !mountedRef.current) return;
    // The sync settles the request from the database; while it is still
    // pending (or the read failed), ask again later. Fresh: a periodic read
    // already in flight may predate the answer.
    await syncFromServerRef.current(true);
    if (mountedRef.current && myRequestRef.current?.id === mine.id) {
      answerTimerRef.current = setTimeout(reconcileMyRequest, ANSWER_RECONCILE_MS);
    }
  }

  /**
   * The database says where the extension flow stands: accepted minutes this
   * mount does not know yet are applied, a pending request of ours is waited
   * for again, the other side's pending request is shown. Used on (re)mount
   * and whenever an answer's outcome is uncertain (a lost response).
   */
  const syncInFlightRef = useRef<Promise<boolean> | null>(null);
  /**
   * `fresh` is for callers that know a write or an answer just happened: a
   * read already in flight may predate it, so they wait for it and then read
   * again. Routine callers (mount, periodic) share the in-flight read.
   */
  const syncFromServer = useCallback((fresh = false): Promise<boolean> => {
    // One sync at a time: two overlapping reads would both see the same
    // known total and apply the same grant twice.
    if (syncInFlightRef.current) {
      const current = syncInFlightRef.current;
      return fresh ? current.then(() => syncFromServer(true)) : current;
    }
    const run = (async (): Promise<boolean> => {
    try {
      const gen = writeGenRef.current;
      // Bounded: a hung read must settle as a failure, or the pre-end path
      // would wait on it forever and the call could never end.
      const r = await fetch(`/api/sessions/${session.id}/extensions`, { cache: "no-store", signal: AbortSignal.timeout(SYNC_TIMEOUT_MS) });
      const data = (await r.json().catch(() => null)) as { ok?: boolean; extensions?: (TimeExtension & { id: string })[] } | null;
      if (!(r.status >= 200 && r.status < 300 && data?.ok === true && data.extensions)) return false;
      if (!mountedRef.current) return false;
      // Stale: something was written or answered while this read was in
      // flight. Settling from it could drop a request or a grant it never saw.
      if (gen !== writeGenRef.current) return false;
      const rows = data.extensions;
      initialSyncDoneRef.current = true;
      grantOutstandingRef.current = false;
      // Grants come only from this delta, never from a local row again.
      applyGrantRef.current(acceptedMinutes(rows) - knownMinutesRef.current);
      // The request this side awaits is settled by the database's word.
      const mine = myRequestRef.current;
      if (mine) {
        const outcome = requestOutcome(rows, mine.id);
        if (outcome !== "pending") {
          settleMyRequest();
          setExtPending(false);
          if (outcome !== "accepted") showExtNotice("Seu pedido de mais tempo não foi aceito.");
        }
      }
      const pending = rows.find((x) => x.status === "pending");
      if (pending && pending.requested_by === persona) {
        // Our own request: nothing to answer on this side.
        setIncoming(null);
        setExtPending(true);
        if (!myRequestRef.current) awaitAnswer(pending);
      } else if (pending) {
        // Same state the live handler sets for the other side's request.
        setExtPending(true);
        setIncoming(pending);
      } else {
        setIncoming(null);
        if (!myRequestRef.current) setExtPending(false);
      }
      return true;
    } catch (err) {
      console.error("Extension sync failed:", err);
      return false;
    } finally {
      syncInFlightRef.current = null;
    }
    })();
    syncInFlightRef.current = run;
    return run;
    // awaitAnswer is a plain function of this render; refs carry the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, persona]);

  useEffect(() => {
    mountedRef.current = true;
    syncFromServerRef.current = syncFromServer;
    void syncFromServer();
    // A request or answer whose call message was lost still shows up here.
    const periodic = setInterval(() => { void syncFromServer(); }, SYNC_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(periodic);
      myRequestRef.current = null;
    };
  }, [syncFromServer]);

  function awaitAnswer(ext: TimeExtension) {
    noteWrite();
    myRequestRef.current = ext;
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    answerTimerRef.current = setTimeout(reconcileMyRequest, ANSWER_RECONCILE_MS);
  }

  /** 2xx with `{ ok: true }` is the only success; a login redirect answers 200 HTML. */
  async function postJson(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> | null }> {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await r.json().catch(() => null)) as Record<string, unknown> | null;
      return { ok: r.status >= 200 && r.status < 300 && data?.ok === true, data };
    } catch {
      return { ok: false, data: null };
    }
  }

  async function requestExtension(mins: 5 | 10 | 15) {
    if (extBusyRef.current) return;
    extBusyRef.current = true;
    setExtPending(true);
    setShowExtRequestModal(false);
    // The row is created first: the message to the other side carries the
    // real id, so their answer updates the row instead of a browser-made id.
    try {
    const { ok, data } = await postJson(`/api/sessions/${session.id}/extensions`, { minutes_added: mins });
    const ext = data?.ext as TimeExtension | undefined;
    // A pending row already exists (a lost 201, or the other side asked
    // first): announce that one instead of leaving it orphaned.
    const pendingExists = data?.state === "pending-exists" && !!ext;
    if (!(ok || pendingExists) || !ext) {
      setExtPending(false);
      showExtNotice(
        data?.state === "limit-reached"
          ? "Esta sessão já recebeu o máximo de tempo extra."
          : "Não foi possível pedir mais tempo. Tente de novo.",
      );
      return;
    }
    if (ext.requested_by !== persona) {
      // The other side's request is the pending one: answer it, do not send.
      // Same state the live request handler sets.
      setExtPending(true);
      setIncoming(ext);
      return;
    }
    awaitAnswer(ext);
    sendAppMessage({ type: "time-extension-request", ext });
    } finally {
      extBusyRef.current = false;
    }
  }

  async function acceptExtension() {
    if (!incomingExt || extBusyRef.current) return;
    extBusyRef.current = true;
    const ext = incomingExt;
    try {
    const { ok, data } = await postJson(`/api/sessions/${session.id}/extensions/${ext.id}/respond`, { status: "accepted" });
    if (!ok) {
      // The row may have been accepted although the answer was lost, or it
      // may still be pending: the database decides. A sync applies any grant
      // this side does not know yet and re-shows the request if it is still
      // open, so the acceptor can retry.
      // The request stays shown (and keeps the pre-end guard) until the sync
      // says what really happened; a failed sync leaves it for a retry.
      showExtNotice("Não foi possível confirmar a prorrogação.");
      await syncFromServer(true);
      return;
    }
    setExtPending(false);
    setIncoming(null);
    // The row the server accepted is what the peer is told about; the
    // minutes themselves are applied by the (locked) sync, so an overlapping
    // periodic sync that already saw the row cannot make this side add them twice.
    const recorded = (data?.ext as TimeExtension | undefined) ?? ext;
    const accepted = { ...recorded, status: "accepted" as const };
    sendAppMessage({ type: "time-extension-accepted", ext: accepted });
    // The server has accepted: until a read applies the minutes, the grant is
    // outstanding and the countdown may not end the call.
    grantOutstandingRef.current = true;
    noteWrite();
    // A read discarded because something else moved meanwhile is retried at
    // once while the grant is outstanding; the periodic sync is the backstop.
    for (let attempt = 0; attempt < 3 && grantOutstandingRef.current; attempt++) {
      await syncFromServer(true);
    }
    if (typeof data?.token === "string") onTokenRefreshed?.(data.token);
    } finally {
      extBusyRef.current = false;
    }
  }

  async function declineExtension() {
    if (!incomingExt || extBusyRef.current) return;
    extBusyRef.current = true;
    const ext = incomingExt;
    try {
    const { ok, data } = await postJson(`/api/sessions/${session.id}/extensions/${ext.id}/respond`, { status: "declined" });
    // The database is the truth the requester reconciles against, so the
    // "declined" message goes out only once the row really is declined; a
    // request that is no longer pending (already answered) is simply dropped.
    if (!ok) {
      // Already answered elsewhere (another tab accepted it, or the answer
      // was lost) or a plain failure: the database decides what this side
      // shows next, including a grant it does not know yet.
      const already = typeof data?.state === "string" && data.state.startsWith("already-");
      if (!already) showExtNotice("Não foi possível recusar. Tente de novo.");
      await syncFromServer(true);
      return;
    }
    noteWrite();
    setExtPending(false);
    setIncoming(null);
    sendAppMessage({ type: "time-extension-declined", ext });
    } finally {
      extBusyRef.current = false;
    }
  }

  const sessionLabel = `Conversa de ${session.duration} min`;
  const isAlmostOver = remainingMs <= 5 * 60 * 1000;

  return (
    <div
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      style={{ width: "100vw", height: "100vh", background: "#1A1A1A", display: "flex", overflow: "hidden", fontFamily: "Inter, sans-serif", position: "relative" }}
    >
      {/* ── Main area (video + overlays) ─────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Daily.co render area — do not add UI elements inside this div except self-view */}
        <div ref={videoContainerRef} style={{ position: "absolute", inset: 0, background: "#0D0D0D" }} />

        {/* Self-view PiP */}
        <div
          ref={selfViewRef}
          style={{
            position: "absolute", bottom: 80, right: 16,
            width: 160, height: 90, borderRadius: 8,
            overflow: "hidden", border: "1px solid color-mix(in srgb, var(--color-bg-white) 12%, transparent)",
            background: "#333", zIndex: 10, cursor: "move",
          }}
        >
          <span style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)", zIndex: 2, pointerEvents: "none" }}>Você</span>
        </div>

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 48, zIndex: 20,
          background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          opacity: controlsVisible ? 1 : 0, transition: "opacity 0.3s",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "color-mix(in srgb, var(--color-bg-white) 30%, transparent)", letterSpacing: 1 }}>LOOP.TALK</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-bg-white) 60%, transparent)" }}>{sessionLabel}</span>
            <span style={{ fontSize: 16, fontWeight: isAlmostOver ? 700 : 400, color: isAlmostOver ? "#F5A623" : "#F0EFEB", fontFamily: "monospace" }}>
              {formatTime(remainingMs)}
            </span>
          </div>
          <IcoSignal quality={networkQuality} />
        </div>

        {/* 5-min banner */}
        {showExtBanner && (
          <ExtensionBanner onRequest={() => setShowExtRequestModal(true)} pending={extPending} />
        )}

        {/* Extension outcome notice (request or answer that could not be recorded) */}
        {extNotice && (
          <div
            role="status"
            style={{
              position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 30,
              padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "#F5A623", color: "#1A1A1A", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {extNotice}
          </div>
        )}
      </div>

      {/* Chat sidebar */}
      {chatOpen && (
        <ChatSidebar
          messages={messages}
          persona={persona}
          onSend={sendChat}
          onClose={() => { setChatOpen(false); setUnreadCount(0); }}
        />
      )}

      {/* ── Bottom control bar (always visible) ──────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: chatOpen ? 280 : 0, height: 72,
        background: "rgba(0,0,0,0.6)", borderTop: "1px solid color-mix(in srgb, var(--color-bg-white) 8%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 30,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { icon: <IcoMic muted={micMuted} />, label: micMuted ? "Ativar mic" : "Silenciar", onClick: toggleMic, active: micMuted },
            { icon: <IcoCam off={camOff} />, label: camOff ? "Ligar cam" : "Câmera", onClick: toggleCam, active: camOff },
            { icon: <IcoScreen />, label: "Tela", onClick: toggleScreen, active: screenSharing },
            {
              icon: <IcoChat unread={unreadCount} />,
              label: "Chat",
              onClick: () => { setChatOpen((v) => !v); setUnreadCount(0); },
              active: chatOpen,
            },
          ].map(({ icon, label, onClick, active }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: active ? "rgba(192,57,43,0.3)" : "color-mix(in srgb, var(--color-bg-white) 8%, transparent)",
                color: active ? "#F87171" : "#F0EFEB",
                transition: "background 0.15s",
              }}
            >
              {icon}
              <span style={{ fontSize: 10, color: "var(--color-gray-500)" }}>{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowEndModal(true)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "rgba(192,57,43,0.85)", color: "var(--color-bg-white)",
          }}
        >
          <IcoPhone />
          <span style={{ fontSize: 10 }}>Encerrar</span>
        </button>
      </div>

      {/* Modals */}
      {showEndModal && (
        <EndModal onConfirm={handleEndConfirm} onCancel={() => setShowEndModal(false)} />
      )}
      {showExtRequestModal && (
        <ExtensionRequestModal
          persona={persona}
          onSelect={requestExtension}
          onDismiss={() => setShowExtRequestModal(false)}
        />
      )}
      {incomingExt && incomingExt.requested_by !== persona && (
        <ExtensionIncomingModal
          ext={incomingExt}
          otherName={otherName}
          onAccept={acceptExtension}
          onDecline={declineExtension}
        />
      )}
    </div>
  );
}
