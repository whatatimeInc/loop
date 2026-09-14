// Server-side only — never import from client components.
// Daily.co REST API helpers.

const DAILY_API_URL = "https://api.daily.co/v1";
const DAILY_API_KEY = process.env.DAILY_CO_API_KEY!;

function dailyHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DAILY_API_KEY}`,
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
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        // Private: the raw daily.co URL is useless without a token minted by
        // /api/sessions/[id]/token, so a leaked URL cannot bypass the app's
        // participant check (and nobody lands on Daily's default UI).
        privacy: "private",
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

export async function deleteDailyRoom(roomName: string): Promise<void> {
  const res = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: dailyHeaders(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Daily.co deleteRoom failed: ${await res.text()}`);
  }
}

export async function verifyDailyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = Buffer.from(signature, "hex");
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
}
