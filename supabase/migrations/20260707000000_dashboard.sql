-- Migration: Dashboard schema (sessions, roles, pricing, whatsapp)
-- Idempotent — safe to run multiple times.

-- ── New profile columns ───────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_mentor     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hourly_price  integer,   -- em centavos (R$ × 100)
  ADD COLUMN IF NOT EXISTS whatsapp      text;

-- Sync is_mentor from host_profile_activated for existing rows
UPDATE public.profiles
  SET is_mentor = host_profile_activated
  WHERE is_mentor IS DISTINCT FROM host_profile_activated;

-- Trigger: keep is_mentor in sync with host_profile_activated going forward
CREATE OR REPLACE FUNCTION public.sync_is_mentor()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.host_profile_activated IS DISTINCT FROM OLD.host_profile_activated THEN
    NEW.is_mentor := NEW.host_profile_activated;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_is_mentor_trg ON public.profiles;
CREATE TRIGGER sync_is_mentor_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_is_mentor();

-- ── sessions ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at       timestamptz NOT NULL,
  duration        integer     NOT NULL CHECK (duration IN (30, 45, 60)),
  price           integer     NOT NULL,   -- em centavos
  status          text        NOT NULL DEFAULT 'agendada'
                                CHECK (status IN ('agendada', 'concluída', 'cancelada')),
  daily_room_url  text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_read_participant"   ON public.sessions;
DROP POLICY IF EXISTS "sessions_guest_insert"       ON public.sessions;
DROP POLICY IF EXISTS "sessions_update_participant" ON public.sessions;

CREATE POLICY "sessions_read_participant" ON public.sessions
  FOR SELECT USING (guest_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "sessions_guest_insert" ON public.sessions
  FOR INSERT WITH CHECK (guest_id = auth.uid());

CREATE POLICY "sessions_update_participant" ON public.sessions
  FOR UPDATE USING (guest_id = auth.uid() OR mentor_id = auth.uid());
