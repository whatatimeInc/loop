/**
 * No-show rules shared by the /no-show route and the room screens, so the
 * countdown a participant sees and the check the server applies agree.
 */
export type Persona = "mentor" | "guest";

/** How long after the start the waiting side may record that the other did not show. */
export const NO_SHOW_GRACE_MINUTES = 15;

/** Moment (ms since epoch) a no-show may first be recorded; NaN for an unreadable start. */
export function noShowOpensAt(startsAt: string | Date): number {
  return new Date(startsAt).getTime() + NO_SHOW_GRACE_MINUTES * 60_000;
}

export function otherParty(persona: Persona): Persona {
  return persona === "mentor" ? "guest" : "mentor";
}

export type NoShowDecision = "ok" | "not-counterpart" | "not-scheduled" | "too-early";

/**
 * Whether `callerPersona` may record that `accused` did not show.
 * Only the other party can be accused, only while the session is still
 * scheduled, and only once the grace after the start is over.
 */
export function noShowDecision(input: {
  status: string;
  startsAt: string | Date;
  now: number;
  callerPersona: Persona;
  accused: Persona;
}): NoShowDecision {
  if (input.accused !== otherParty(input.callerPersona)) return "not-counterpart";
  if (input.status !== "agendada") return "not-scheduled";
  // `!(now >= opensAt)` rather than `now < opensAt`: a NaN start must not open it.
  if (!(input.now >= noShowOpensAt(input.startsAt))) return "too-early";
  return "ok";
}
