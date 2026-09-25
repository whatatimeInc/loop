-- DB-1: index the columns the app's queries and RLS policies filter on, and make
-- profiles.email unique regardless of letter case.
--
-- Until now the only explicit indexes were primary keys and two partial ones
-- (sessions_no_overlap covers agendada rows only; time_extensions_one_pending covers
-- pending rows only). sessions_read_participant filters on guest_id OR mentor_id, so
-- every authorization check on sessions was a sequential scan of the whole table.
--
-- Plain CREATE INDEX, not CONCURRENTLY: the Supabase CLI applies each migration file
-- inside a transaction, where CONCURRENTLY is an error. The largest table in
-- production held 125 rows when this was written, so the write lock lasts milliseconds.

CREATE INDEX IF NOT EXISTS sessions_guest_id_idx            ON public.sessions (guest_id);
CREATE INDEX IF NOT EXISTS sessions_mentor_id_idx           ON public.sessions (mentor_id);
CREATE INDEX IF NOT EXISTS sessions_starts_at_idx           ON public.sessions (starts_at);
CREATE INDEX IF NOT EXISTS profiles_email_idx               ON public.profiles (email);
CREATE INDEX IF NOT EXISTS session_types_host_id_idx        ON public.session_types (host_id);
CREATE INDEX IF NOT EXISTS social_links_profile_id_idx      ON public.social_links (profile_id);
CREATE INDEX IF NOT EXISTS availability_blocks_profile_id_idx ON public.availability_blocks (profile_id);
CREATE INDEX IF NOT EXISTS time_extensions_session_id_idx   ON public.time_extensions (session_id);

-- One profile per e-mail, whatever the letter case. profiles_email_idx above still
-- serves the app's .eq("email", …) lookups; this one enforces the rule. Empty
-- strings are left out: app/dashboard/layout.tsx creates a missing profile with
-- email = '' when the auth user has none (phone or anonymous sign-in), and two such
-- users must not block each other.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_key
  ON public.profiles (lower(email)) WHERE email <> '';
