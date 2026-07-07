-- Migration: Post-launch additions
-- Extends public.profiles without touching any waitlist columns.
-- Safe to run multiple times (idempotent ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_name              text,
  ADD COLUMN IF NOT EXISTS password_hash          text,
  ADD COLUMN IF NOT EXISTS host_profile_activated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS host_activated_at      timestamptz;

-- Host profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username    text UNIQUE,
  ADD COLUMN IF NOT EXISTS headline    text,
  ADD COLUMN IF NOT EXISTS bio         text,
  ADD COLUMN IF NOT EXISTS photo_url   text,
  ADD COLUMN IF NOT EXISTS pix_key     text,
  ADD COLUMN IF NOT EXISTS onboarding_step text; -- tracks last completed step for resumable flow

-- Session types (host's bookable offerings)
CREATE TABLE IF NOT EXISTS public.session_types (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label            text,
  duration_minutes integer NOT NULL,
  price_brl        integer NOT NULL,
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_types_host_all" ON public.session_types;
CREATE POLICY "session_types_host_all" ON public.session_types
  FOR ALL USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "session_types_public_read" ON public.session_types;
CREATE POLICY "session_types_public_read" ON public.session_types
  FOR SELECT USING (active = true);

-- Weekly availability (JSON per host: { mon: ["09:00","10:00",...], ... })
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS availability_json jsonb;

-- Update the auth user sync trigger to also capture last_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
