
CREATE OR REPLACE FUNCTION public.fn_admin_list_dead_letter_ingest_jobs(
  _limit int DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  idempotency_key text,
  salesperson_id uuid,
  attempts int,
  last_error text,
  locked_by text,
  created_at timestamptz,
  updated_at timestamptz,
  next_attempt_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT j.id, j.idempotency_key, j.salesperson_id, j.attempts,
         j.last_error, j.locked_by, j.created_at, j.updated_at, j.next_attempt_at
  FROM public.call_recording_ingest_jobs j
  WHERE j.status = 'dead_letter'
  ORDER BY j.updated_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 500));
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_admin_replay_dead_letter_ingest_job(
  _job_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rows int;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  UPDATE public.call_recording_ingest_jobs
     SET status = 'pending',
         attempts = 0,
         last_error = NULL,
         locked_at = NULL,
         locked_by = NULL,
         next_attempt_at = now(),
         updated_at = now()
   WHERE id = _job_id
     AND status = 'dead_letter';

  GET DIAGNOSTICS _rows = ROW_COUNT;
  RETURN _rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_list_dead_letter_ingest_jobs(int) FROM public;
REVOKE ALL ON FUNCTION public.fn_admin_replay_dead_letter_ingest_job(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_admin_list_dead_letter_ingest_jobs(int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_admin_replay_dead_letter_ingest_job(uuid) TO authenticated, service_role;
