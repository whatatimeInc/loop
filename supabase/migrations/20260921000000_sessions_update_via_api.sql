-- Session state changes go through the API routes (service role), which
-- enforce the rules a browser client cannot: the guest cancellation
-- deadline, the no-show and end-of-call transitions. The participant UPDATE
-- policy let a signed-in browser set any column, deadline or not, so it is
-- removed. Participants keep SELECT (sessions_read_participant) and the
-- guest keeps INSERT (sessions_guest_insert); the service role bypasses RLS.
DROP POLICY IF EXISTS "sessions_update_participant" ON public.sessions;
