-- One pending time-extension request per session, enforced by the database:
-- the request route checks before inserting, but two simultaneous requests
-- (mentor and guest clicking at the same moment) could both pass that check.
-- The route maps the unique violation to the same 409 as the pre-check.

-- Rows written by the previous client could leave several pendings for one
-- session; keep the newest and mark the others declined so the index can be
-- built (a pending request nobody can answer is a declined one).
UPDATE public.time_extensions t
SET status = 'declined'
WHERE t.status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.time_extensions n
    WHERE n.session_id = t.session_id
      AND n.status = 'pending'
      AND (n.created_at > t.created_at OR (n.created_at = t.created_at AND n.id > t.id))
  );

CREATE UNIQUE INDEX IF NOT EXISTS time_extensions_one_pending
  ON public.time_extensions (session_id)
  WHERE status = 'pending';
