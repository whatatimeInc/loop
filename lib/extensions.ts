/**
 * Time-extension rules shared by the extension routes, the token route and
 * the room page, so an accepted extension changes the session's effective
 * end everywhere at once instead of only in one browser's countdown.
 */
import { entryWindow, type EntryWindow } from "./sala-window.ts";

export type ExtensionRow = { minutes_added: number; status: string };
export type Persona = "mentor" | "guest";

/** Minutes granted by accepted extensions; pending and declined rows count nothing. */
export function acceptedMinutes(rows: ExtensionRow[]): number {
  return rows.reduce((sum, r) => (r.status === "accepted" ? sum + r.minutes_added : sum), 0);
}

/** Booked duration plus every accepted extension. */
export function effectiveDuration(duration: number, rows: ExtensionRow[]): number {
  return duration + acceptedMinutes(rows);
}

/** The entry window of the extended session: token bounds and page state agree on it. */
export function extendedWindow(startsAt: string | Date, duration: number, rows: ExtensionRow[], early: number): EntryWindow {
  return entryWindow(startsAt, effectiveDuration(duration, rows), early);
}

/** Room lifetime rule from POST /api/sessions: start + duration + 90 min, with the extended duration. */
export const ROOM_SLACK_MINUTES = 90;
export function roomExpiryFor(startsAt: string | Date, effective: number): Date {
  return new Date(new Date(startsAt).getTime() + (effective + ROOM_SLACK_MINUTES) * 60_000);
}

/** Only the participant who did not ask may answer a request. */
export function respondPermission(input: { requestedBy: Persona; callerPersona: Persona }): "ok" | "own-request" {
  return input.requestedBy === input.callerPersona ? "own-request" : "ok";
}

export type RequestOutcome = "accepted" | "declined" | "pending" | "missing";

/** State of one request among the session's rows, for a requester left without an answer. */
export function requestOutcome(rows: (ExtensionRow & { id: string })[], extId: string): RequestOutcome {
  const row = rows.find((r) => r.id === extId);
  if (!row) return "missing";
  if (row.status === "accepted" || row.status === "declined" || row.status === "pending") return row.status;
  return "missing";
}

/**
 * Total extension a session may accumulate. The meeting token minted at entry
 * outlives the booked end by LATE_EXIT (60) + TOKEN_GRACE (30) minutes and
 * cannot be swapped on a live call, so accepted extensions beyond 60 minutes
 * would leave the call ejectable before its extended end.
 */
export const MAX_EXTENSION_MINUTES = 60;

/** Whether one more request of `minutes` fits under the cap given the accepted rows. */
export function extensionAllowance(rows: ExtensionRow[], minutes: number): "ok" | "limit-reached" {
  return acceptedMinutes(rows) + minutes > MAX_EXTENSION_MINUTES ? "limit-reached" : "ok";
}

/** How close to the end the "ask for more time" banner is offered. */
export const EXTENSION_OFFER_WINDOW_MS = 5 * 60_000;

/**
 * Whether the banner that opens the request modal should be on screen.
 *
 * Derived from the time left, never latched at the moment the countdown
 * crosses the threshold: a participant who joins late, or reloads inside the
 * last minutes, must still be able to ask for more time. It also stays up
 * while this side waits for an answer, because the "waiting" indicator lives
 * in the banner.
 */
export function shouldOfferExtension(input: { remainingMs: number; requestPending: boolean }): boolean {
  if (input.requestPending) return true;
  return input.remainingMs > 0 && input.remainingMs <= EXTENSION_OFFER_WINDOW_MS;
}
