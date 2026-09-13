// Public read layer for the booking funnel.
// Server-side only (uses the cookie-aware server client, which runs as anon
// for visitors). Everything here reads views/tables that the migration
// 20260914000000_demo_public_read.sql exposes to `anon`.
import { createClient } from "@/lib/supabase/server";
// Taxonomy lives in the client-safe lib/taxonomy.ts; re-exported here so
// server code has one import. Client components must import from taxonomy.
export type { Categoria, ProfileArea } from "@/lib/taxonomy";
export { categorias, AREA_LABEL, CATEGORIA_AREA } from "@/lib/taxonomy";
import type { Categoria, ProfileArea } from "@/lib/taxonomy";
import { AREA_LABEL } from "@/lib/taxonomy";

/** Durations the `sessions.duration` CHECK constraint accepts. */
export const ALLOWED_DURATIONS = [30, 45, 60] as const;
export type Duration = (typeof ALLOWED_DURATIONS)[number];

export type Offer = {
  id: string | null;          // session_types.id, or null when derived from hourly_price
  label: string | null;
  durationMinutes: Duration;
  priceCents: number;
};

export type SocialLink = { platform: string; url: string; sort_order: number };

export type Creator = {
  id: string;
  slug: string;               // profiles.username
  name: string;               // "First Last"
  firstName: string;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  area: ProfileArea | null;
  category: Categoria | null;
  offers: Offer[];            // sorted by duration asc; never contains 15-min offers
  rating: number | null;      // avg of public reviews, 1 decimal
  reviewCount: number;
  socialLinks: SocialLink[];
};

export type CreatorReview = {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  reviewerName: string | null; // null when anonymous
  reviewerPhotoUrl: string | null;
};

export type AvailabilityBlock = {
  start_time: string;  // "HH:MM:SS" as Postgres returns `time`
  end_time: string;
  days: number[];      // 0 = Sunday … 6 = Saturday (JS getDay convention)
};

type CreatorRow = {
  id: string;
  username: string | null;
  name: string | null;
  last_name: string | null;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  area: ProfileArea | null;
  hourly_price: number | null;
};

type SessionTypeRow = {
  id: string;
  host_id: string;
  label: string | null;
  duration_minutes: number;
  price_brl: number;   // cents, despite the name
};

function isAllowedDuration(n: number): n is Duration {
  return (ALLOWED_DURATIONS as readonly number[]).includes(n);
}

/** Offers = active session_types; else derived from hourly_price; else []. */
export function buildOffers(sessionTypes: SessionTypeRow[], hourlyPriceCents: number | null): Offer[] {
  const fromTypes = sessionTypes
    .filter((st) => isAllowedDuration(st.duration_minutes))
    .map<Offer>((st) => ({
      id: st.id,
      label: st.label,
      durationMinutes: st.duration_minutes as Duration,
      priceCents: st.price_brl,
    }));
  if (fromTypes.length > 0) {
    return fromTypes.sort((a, b) => a.durationMinutes - b.durationMinutes);
  }
  if (hourlyPriceCents && hourlyPriceCents > 0) {
    return ALLOWED_DURATIONS.map<Offer>((d) => ({
      id: null,
      label: null,
      durationMinutes: d,
      priceCents: Math.round((hourlyPriceCents * d) / 60),
    }));
  }
  return [];
}

function toCreator(
  row: CreatorRow,
  sessionTypes: SessionTypeRow[],
  socialLinks: SocialLink[],
  ratingAgg: { avg: number | null; count: number },
): Creator {
  const name = [row.name, row.last_name].filter(Boolean).join(" ") || (row.username ?? "");
  return {
    id: row.id,
    slug: row.username ?? "",
    name,
    firstName: row.name ?? name.split(" ")[0] ?? "",
    headline: row.headline,
    bio: row.bio,
    photoUrl: row.photo_url,
    area: row.area,
    category: row.area ? AREA_LABEL[row.area] ?? null : null,
    offers: buildOffers(sessionTypes, row.hourly_price),
    rating: ratingAgg.avg,
    reviewCount: ratingAgg.count,
    socialLinks,
  };
}

async function ratingAggregates(mentorIds: string[]): Promise<Map<string, { avg: number | null; count: number }>> {
  const map = new Map<string, { avg: number | null; count: number }>();
  if (mentorIds.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews_public")
    .select("mentor_id, rating")
    .in("mentor_id", mentorIds);
  const sums = new Map<string, { sum: number; count: number }>();
  for (const r of (data ?? []) as { mentor_id: string; rating: number }[]) {
    const cur = sums.get(r.mentor_id) ?? { sum: 0, count: 0 };
    cur.sum += r.rating; cur.count += 1;
    sums.set(r.mentor_id, cur);
  }
  for (const id of mentorIds) {
    const s = sums.get(id);
    map.set(id, s ? { avg: Math.round((s.sum / s.count) * 10) / 10, count: s.count } : { avg: null, count: 0 });
  }
  return map;
}

/** Every activated creator, for /explorar. Creators without offers are still listed. */
export async function listCreators(): Promise<Creator[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("creators_public")
    .select("id, username, name, last_name, headline, bio, photo_url, area, hourly_price")
    .order("name");
  const creators = (rows ?? []) as CreatorRow[];
  if (creators.length === 0) return [];

  const ids = creators.map((c) => c.id);
  const [{ data: types }, agg] = await Promise.all([
    supabase
      .from("session_types")
      .select("id, host_id, label, duration_minutes, price_brl")
      .in("host_id", ids)
      .eq("active", true),
    ratingAggregates(ids),
  ]);
  const typesByHost = new Map<string, SessionTypeRow[]>();
  for (const t of (types ?? []) as SessionTypeRow[]) {
    const list = typesByHost.get(t.host_id) ?? [];
    list.push(t); typesByHost.set(t.host_id, list);
  }
  return creators.map((c) =>
    toCreator(c, typesByHost.get(c.id) ?? [], [], agg.get(c.id) ?? { avg: null, count: 0 }),
  );
}

/** One creator by username, with offers, social links and rating. Null if not activated. */
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("creators_public")
    .select("id, username, name, last_name, headline, bio, photo_url, area, hourly_price")
    .eq("username", slug)
    .maybeSingle();
  if (!row) return null;
  const c = row as CreatorRow;
  const [{ data: types }, { data: links }, agg] = await Promise.all([
    supabase
      .from("session_types")
      .select("id, host_id, label, duration_minutes, price_brl")
      .eq("host_id", c.id)
      .eq("active", true),
    supabase
      .from("social_links")
      .select("platform, url, sort_order")
      .eq("profile_id", c.id)
      .order("sort_order"),
    ratingAggregates([c.id]),
  ]);
  return toCreator(
    c,
    (types ?? []) as SessionTypeRow[],
    (links ?? []) as SocialLink[],
    agg.get(c.id) ?? { avg: null, count: 0 },
  );
}

/** Public reviews of a mentor, newest first. */
export async function getCreatorReviews(mentorId: string, limit = 20): Promise<CreatorReview[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews_public")
    .select("id, rating, text, created_at, reviewer_name, reviewer_photo_url")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as {
    id: string; rating: number; text: string | null; created_at: string;
    reviewer_name: string | null; reviewer_photo_url: string | null;
  }[]).map((r) => ({
    id: r.id, rating: r.rating, text: r.text, createdAt: r.created_at,
    reviewerName: r.reviewer_name, reviewerPhotoUrl: r.reviewer_photo_url,
  }));
}

/** Weekly availability blocks of a creator (public for activated creators). */
export async function getAvailability(profileId: string): Promise<AvailabilityBlock[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_blocks")
    .select("start_time, end_time, days")
    .eq("profile_id", profileId)
    .order("start_time");
  return (data ?? []) as AvailabilityBlock[];
}

/** Occupied intervals of a mentor between two instants (via SECURITY DEFINER rpc). */
export async function getBookedSlots(
  mentorId: string, from: Date, to: Date,
): Promise<{ starts_at: string; duration: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("booked_slots", {
    p_mentor_id: mentorId,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  return (data ?? []) as { starts_at: string; duration: number }[];
}

// ── Session counterparties ───────────────────────────────────────────────────
// profiles has no counterparty row policy (it would expose email/pix_key), so
// pages that show "the other person" of a session read this column-limited
// view instead of embedding profiles through the FK.
export type Participant = {
  id: string;
  name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  area: ProfileArea | null;
  headline: string | null;
};

/** Profiles of session counterparties, keyed by id. Works with the cookie client (authenticated). */
export async function getParticipants(ids: string[]): Promise<Map<string, Participant>> {
  const map = new Map<string, Participant>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("session_participants")
    .select("id, name, last_name, username, photo_url, area, headline")
    .in("id", unique);
  for (const p of (data ?? []) as Participant[]) map.set(p.id, p);
  return map;
}
