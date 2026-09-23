// POST /api/sessions
// Creates a session in the DB, provisions a Daily.co room and e-mails the guest
// a confirmation with the room link and a calendar invite.
// Called by BookingFlow at confirmation time.
//
// Body: { mentor_id, starts_at (ISO), duration (30|45|60), notes? }
// The PRICE IS NEVER TAKEN FROM THE CLIENT: it is resolved server-side from the
// mentor's active session_types (or hourly_price), and the slot is re-validated
// against the mentor's availability and existing bookings.
import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createDailyRoom } from "@/lib/daily";
import { buildOffers } from "@/lib/creators";
import { computeSlots, utcToZoned, minutesToTime, zonedToUtc } from "@/lib/slots";
import {
  buildConfirmationEmail,
  confirmationIdempotencyKey,
  resendConfig,
  siteUrlFrom,
} from "@/lib/confirmation-email";

const Body = z.object({
  mentor_id: z.string().uuid(),
  starts_at: z.string().datetime({ offset: true }),
  duration: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }
  const { mentor_id, starts_at, duration, notes } = parsed.data;
  if (mentor_id === user.id) {
    return NextResponse.json({ error: "You cannot book yourself" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Resolve the mentor and the server-side price ─────────────────────────
  const { data: mentor } = await supabase
    .from("profiles")
    .select("id, hourly_price, host_profile_activated, name, last_name, username")
    .eq("id", mentor_id)
    .maybeSingle();
  if (!mentor || !mentor.host_profile_activated) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }
  const { data: types } = await supabase
    .from("session_types")
    .select("id, host_id, label, duration_minutes, price_brl")
    .eq("host_id", mentor_id)
    .eq("active", true);
  const offer = buildOffers(types ?? [], mentor.hourly_price).find((o) => o.durationMinutes === duration);
  if (!offer) {
    return NextResponse.json({ error: "Mentor does not offer this duration" }, { status: 400 });
  }

  // ── Re-validate the slot against availability + existing bookings ────────
  const startsAt = new Date(starts_at);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "starts_at must be in the future" }, { status: 400 });
  }
  if (startsAt.getUTCSeconds() !== 0 || startsAt.getUTCMilliseconds() !== 0) {
    return NextResponse.json({ error: "starts_at must be on a whole minute" }, { status: 400 });
  }
  const { dateStr, minutes } = utcToZoned(startsAt);
  const time = minutesToTime(minutes);
  // Canonical instant rebuilt from the validated wall-clock slot, so the row can
  // never carry a stray offset the slot check did not see.
  const canonicalStart = zonedToUtc(dateStr, time);
  if (canonicalStart.getTime() !== startsAt.getTime()) {
    return NextResponse.json({ error: "starts_at is not a valid slot instant" }, { status: 400 });
  }
  const [{ data: blocks, error: blocksErr }, { data: booked, error: bookedErr }] = await Promise.all([
    supabase.from("availability_blocks").select("start_time, end_time, days").eq("profile_id", mentor_id),
    supabase
      .from("sessions")
      .select("starts_at, duration")
      .eq("mentor_id", mentor_id)
      .eq("status", "agendada")
      .gte("starts_at", new Date(startsAt.getTime() - 24 * 3600_000).toISOString())
      .lte("starts_at", new Date(startsAt.getTime() + 24 * 3600_000).toISOString()),
  ]);
  // Fail closed: if availability or bookings cannot be read, do not book.
  if (blocksErr || bookedErr) {
    return NextResponse.json({ error: "Could not verify availability" }, { status: 503 });
  }
  const slots = computeSlots({
    dateStr, durationMinutes: duration,
    blocks: (blocks ?? []) as { start_time: string; end_time: string; days: number[] }[],
    booked: (booked ?? []) as { starts_at: string; duration: number }[],
  });
  if (!slots.includes(time)) {
    return NextResponse.json({ error: "Slot is not available" }, { status: 409 });
  }

  // ── Insert ───────────────────────────────────────────────────────────────
  const { data: session, error: insertErr } = await supabase
    .from("sessions")
    .insert({
      guest_id: user.id,
      mentor_id,
      starts_at: canonicalStart.toISOString(),
      duration,
      price: offer.priceCents,
      notes: notes || null,
      status: "agendada",
    })
    .select("id")
    .single();

  if (insertErr || !session) {
    // 23P01 = exclusion_violation from sessions_no_overlap: a concurrent booking
    // won the race between our slot check and this insert.
    if (insertErr?.code === "23P01") {
      return NextResponse.json({ error: "Slot is not available" }, { status: 409 });
    }
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  // ── Confirmation e-mail (best-effort; never delays or fails the booking) ──
  // Everything runs in after(), once the response is sent. The link is the app
  // room page, which mints a Daily token: the raw Daily URL is private and
  // useless on its own.
  const sessionId = session.id as string;
  after(async () => {
    try {
      const mail = resendConfig();
      if (!mail) {
        console.warn("POST /api/sessions: RESEND_API_KEY/RESEND_FROM missing; no confirmation e-mail sent");
        return;
      }
      const guestEmail = user.email?.trim() || null;
      if (!guestEmail) {
        console.warn(`POST /api/sessions: user ${user.id} has no e-mail; no confirmation e-mail sent`);
        return;
      }
      const mentorName =
        [mentor.name, mentor.last_name].filter(Boolean).join(" ") || mentor.username || "seu mentor";
      const rawGuestName = user.user_metadata?.name;
      const guestName = typeof rawGuestName === "string" && rawGuestName.trim() ? rawGuestName.trim() : null;
      const payload = buildConfirmationEmail({
        from: mail.from,
        to: guestEmail,
        guestName,
        session: {
          id: sessionId,
          startsAt: canonicalStart,
          durationMinutes: duration,
          mentorName,
          roomUrl: `${siteUrlFrom()}/sala/${sessionId}`,
        },
      });
      const { data, error } = await new Resend(mail.apiKey).emails.send(payload, {
        idempotencyKey: confirmationIdempotencyKey(sessionId),
      });
      if (error) {
        console.error(`Confirmation e-mail for session ${sessionId} failed:`, error);
        return;
      }
      console.log(`Confirmation e-mail for session ${sessionId} sent: ${data?.id}`);
      // Recorded only after Resend accepted the message, so the confirmation
      // page never claims a send that did not happen.
      // `supabase` is the service-role client (see above): RLS does not apply.
      // A 0-row result would mean the session vanished between insert and now.
      const { data: marked, error: markErr } = await supabase
        .from("sessions")
        .update({ confirmation_sent_to: guestEmail, confirmation_sent_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select("id");
      if (markErr || !marked?.length) {
        console.error(`Could not record confirmation e-mail for session ${sessionId}:`, markErr ?? "0 rows updated");
      }
    } catch (e) {
      console.error(`Confirmation e-mail for session ${sessionId} threw:`, e);
    }
  });

  // ── Daily room (best-effort; the token route copes with a missing room) ──
  const roomExpiry = new Date(startsAt.getTime() + (duration + 90) * 60 * 1000);
  let daily_room_url: string | null = null;
  let daily_room_name: string | null = null;
  let daily_error: string | null = null;
  try {
    const room = await createDailyRoom(session.id, roomExpiry);
    daily_room_url = room.url;
    daily_room_name = room.name;
    await supabase.from("sessions").update({ daily_room_url, daily_room_name }).eq("id", session.id);
  } catch (e) {
    daily_error = e instanceof Error ? e.message : String(e);
    console.error("Daily.co room creation failed:", e);
  }

  return NextResponse.json(
    { id: session.id, price: offer.priceCents, daily_room_url, daily_room_name, daily_error },
    { status: 201 },
  );
}
