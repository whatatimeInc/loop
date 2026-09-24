// Server-side only — never import from client components.
// Daily.co REST API helpers.

// Relative with the extension, like lib/env.ts: keeps this module loadable
// under `node --test`, which does not resolve the "@/" alias.
import { env } from "./env.ts";

const DAILY_API_URL = "https://api.daily.co/v1";

// Read per call, not at module load: importing this module must never throw,
// and env() is validated once at startup anyway.
function dailyHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env().DAILY_CO_API_KEY}`,
  };
}

export type DailyRoom = {
  id: string;
  name: string;
  url: string;
};

export async function createDailyRoom(sessionId: string, expiresAt: Date): Promise<DailyRoom> {
  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      name: `looptalk-${sessionId}`,
      // Private: the raw daily.co URL is useless without a token minted by
      // /api/sessions/[id]/token, so a leaked URL cannot bypass the app's
      // participant check (and nobody lands on Daily's default UI).
      // NB: `privacy` is a top-level field of the rooms API, not a property.
      privacy: "private",
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        enable_prejoin_ui: false,
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });
  if (!res.ok) throw new Error(`Daily.co createRoom failed: ${await res.text()}`);
  return res.json();
}

export async function createMeetingToken(opts: {
  roomName: string;
  userName: string;
  isOwner: boolean;
  /** Token is rejected by Daily before this moment (nbf). */
  notBefore?: Date;
  expiresAt: Date;
}): Promise<string> {
  const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      properties: {
        // room_name is what scopes the token: without it a token opens any room in the domain.
        room_name: opts.roomName,
        user_name: opts.userName,
        is_owner: opts.isOwner,
        ...(opts.notBefore ? { nbf: Math.floor(opts.notBefore.getTime() / 1000) } : {}),
        exp: Math.floor(opts.expiresAt.getTime() / 1000),
        // Daily ejects the participant when the token expires, so a call
        // cannot outlive the window the app enforces.
        eject_at_token_exp: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`Daily.co createToken failed: ${await res.text()}`);
  const data = await res.json();
  return data.token as string;
}

export async function deleteDailyRoom(roomName: string, signal?: AbortSignal): Promise<void> {
  const res = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: dailyHeaders(),
    signal,
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Daily.co deleteRoom failed: ${await res.text()}`);
  }
  // Nothing in the success body is needed, but an unread body keeps the
  // socket checked out of the pool until it is collected; release it now.
  await res.body?.cancel();
}

/**
 * Pushes a room's expiry later, so an accepted time extension is not cut off
 * by the lifetime fixed when the room was created. Callers pass the later of
 * the two instants; Daily refuses new joins after `exp` and, since rooms are
 * created without `eject_at_room_exp`, does not eject people already inside.
 */
export async function updateDailyRoomExpiry(roomName: string, expiresAt: Date): Promise<void> {
  const res = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({ properties: { exp: Math.floor(expiresAt.getTime() / 1000) } }),
  });
  if (!res.ok) throw new Error(`Daily.co updateRoom failed: ${await res.text()}`);
  await res.body?.cancel();
}
