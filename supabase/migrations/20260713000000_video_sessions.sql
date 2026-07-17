-- Migration: video session infrastructure
-- Extends sessions table; creates reviews and time_extensions tables.
-- Idempotent — safe to run multiple times.

-- ── Extend sessions ───────────────────────────────────────────────────────────

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS daily_room_name       text,
  ADD COLUMN IF NOT EXISTS session_started_at    timestamptz,
  ADD COLUMN IF NOT EXISTS session_ended_at      timestamptz,
  ADD COLUMN IF NOT EXISTS actual_duration_minutes integer,
  ADD COLUMN IF NOT EXISTS no_show_by            text CHECK (no_show_by IN ('guest', 'mentor'));

-- Extend status enum to cover video session lifecycle
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_status_check;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_status_check
    CHECK (status IN (
      'agendada',       -- booked, awaiting session
      'concluída',      -- completed normally
      'cancelada',      -- cancelled before session
      'mentor_no_show', -- mentor did not join
      'guest_no_show'   -- guest did not join
    ));

-- ── reviews ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        text,
  anonymous   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_read_public"    ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_guest"   ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_own"     ON public.reviews;

CREATE POLICY "reviews_read_public" ON public.reviews
  FOR SELECT USING (NOT anonymous OR reviewer_id = auth.uid());

CREATE POLICY "reviews_insert_guest" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_select_own" ON public.reviews
  FOR SELECT USING (reviewer_id = auth.uid());

-- ── time_extensions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.time_extensions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  requested_by  text        NOT NULL CHECK (requested_by IN ('mentor', 'guest')),
  minutes_added integer     NOT NULL CHECK (minutes_added IN (5, 10, 15)),
  status        text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_extensions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "time_ext_participant" ON public.time_extensions;

CREATE POLICY "time_ext_participant" ON public.time_extensions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
        AND (s.guest_id = auth.uid() OR s.mentor_id = auth.uid())
    )
  );
