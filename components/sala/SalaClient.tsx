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
} from "./SpecialStates";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SalaClientProps {
  session: SessionData;
  persona: Persona;
  initialScreen: Screen;
  earlyEntryMinutes?: number;
}

// ── Main client orchestrator ──────────────────────────────────────────────────

export function SalaClient({ session, persona, initialScreen, earlyEntryMinutes = 10 }: SalaClientProps) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(session.daily_room_url);
  // A Daily room exists only when the token API gives us a usable roomUrl;
  // before that assume the room from the session row is there.
  const [roomReady, setRoomReady] = useState<boolean>(!!session.daily_room_url);
  // Entrar stays disabled until the token request has settled, so VideoCall
  // mounts once with a stable token instead of remounting when it arrives.
  const [tokenSettled, setTokenSettled] = useState(false);
  const [otherJoined, setOtherJoined] = useState(false);
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

    // While waiting without a room, retry every 15 s so a room provisioned
    // later enables Entrar without a reload.
    let interval: ReturnType<typeof setInterval> | null = null;
    if (screen === "waiting" && !roomReady) {
      interval = setInterval(fetchToken, 15_000);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [session.id, screen, roomReady]);

  // ── Supabase Realtime: detect other participant joining ────────────────────
  useEffect(() => {
    if (screen !== "waiting") return;
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
    const GRACE_MS = 15 * 60 * 1000;
    const startsMs = new Date(session.starts_at).getTime();

    // Check immediately and also set a timer
    const checkNoShow = () => {
      const elapsed = Date.now() - startsMs;
      if (elapsed >= GRACE_MS && !otherJoined) {
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
    setScreen("incall");
  }, []);

  const handleMarkNoShow = useCallback(() => {
    fetch(`/api/sessions/${session.id}/no-show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no_show_by: persona === "mentor" ? "guest" : "mentor" }),
    }).catch(() => {});
    setScreen("post-call");
  }, [session.id, persona]);

  const handleReviewSubmitted = useCallback(() => {
    // nothing to do; PostCallGuest manages its own state
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  switch (screen) {
    case "not-yet":
      return <NotYetScreen session={session} persona={persona} />;

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
        />
      );

    case "no-show-guest":
      return (
        <NoShowGuestScreen
          session={session}
          onMarkNoShow={handleMarkNoShow}
        />
      );

    default:
      return null;
  }
}
