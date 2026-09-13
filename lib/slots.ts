// Pure slot arithmetic for the booking calendar. No I/O.
// All wall-clock times are in APP_TZ (the product is Brazil-only for now);
// instants are ISO strings in UTC.
import type { AvailabilityBlock } from "@/lib/creators";

export const APP_TZ = "America/Sao_Paulo";
export const SLOT_STEP_MINUTES = 30;

/** "HH:MM" or "HH:MM:SS" → minutes since midnight. */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Offset (ms) of APP_TZ from UTC at a given instant. */
// Formatters are built once: the slots route calls these thousands of times
// per request when a creator is available all day.
const OFFSET_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TZ, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
});
const ZONED_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TZ, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short",
});

function tzOffsetMs(at: Date): number {
  const parts = OFFSET_FMT.formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - at.getTime();
}

/** Build the UTC instant for a wall-clock date ("YYYY-MM-DD") + time ("HH:MM") in APP_TZ. */
export function zonedToUtc(dateStr: string, time: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // Two-pass correction handles DST edges well enough for a booking calendar.
  const off1 = tzOffsetMs(new Date(guess));
  const off2 = tzOffsetMs(new Date(guess - off1));
  return new Date(guess - off2);
}

/** Wall-clock parts of an instant in APP_TZ. */
export function utcToZoned(at: Date): { dateStr: string; minutes: number; weekday: number } {
  const parts = ZONED_FMT.formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    weekday,
  };
}

/** JS weekday (0 = Sunday) of a "YYYY-MM-DD" date in APP_TZ. */
export function weekdayOf(dateStr: string): number {
  return utcToZoned(zonedToUtc(dateStr, "12:00")).weekday;
}

export type BookedInterval = { starts_at: string; duration: number };

/**
 * Start times ("HH:MM") a guest may book on `dateStr` for a `durationMinutes`
 * session, given the mentor's weekly blocks and already-booked intervals.
 * Slots that start before `now` are dropped.
 */
export function computeSlots(opts: {
  dateStr: string;
  durationMinutes: number;
  blocks: AvailabilityBlock[];
  booked: BookedInterval[];
  now?: Date;
}): string[] {
  const { dateStr, durationMinutes, blocks, booked } = opts;
  const now = opts.now ?? new Date();
  const weekday = weekdayOf(dateStr);

  const busy = booked.map((b) => {
    const s = new Date(b.starts_at).getTime();
    return [s, s + b.duration * 60_000] as const;
  });

  const out = new Set<string>();
  for (const block of blocks) {
    if (!block.days.includes(weekday)) continue;
    const start = timeToMinutes(block.start_time);
    const end = timeToMinutes(block.end_time);
    for (let t = start; t + durationMinutes <= end; t += SLOT_STEP_MINUTES) {
      const time = minutesToTime(t);
      const startsAt = zonedToUtc(dateStr, time).getTime();
      if (startsAt <= now.getTime()) continue;
      const endsAt = startsAt + durationMinutes * 60_000;
      const clash = busy.some(([bs, be]) => startsAt < be && endsAt > bs);
      if (!clash) out.add(time);
    }
  }
  return [...out].sort();
}

/** True when a wall-clock start on `dateStr` at `time` sits inside a block and does not clash. */
export function isSlotBookable(opts: {
  dateStr: string; time: string; durationMinutes: number;
  blocks: AvailabilityBlock[]; booked: BookedInterval[]; now?: Date;
}): boolean {
  return computeSlots(opts).includes(opts.time);
}

/** Day-string helper for a Date in APP_TZ ("YYYY-MM-DD"). */
export function dateStrOf(d: Date): string {
  return utcToZoned(d).dateStr;
}
