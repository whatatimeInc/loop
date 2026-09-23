-- Records the booking confirmation e-mail once Resend accepts it, so the
-- confirmation page can say "we sent it to X" only when that really happened
-- (and not merely because mail is configured at render time). Written by the
-- service role from POST /api/sessions; participants read it through the
-- existing sessions_read_participant policy.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS confirmation_sent_to text,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
