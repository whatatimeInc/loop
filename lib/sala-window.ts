/**
 * The entry window of a video session, shared by the /sala page and the
 * meeting-token API so the UI and the token issuer never disagree.
 *
 * A participant may enter from `earlyEntryMinutes` before the start until
 * `LATE_EXIT_MINUTES` after the scheduled end. Outside that window no meeting
 * token is minted, and the token itself carries the same bounds (`nbf`/`exp`)
 * so a token obtained early cannot open the room before its time.
 */
export const DEFAULT_EARLY_ENTRY_MINUTES = 10;
export const LATE_EXIT_MINUTES = 60;
/** A call that is still running when the entry window closes may go on this much longer. */
export const TOKEN_GRACE_MINUTES = 30;
/** Statuses in which the room may still be opened. */
export const ENTERABLE_STATUSES = new Set(["agendada", "concluída"]);

/** Read per request: SALA_EARLY_ENTRY_MINUTES lets a demo enter a session booked for later today. */
export function earlyEntryMinutes(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.SALA_EARLY_ENTRY_MINUTES ?? DEFAULT_EARLY_ENTRY_MINUTES);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_EARLY_ENTRY_MINUTES;
}

export type EntryWindow = {
  /** Earliest moment a participant may join (ms since epoch). */
  opensAt: number;
  /** Scheduled end of the session (ms since epoch). */
  endsAt: number;
  /** Latest moment a participant may still join or rejoin (ms since epoch). */
  closesAt: number;
  /** Moment Daily ejects everyone still in the room (ms since epoch). */
  tokenExpiresAt: number;
};

export function entryWindow(startsAt: string | Date, durationMinutes: number, early: number): EntryWindow {
  const startsMs = new Date(startsAt).getTime();
  const endsAt = startsMs + durationMinutes * 60_000;
  const closesAt = endsAt + LATE_EXIT_MINUTES * 60_000;
  return {
    opensAt: startsMs - early * 60_000,
    endsAt,
    closesAt,
    tokenExpiresAt: closesAt + TOKEN_GRACE_MINUTES * 60_000,
  };
}

export type EntryState = "too-early" | "open" | "expired";

export function entryState(window: EntryWindow, now: number): EntryState {
  // A session with an unreadable start or duration never opens: NaN would
  // make both comparisons below false and report the room as open.
  if (!Number.isFinite(window.opensAt) || !Number.isFinite(window.closesAt)) return "expired";
  if (now < window.opensAt) return "too-early";
  if (now > window.closesAt) return "expired";
  return "open";
}
