// GET /api/creators/[slug]/slots?date=YYYY-MM-DD&duration=30|45|60
// Public. Returns the bookable start times (APP_TZ wall-clock) for that day,
// plus the days of the surrounding month that have at least one slot, so the
// calendar can dot them without one request per day.
import { NextRequest, NextResponse } from "next/server";
import { getCreatorBySlug, getAvailability, getBookedSlots, ALLOWED_DURATIONS } from "@/lib/creators";
import { computeSlots, zonedToUtc } from "@/lib/slots";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True only when the components round-trip through a real calendar date. */
function isRealDate(s: string): boolean {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const duration = Number(req.nextUrl.searchParams.get("duration") ?? "60");

  if (!DATE_RE.test(date) || !isRealDate(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (!(ALLOWED_DURATIONS as readonly number[]).includes(duration)) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const creator = await getCreatorBySlug(slug);
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const [y, m] = date.split("-").map(Number);
  const monthStart = zonedToUtc(`${y}-${String(m).padStart(2, "0")}-01`, "00:00");
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const monthEnd = zonedToUtc(nextMonth, "00:00");

  const [blocks, booked] = await Promise.all([
    getAvailability(creator.id),
    getBookedSlots(creator.id, monthStart, monthEnd),
  ]);

  const now = new Date();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const availableDays: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (computeSlots({ dateStr: ds, durationMinutes: duration, blocks, booked, now }).length > 0) {
      availableDays.push(ds);
    }
  }
  const slots = computeSlots({ dateStr: date, durationMinutes: duration, blocks, booked, now });

  return NextResponse.json(
    { date, duration, slots, availableDays, tz: "America/Sao_Paulo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
