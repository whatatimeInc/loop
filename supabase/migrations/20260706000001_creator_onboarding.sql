-- Migration: Creator onboarding schema
-- Tables: social_links, availability_blocks
-- Columns added to profiles: area, onboarding_completed
-- RPCs: check_username_available, save_creator_profile
-- Safe to run multiple times (idempotent).

-- ── Profile area enum ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.profile_area AS ENUM (
    'career_business',
    'lifestyle_fashion',
    'health_wellness',
    'technology',
    'creativity',
    'gastronomy'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Add columns to profiles ──────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS area                public.profile_area,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Ensure username has a unique index (slug check depends on this)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (username)
  WHERE username IS NOT NULL;

-- ── social_links ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform    text NOT NULL,
  url         text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_links_owner" ON public.social_links;
CREATE POLICY "social_links_owner" ON public.social_links
  FOR ALL USING (profile_id = auth.uid());

-- ── availability_blocks ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  days        integer[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availability_blocks_owner" ON public.availability_blocks;
CREATE POLICY "availability_blocks_owner" ON public.availability_blocks
  FOR ALL USING (profile_id = auth.uid());

-- ── Storage bucket ───────────────────────────────────────────────────────────
-- Create the `avatars` bucket via Supabase CLI or dashboard before running:
--   supabase storage create avatars --public
-- Then add this storage RLS policy via the dashboard or:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
--   ON CONFLICT (id) DO NOTHING;

-- ── RPC: check_username_available ────────────────────────────────────────────
-- Returns true if the username is not taken by another user.
-- SECURITY DEFINER bypasses RLS so it can read all profiles.
CREATE OR REPLACE FUNCTION public.check_username_available(p_username text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = p_username
      AND id IS DISTINCT FROM auth.uid()
  );
$$;

-- ── RPC: save_creator_profile ────────────────────────────────────────────────
-- Persists all 4 onboarding steps atomically for the authenticated user.
-- Signature:
--   p_first_name   text
--   p_last_name    text
--   p_slug         text        (goes into `username`)
--   p_avatar_url   text|null
--   p_headline     text
--   p_bio          text
--   p_area         text        (cast to profile_area enum)
--   p_social_links jsonb       array of {platform, url, sort_order}
--   p_availability jsonb       array of {start_time, end_time, days:[int]}
CREATE OR REPLACE FUNCTION public.save_creator_profile(
  p_first_name    text,
  p_last_name     text,
  p_slug          text,
  p_avatar_url    text,
  p_headline      text,
  p_bio           text,
  p_area          text,
  p_social_links  jsonb,
  p_availability  jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_link    jsonb;
  v_block   jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Upsert profile row
  UPDATE public.profiles SET
    name                  = p_first_name,
    last_name             = p_last_name,
    username              = p_slug,
    photo_url             = NULLIF(p_avatar_url, ''),
    headline              = NULLIF(p_headline, ''),
    bio                   = NULLIF(p_bio, ''),
    area                  = CASE WHEN p_area IS NOT NULL AND p_area <> ''
                              THEN p_area::public.profile_area
                              ELSE NULL
                            END,
    host_profile_activated = true,
    onboarding_completed  = true,
    onboarding_step       = 'done'
  WHERE id = v_uid;

  -- Replace social links
  DELETE FROM public.social_links WHERE profile_id = v_uid;
  FOR v_link IN SELECT value FROM jsonb_array_elements(COALESCE(p_social_links, '[]'::jsonb)) LOOP
    INSERT INTO public.social_links (profile_id, platform, url, sort_order)
    VALUES (
      v_uid,
      v_link->>'platform',
      v_link->>'url',
      COALESCE((v_link->>'sort_order')::int, 0)
    );
  END LOOP;

  -- Replace availability blocks
  DELETE FROM public.availability_blocks WHERE profile_id = v_uid;
  FOR v_block IN SELECT value FROM jsonb_array_elements(COALESCE(p_availability, '[]'::jsonb)) LOOP
    INSERT INTO public.availability_blocks (profile_id, start_time, end_time, days)
    VALUES (
      v_uid,
      (v_block->>'start_time')::time,
      (v_block->>'end_time')::time,
      ARRAY(
        SELECT elem::integer
        FROM jsonb_array_elements_text(v_block->'days') AS elem
      )
    );
  END LOOP;
END;
$$;
