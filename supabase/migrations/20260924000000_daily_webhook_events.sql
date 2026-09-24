-- Idempotency ledger for POST /api/webhooks/daily.
-- Daily retries a failed delivery with the same event id; the primary key makes
-- the second insert fail, so an event is applied to a session at most once.
-- A row with completed_at IS NULL is a claim still being processed (or one
-- whose request died); the route takes over such a claim once it is old.
CREATE TABLE IF NOT EXISTS public.daily_webhook_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  room text,
  -- Token of the request currently holding the claim; set on insert and on
  -- takeover, so a request releases only the claim generation it owns.
  owner text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Service-role only: the route writes through the service client and nothing
-- else needs to read this table.
ALTER TABLE public.daily_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: with RLS enabled and no policy, anon/authenticated
-- get nothing; the service role bypasses RLS.
