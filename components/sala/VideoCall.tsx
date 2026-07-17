"use client";

import {
  useEffect, useState, useRef, useCallback,
} from "react";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyEventObjectNetworkQualityEvent,
} from "@daily-co/daily-js";
import type { SessionData, Persona, ChatMessage, TimeExtension } from "./types";

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
        <span style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "#C0392B", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  const c = quality === "good" ? "#68A279" : quality === "fair" ? "#F5A623" : "#C0392B";
  const heights = [6, 10, 14];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
      {heights.map((h, i) => {
        const active = quality === "good" ? true : quality === "fair" ? i < 2 : i < 1;
        return <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: active ? c : "rgba(255,255,255,0.25)" }} />;
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
      borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#F0EFEB" }}>Chat da sessão</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#807F71", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m) => {
          const mine = m.sender === persona;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "8px 12px", borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: mine ? "#EAEA68" : "rgba(255,255,255,0.1)",
                color: mine ? "#272618" : "#F0EFEB", fontSize: 13,
              }}>
                {!mine && <div style={{ fontSize: 11, color: "#807F71", marginBottom: 4 }}>{m.senderName}</div>}
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Mensagem..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
            padding: "8px 12px", color: "#F0EFEB", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none",
          }}
        />
        <button onClick={send} style={{ padding: "8px 12px", background: "#EAEA68", border: "none", borderRadius: 8, color: "#272618", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>→</button>
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
        <p style={{ fontSize: 14, color: "#807F71", margin: "0 0 24px" }}>Esta ação encerrará a chamada para todos os participantes.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#F0EFEB", cursor: "pointer", fontSize: 14 }}>
            Continuar
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", background: "#C0392B", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
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
      background: "rgba(26,26,26,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      fontFamily: "Inter, sans-serif",
    }}>
      <span style={{ fontSize: 14, color: "#F0EFEB" }}>Sua sessão termina em 5 minutos.</span>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={onRequest}
          disabled={pending}
          style={{
            padding: "8px 16px", background: "#EAEA68", border: "none", borderRadius: 8,
            color: "#272618", fontSize: 13, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.5 : 1,
          }}
        >
          {pending ? "Aguardando..." : "Pedir mais tempo"}
        </button>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "#807F71", cursor: "pointer", fontSize: 13 }}>
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
              flex: 1, padding: "14px 0", background: "transparent", border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: 10, color: "#F0EFEB", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#EAEA68")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
            >
              +{m} min
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#807F71", margin: "0 0 16px", textAlign: "center" }}>
          Esta sessão é um presente — sem cobrança adicional.
        </p>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#807F71", fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center" }}>
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
          <button onClick={onDecline} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#F0EFEB", cursor: "pointer", fontSize: 14 }}>Recusar</button>
          <button onClick={onAccept} style={{ flex: 1, padding: "12px", background: "#EAEA68", border: "none", borderRadius: 8, color: "#272618", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Aceitar</button>
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
  onEnd,
  onConnectionLost,
}: {
  session: SessionData;
  persona: Persona;
  token: string | null;
  sessionStartedAt: number;
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
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    const endMs = sessionStartedAt + session.duration * 60 * 1000;
    return Math.max(0, endMs - Date.now());
  });
  const [extraMs, setExtraMs] = useState(0);
  const [showExtBanner, setShowExtBanner] = useState(false);
  const [extPending, setExtPending] = useState(false);
  const [showExtRequestModal, setShowExtRequestModal] = useState(false);
  const [incomingExt, setIncomingExt] = useState<TimeExtension | null>(null);

  // Timer — decrements every second
  useEffect(() => {
    const interval = setInterval(() => {
      const endMs = sessionStartedAt + (session.duration * 60 + extraMs / 1000) * 1000;
      const left = Math.max(0, endMs - Date.now());
      setRemainingMs(left);
      // Show 5-min banner
      if (left > 0 && left <= 5 * 60 * 1000 + 500 && left > 5 * 60 * 1000 - 500) {
        setShowExtBanner(true);
      }
      if (left === 0) { clearInterval(interval); onEnd(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt, session.duration, extraMs, onEnd]);

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
    if (!session.daily_room_url) return;

    const call = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailyConfig: { experimentalChromeVideoMuteLightOff: true } as any,
    });
    callRef.current = call;

    call.join({
      url: session.daily_room_url,
      token: token ?? undefined,
    }).catch(console.error);

    // Attach remote video to main container
    call.on("participant-joined", (event: DailyEventObjectParticipant) => {
      if (!event.participant.local && videoContainerRef.current) {
        const track = Object.values(event.participant.tracks).find((t) => t?.track != null)?.track ?? null;
        if (track) {
          const video = document.createElement("video");
          video.srcObject = new MediaStream([track]);
          video.autoplay = true;
          video.playsInline = true;
          video.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
          video.dataset.sessionId = event.participant.session_id;
          videoContainerRef.current.appendChild(video);
        }
      }
    });

    call.on("participant-left", (event: DailyEventObjectParticipantLeft) => {
      if (videoContainerRef.current) {
        const vid = videoContainerRef.current.querySelector(`[data-session-id="${event.participant.session_id}"]`);
        vid?.remove();
      }
    });

    // Self-view
    call.on("track-started", (event) => {
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
        if (!chatOpen) setUnreadCount((c) => c + 1);
      }
      if (data.type === "time-extension-request" && data.ext) {
        setIncomingExt(data.ext);
        setExtPending(true);
      }
      if (data.type === "time-extension-accepted" && data.ext) {
        setExtraMs((ms) => ms + data.ext!.minutes_added * 60 * 1000);
        setExtPending(false);
        setIncomingExt(null);
      }
      if (data.type === "time-extension-declined") {
        setExtPending(false);
        setIncomingExt(null);
      }
    });

    // Connection issues
    call.on("error", (e) => { console.error("Daily error:", e); onConnectionLost(); });

    return () => {
      call.leave().catch(() => {}).finally(() => call.destroy());
    };
  }, [session.daily_room_url, token, chatOpen, onConnectionLost]);

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
    callRef.current?.sendAppMessage({ type: "chat", text, sender: persona, senderName: msg.senderName }, "*");
  }

  function requestExtension(mins: 5 | 10 | 15) {
    const ext: TimeExtension = {
      id: `${Date.now()}`,
      requested_by: persona,
      minutes_added: mins,
      status: "pending",
    };
    setExtPending(true);
    setShowExtRequestModal(false);
    callRef.current?.sendAppMessage({ type: "time-extension-request", ext }, "*");
    // Persist to DB
    fetch(`/api/sessions/${session.id}/extensions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requested_by: persona, minutes_added: mins }),
    }).catch(console.error);
  }

  function acceptExtension() {
    if (!incomingExt) return;
    const accepted = { ...incomingExt, status: "accepted" as const };
    setExtraMs((ms) => ms + incomingExt.minutes_added * 60 * 1000);
    setExtPending(false);
    setIncomingExt(null);
    callRef.current?.sendAppMessage({ type: "time-extension-accepted", ext: accepted }, "*");
    fetch(`/api/sessions/${session.id}/extensions/${incomingExt.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    }).catch(console.error);
  }

  function declineExtension() {
    setExtPending(false);
    setIncomingExt(null);
    callRef.current?.sendAppMessage({ type: "time-extension-declined" }, "*");
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
            overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)",
            background: "#333", zIndex: 10, cursor: "move",
          }}
        >
          <span style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.5)", zIndex: 2, pointerEvents: "none" }}>Você</span>
        </div>

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 48, zIndex: 20,
          background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          opacity: controlsVisible ? 1 : 0, transition: "opacity 0.3s",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>LOOP.TALK</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{sessionLabel}</span>
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
        background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(255,255,255,0.08)",
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
                background: active ? "rgba(192,57,43,0.3)" : "rgba(255,255,255,0.08)",
                color: active ? "#F87171" : "#F0EFEB",
                transition: "background 0.15s",
              }}
            >
              {icon}
              <span style={{ fontSize: 10, color: "#807F71" }}>{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowEndModal(true)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "rgba(192,57,43,0.85)", color: "#fff",
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
