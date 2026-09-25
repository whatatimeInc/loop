"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SessionData, Persona, Screen } from "./types";
import { WaitingRoom } from "./WaitingRoom";
import { VideoCall } from "./VideoCall";
import { PostCallMentor, PostCallGuest } from "./PostCall";
import {
  NotYetScreen,
  ExpiredScreen,
  NoShowMentorScreen,
  NoShowGuestScreen,
  ConnectionLostScreen,
  type MarkNoShowResult,
} from "./SpecialStates";
import { noShowOpensAt, otherParty } from "@/lib/no-show";
import { APP_TZ } from "@/lib/slots";

// What the waiting side reads when the server refuses a no-show.
const NO_SHOW_MESSAGES: Record<string, string> = {
  "too-early": "Ainda está dentro da tolerância. Aguarde o fim da contagem.",
  "not-scheduled": "Esta sessão já foi encerrada ou cancelada. Recarregue a página.",
  "not-counterpart": "Só é possível registrar a ausência da outra pessoa desta sessão.",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface SalaClientProps {
  session: SessionData;
  persona: Persona;
  initialScreen: Screen;
  earlyEntryMinutes?: number;
  /** Minutes already granted by accepted time extensions (server-side sum). */
  extraMinutes?: number;
}

// ── Main client orchestrator ──────────────────────────────────────────────────

export function SalaClient({ session, persona, initialScreen, earlyEntryMinutes = 10, extraMinutes: initialExtraMinutes = 0 }: SalaClientProps) {
  const [rawScreen, setScreen] = useState<Screen>(initialScreen);
  // Accepted extensions are kept here, above VideoCall, so a remount after a
  // dropped connection restarts the countdown from the extended end.
  const [extraMinutes, setExtraMinutes] = useState(initialExtraMinutes);
  const handleExtensionAccepted = useCallback((minutes: number) => {
    setExtraMinutes((m) => m + minutes);
  }, []);
  // A token re-issued on accept is NOT applied to the live call: changing the
  // `token` prop re-runs VideoCall's join effect and would drop the call. It
  // is kept aside and used only when the user reconnects.
  const refreshedToken = useRef<string | null>(null);
  const handleTokenRefreshed = useCallback((t: string) => { refreshedToken.current = t; }, []);
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(session.daily_room_url);
  // A Daily room exists only when the token API gives us a usable roomUrl;
  // before that assume the room from the session row is there.
  const [roomReady, setRoomReady] = useState<boolean>(!!session.daily_room_url);
  // Entrar stays disabled until the token request has settled, so VideoCall
  // mounts once with a stable token instead of remounting when it arrives.
  const [tokenSettled, setTokenSettled] = useState(false);
  const [otherJoined, setOtherJoined] = useState(false);
  // A no-show in flight or already recorded is final for this screen: the
  // server write cannot be taken back, so a late arrival must not reopen the
  // waiting room over it.
  const [markState, setMarkState] = useState<"idle" | "pending" | "recorded">("idle");
  // The other side arrived after the grace: show the waiting room, where Entrar
  // joins the call, instead of offering to record them as absent. Derived, so
  // a failed attempt (markState back to idle) re-evaluates on its own.
  const screen: Screen =
    otherJoined && markState === "idle" && (rawScreen === "no-show-mentor" || rawScreen === "no-show-guest")
      ? "waiting"
      : rawScreen;
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(
    session.session_started_at
      ? new Date(session.session_started_at).getTime()
      : Date.now(),
  );
  const [actualMinutes, setActualMinutes] = useState(session.duration);
  const enteredAt = useRef<number | null>(null);

  // ── Fetch meeting token (only for waiting/incall screens) ───────────────────
  useEffect(() => {
    // Only while waiting: every fetch mints a NEW token string, and a token
    // change while in the call would remount VideoCall mid-session.
    if (screen !== "waiting") return;

    let cancelled = false;
    const fetchToken = async () => {
      try {
        const r = await fetch(`/api/sessions/${session.id}/token`);
        if (!r.ok || cancelled) return;
        const data: { token: string | null; roomUrl: string | null } = await r.json();
        if (cancelled) return;
        setToken(data.token);
        setTokenSettled(true);
        if (data.roomUrl) {
          setRoomUrl(data.roomUrl);
          setRoomReady(true);
        } else if (data.token === null) {
          setRoomReady(false);
        }
      } catch (err) {
        // Transport/parse error — keep the current roomReady/roomUrl untouched
        console.error("Failed to fetch token:", err);
      }
    };

    fetchToken();

    // While waiting without a room or without a token (the token API refuses
    // outside the entry window and fails on a Daily outage), retry every 15 s
    // so Entrar unlocks without a reload once the window opens or Daily recovers.
    let interval: ReturnType<typeof setInterval> | null = null;
    if (screen === "waiting" && (!roomReady || !tokenSettled)) {
      interval = setInterval(fetchToken, 15_000);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [session.id, screen, roomReady, tokenSettled]);

  // ── Supabase Realtime: detect other participant joining ────────────────────
  useEffect(() => {
    // Also while a no-show screen is up: if the other side arrives late, the
    // waiting side must see it before recording an absence.
    if (screen !== "waiting" && screen !== "no-show-mentor" && screen !== "no-show-guest") return;
    const supabase = createClient();
    const channel = supabase
      .channel(`session:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const updated = payload.new as Partial<SessionData>;
          // When session_started_at gets set, the other participant joined
          if (updated.session_started_at && !session.session_started_at) {
            setOtherJoined(true);
            setSessionStartedAt(new Date(updated.session_started_at).getTime());
          }
        },
      )
      .subscribe();

    // Also poll presence via presence channel
    const presenceChannel = supabase.channel(`sala:${session.id}`, {
      config: { presence: { key: persona } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const otherPersona: Persona = persona === "mentor" ? "guest" : "mentor";
        if (state[otherPersona]) setOtherJoined(true);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ persona, joined_at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [session.id, persona, screen, session.session_started_at]);

  // ── No-show detection (waiting room) ─────────────────────────────────────
  useEffect(() => {
    if (screen !== "waiting") return;
    const opensAt = noShowOpensAt(session.starts_at);

    // Check immediately and also set a timer
    const checkNoShow = () => {
      if (Date.now() >= opensAt && !otherJoined) {
        // After grace period, show no-show screen for whichever side is waiting
        if (persona === "guest") setScreen("no-show-mentor");
        else setScreen("no-show-guest");
      }
    };

    checkNoShow();
    const t = setInterval(checkNoShow, 10_000);
    return () => clearInterval(t);
  }, [screen, session.starts_at, persona, otherJoined]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEnterCall = useCallback(() => {
    enteredAt.current = Date.now();
    // Mark session started on server if we're the first to join
    fetch(`/api/sessions/${session.id}/start`, { method: "POST" }).catch(() => {});
    setScreen("incall");
  }, [session.id]);

  const handleCallEnd = useCallback(() => {
    const now = Date.now();
    if (enteredAt.current) {
      setActualMinutes(Math.round((now - enteredAt.current) / 60_000));
    }
    // Mark session as completed
    fetch(`/api/sessions/${session.id}/end`, { method: "POST" }).catch(() => {});
    setScreen("post-call");
  }, [session.id]);

  const handleConnectionLost = useCallback(() => {
    setScreen("connection-lost");
  }, []);

  const handleRetryConnection = useCallback(() => {
    if (refreshedToken.current) {
      // A new token remounts the call: the reconnect the user just asked for.
      setToken(refreshedToken.current);
      refreshedToken.current = null;
    }
    setScreen("incall");
  }, []);

  // The screen shows the outcome: a refused or failed request must not look
  // like a recorded no-show.
  const postNoShow = useCallback(async (): Promise<MarkNoShowResult> => {
    try {
      const r = await fetch(`/api/sessions/${session.id}/no-show`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ no_show_by: otherParty(persona) }),
      });
      if (r.ok) return { ok: true };
      const data: { state?: string; status?: string | null; opens_at?: string | null } = await r.json().catch(() => ({}));
      // The session left "agendada" another way: retrying cannot help.
      if (data.state === "not-scheduled") {
        // Both sides reported at once and the other one was recorded first.
        const already = data.status === "mentor_no_show" || data.status === "guest_no_show";
        return { ok: false, message: already ? "A ausência nesta sessão já foi registrada." : NO_SHOW_MESSAGES["not-scheduled"], final: true };
      }
      if (data.state === "too-early" && data.opens_at) {
        // The server's clock decides; show its time, in the app's time zone.
        const at = new Date(data.opens_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: APP_TZ });
        return { ok: false, message: `Ainda está dentro da tolerância. Tente de novo a partir de ${at}.` };
      }
      return { ok: false, message: NO_SHOW_MESSAGES[data.state ?? ""] ?? "Não foi possível registrar agora. Tente de novo." };
    } catch {
      return { ok: false, message: "Sem conexão. Tente de novo." };
    }
  }, [session.id, persona]);

  const handleMarkNoShow = useCallback(async (): Promise<MarkNoShowResult> => {
    setMarkState("pending");
    const result = await postNoShow();
    // Already closed another way counts as final too: nothing left to retry.
    setMarkState(result.ok || result.final ? "recorded" : "idle");
    return result;
  }, [postNoShow]);

  const handleReviewSubmitted = useCallback(() => {
    // nothing to do; PostCallGuest manages its own state
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  switch (screen) {
    case "not-yet":
      return <NotYetScreen session={session} persona={persona} earlyEntryMinutes={earlyEntryMinutes} />;

    case "expired":
      return <ExpiredScreen session={session} persona={persona} />;

    case "waiting":
      return (
        <WaitingRoom
          session={session}
          persona={persona}
          otherJoined={otherJoined}
          roomReady={roomReady && tokenSettled}
          earlyEntryMinutes={earlyEntryMinutes}
          onEnter={handleEnterCall}
        />
      );

    case "incall":
      if (!roomUrl) {
        // No Daily room provisioned — never mount VideoCall without a room URL
        return (
          <WaitingRoom
            session={session}
            persona={persona}
            otherJoined={otherJoined}
            roomReady={roomReady && tokenSettled}
            earlyEntryMinutes={earlyEntryMinutes}
            onEnter={handleEnterCall}
          />
        );
      }
      return (
        <>
          <VideoCall
            session={{ ...session, daily_room_url: roomUrl }}
            persona={persona}
            token={token}
            sessionStartedAt={sessionStartedAt}
            extraMinutes={extraMinutes}
            onTokenRefreshed={handleTokenRefreshed}
            onExtensionAccepted={handleExtensionAccepted}
            onEnd={handleCallEnd}
            onConnectionLost={handleConnectionLost}
          />
          {/* Connection-lost overlay on top of video */}
          {/* handled inside VideoCall via separate re-render path */}
        </>
      );

    case "connection-lost":
      if (!roomUrl) {
        return (
          <WaitingRoom
            session={session}
            persona={persona}
            otherJoined={otherJoined}
            roomReady={roomReady && tokenSettled}
            earlyEntryMinutes={earlyEntryMinutes}
            onEnter={handleEnterCall}
          />
        );
      }
      return (
        <>
          {/* Keep the video UI in background, overlay the reconnecting screen */}
          <VideoCall
            session={{ ...session, daily_room_url: roomUrl }}
            persona={persona}
            token={token}
            sessionStartedAt={sessionStartedAt}
            extraMinutes={extraMinutes}
            onTokenRefreshed={handleTokenRefreshed}
            onExtensionAccepted={handleExtensionAccepted}
            onEnd={handleCallEnd}
            onConnectionLost={() => {}}
          />
          <ConnectionLostScreen onRetry={handleRetryConnection} />
        </>
      );

    case "post-call":
      return persona === "mentor" ? (
        <PostCallMentor session={session} actualMinutes={actualMinutes} />
      ) : (
        <PostCallGuest
          session={session}
          actualMinutes={actualMinutes}
          onReviewSubmitted={handleReviewSubmitted}
        />
      );

    case "no-show-mentor":
      return (
        <NoShowMentorScreen
          session={session}
          onLeave={() => { window.location.href = "/explorar"; }}
          onMarkNoShow={handleMarkNoShow}
        />
      );

    case "no-show-guest":
      return (
        <NoShowGuestScreen
          session={session}
          onMarkNoShow={handleMarkNoShow}
          onLeave={() => { window.location.href = "/dashboard"; }}
        />
      );

    default:
      return null;
  }
}
