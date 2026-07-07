-- Migration: Waitlist schema
-- Extends the public.profiles table (synced from auth.users via trigger).
-- Safe to run multiple times (idempotent).

-- ── Enum ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.waitlist_interest AS ENUM (
    'career_business',
    'health_wellness',
    'creativity_art',
    'fashion_style',
    'home_architecture',
    'gastronomy',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Table ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS waitlist_position  integer,
  ADD COLUMN IF NOT EXISTS waitlist_interest  public.waitlist_interest,
  ADD COLUMN IF NOT EXISTS referral_code      text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invited_at         timestamptz,
  ADD COLUMN IF NOT EXISTS has_password       boolean NOT NULL DEFAULT false;

-- ── Waitlist position sequence ──────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.waitlist_position_seq START 1;

-- ── Trigger: assign sequential position on insert ───────────────────────────
CREATE OR REPLACE FUNCTION public.assign_waitlist_position()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.waitlist_position IS NULL THEN
    NEW.waitlist_position := nextval('public.waitlist_position_seq');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_waitlist_position ON public.profiles;
CREATE TRIGGER trg_assign_waitlist_position
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_waitlist_position();

-- ── Trigger: auto-generate referral_code on insert ──────────────────────────
-- Uses 8 chars of md5(id || random) to ensure uniqueness without a loop.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := substring(
      encode(sha256((NEW.id::text || gen_random_uuid()::text)::bytea), 'hex')
      FROM 1 FOR 8
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- ── Trigger: boost referrer position when a referred user signs up ───────────
-- Rule: -5 positions per referral, floor at position 10.
-- Runs as a background-style AFTER trigger (async from the caller's perspective).
CREATE OR REPLACE FUNCTION public.boost_referrer_position()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.profiles
    SET
      referral_count    = referral_count + 1,
      waitlist_position = GREATEST(10, waitlist_position - 5)
    WHERE id = NEW.referred_by;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_boost_referrer_position ON public.profiles;
CREATE TRIGGER trg_boost_referrer_position
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.boost_referrer_position();

-- ── Trigger: sync new auth.users rows into profiles ─────────────────────────
-- Fires on every new Supabase Auth signup so profiles always has a row.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own row
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role bypasses RLS (default Supabase behavior)
