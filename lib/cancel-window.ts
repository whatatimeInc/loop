/**
 * The cancellation window of a session, shared by the /agenda page and the
 * cancel API so the button and the server never disagree.
 *
 * A guest may cancel their own session until `cancelDeadlineHours` before the
 * scheduled start. Past that point the request is refused: the mentor has
 * already reserved the time and could not offer it to anyone else.
 */
export const DEFAULT_CANCEL_DEADLINE_HOURS = 24;

/** Read per request: CANCEL_DEADLINE_HOURS lets a demo cancel a session booked for later today. */
export function cancelDeadlineHours(env: Record<string, string | undefined> = process.env): number {
  // A blank value (an emptied Vercel field) must mean "unset", not 0 hours.
  const raw = env.CANCEL_DEADLINE_HOURS?.trim();
  if (!raw) return DEFAULT_CANCEL_DEADLINE_HOURS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_CANCEL_DEADLINE_HOURS;
}

/** Latest moment a guest may still cancel (ms since epoch). NaN when the start is unreadable. */
export function cancelDeadline(startsAt: string | Date, hours: number): number {
  return new Date(startsAt).getTime() - hours * 3_600_000;
}

export type CancelState = "cancellable" | "past-deadline" | "not-scheduled";

export function cancelState(
  session: { status: string; startsAt: string | Date },
  now: number,
  hours: number,
): CancelState {
  if (session.status !== "agendada") return "not-scheduled";
  const deadline = cancelDeadline(session.startsAt, hours);
  // An unreadable start must not read as "still in time": NaN makes the
  // comparison below false, which is the refusing branch.
  if (Number.isFinite(deadline) && now <= deadline) return "cancellable";
  return "past-deadline";
}
