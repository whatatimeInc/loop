-- Migration: public read surface for the booking funnel
-- Visitors (anon) must be able to discover activated creators, their offers,
-- their availability and their public reviews without any change to the
-- self-only RLS on public.profiles (which still guards email, pix_key, etc).
-- Idempotent — safe to run multiple times.

-- ── Grants ──────────────────────────────────────────────────────────────────
-- The earlier migrations never GRANT anything and rely on the platform's
-- default privileges. The Supabase CLI (2.110) applies migrations with those
-- defaults absent, so PostgREST gets "permission denied" on every table.
-- RLS still governs row visibility; these grants only restore the baseline.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
-- anon is read-only and only on tables that carry a public SELECT policy.
GRANT SELECT ON public.session_types, public.availability_blocks, public.social_links, public.reviews TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ── View: creators_public ────────────────────────────────────────────────────
-- Owner-rights view (security_invoker = false) over profiles, exposing only
-- columns that are safe to show on a public creator page.
CREATE OR REPLACE VIEW public.creators_public
WITH (security_invoker = false) AS
  SELECT
    p.id,
    p.username,
    p.name,
    p.last_name,
    p.headline,
    p.bio,
    p.photo_url,
    p.area,
    p.hourly_price,
    p.availability_json,
    p.created_at
  FROM public.profiles p
  WHERE p.host_profile_activated = true
    AND p.username IS NOT NULL;

-- Owner-rights single-table views are auto-updatable: without this REVOKE an
-- anonymous PATCH/DELETE on the view would write through to profiles, bypassing RLS.
REVOKE ALL ON public.creators_public FROM anon, authenticated;
GRANT SELECT ON public.creators_public TO anon, authenticated;

-- ── View: reviews_public ─────────────────────────────────────────────────────
-- Public reviews joined to the mentor they are about. Reviewer name is masked
-- when the review is anonymous.
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = false) AS
  SELECT
    r.id,
    r.session_id,
    s.mentor_id,
    r.rating,
    r.text,
    r.anonymous,
    r.created_at,
    CASE WHEN r.anonymous THEN NULL ELSE rp.name END AS reviewer_name,
    CASE WHEN r.anonymous THEN NULL ELSE rp.photo_url END AS reviewer_photo_url
  FROM public.reviews r
  JOIN public.sessions s ON s.id = r.session_id
  LEFT JOIN public.profiles rp ON rp.id = r.reviewer_id;

REVOKE ALL ON public.reviews_public FROM anon, authenticated;
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- ── availability_blocks: public read for activated creators ─────────────────
DROP POLICY IF EXISTS "availability_blocks_public_read" ON public.availability_blocks;
-- NOTE: the subquery must NOT read public.profiles directly — RLS on profiles
-- applies inside the policy too, and anon sees no profile rows, so EXISTS would
-- always be false. creators_public is an owner-rights view and bypasses that.
CREATE POLICY "availability_blocks_public_read" ON public.availability_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.creators_public c WHERE c.id = profile_id)
  );

-- ── social_links: public read for activated creators ────────────────────────
DROP POLICY IF EXISTS "social_links_public_read" ON public.social_links;
CREATE POLICY "social_links_public_read" ON public.social_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.creators_public c WHERE c.id = profile_id)
  );

-- ── profiles: session counterparties can read each other ────────────────────
-- The mentor dashboard embeds guest:guest_id(name, photo_url) and the guest
-- agenda embeds the mentor. Without this policy those embeds return null.
-- Implemented as a column-limited view rather than a row policy on profiles,
-- so a counterparty never sees email, pix_key, whatsapp or hourly_price.
DROP POLICY IF EXISTS "profiles_counterparty_select" ON public.profiles;
CREATE OR REPLACE VIEW public.session_participants
WITH (security_invoker = false) AS
  SELECT p.id, p.name, p.last_name, p.username, p.photo_url, p.area, p.headline
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE (s.guest_id = auth.uid() AND s.mentor_id = p.id)
       OR (s.mentor_id = auth.uid() AND s.guest_id = p.id)
  );
REVOKE ALL ON public.session_participants FROM anon, authenticated;
GRANT SELECT ON public.session_participants TO authenticated;

-- ── RPC: booked_slots ────────────────────────────────────────────────────────
-- Returns the occupied intervals of a mentor inside a window so the booking
-- calendar can hide them. SECURITY DEFINER because visitors cannot read
-- sessions they are not part of; only start/duration leak, never who booked.
CREATE OR REPLACE FUNCTION public.booked_slots(
  p_mentor_id uuid,
  p_from      timestamptz,
  p_to        timestamptz
)
RETURNS TABLE (starts_at timestamptz, duration integer)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT s.starts_at, s.duration
  FROM public.sessions s
  WHERE s.mentor_id = p_mentor_id
    AND s.status = 'agendada'
    AND s.starts_at >= p_from
    AND s.starts_at <  p_to;
$$;

GRANT EXECUTE ON FUNCTION public.booked_slots(uuid, timestamptz, timestamptz) TO anon, authenticated;

-- ── sessions: no two 'agendada' bookings may overlap for the same mentor ─────
-- The API re-validates the slot before inserting, but check-then-insert is not
-- atomic; this constraint makes the second concurrent insert fail (23P01).
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- timestamptz arithmetic is only STABLE, so the end instant is materialised by a
-- trigger into ends_at and the constraint ranges over two plain columns.
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ends_at timestamptz;

CREATE OR REPLACE FUNCTION public.sessions_set_ends_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.ends_at := NEW.starts_at + make_interval(mins => NEW.duration);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sessions_set_ends_at ON public.sessions;
CREATE TRIGGER trg_sessions_set_ends_at
  BEFORE INSERT OR UPDATE OF starts_at, duration ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.sessions_set_ends_at();
UPDATE public.sessions SET ends_at = starts_at + make_interval(mins => duration) WHERE ends_at IS NULL;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_no_overlap;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_no_overlap
  EXCLUDE USING gist (
    mentor_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'agendada');

-- ── sessions: mentor sees the guest's message ────────────────────────────────
-- (notes already exists; nothing to add — kept here as documentation that the
-- booking flow stores the guest message in sessions.notes.)

-- ── Realtime: the waiting room listens to UPDATEs on sessions ────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  END IF;
END $$;
