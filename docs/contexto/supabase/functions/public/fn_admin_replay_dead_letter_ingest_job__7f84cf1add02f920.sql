CREATE OR REPLACE FUNCTION public.fn_admin_replay_dead_letter_ingest_job(_job_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _rows int := 0;
  _locked boolean;
  _role text := auth.role();
  _uid uuid := auth.uid();
BEGIN
  IF _role <> 'service_role' AND NOT public.has_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  -- Advisory lock scoped to this job_id to prevent concurrent replays
  _locked := pg_try_advisory_xact_lock(hashtextextended('dlq_replay:' || _job_id::text, 0));
  IF NOT _locked THEN
    INSERT INTO public.dead_letter_replay_audit(job_id, performed_by, performed_role, outcome)
    VALUES (_job_id, _uid, COALESCE(_role,'unknown'), 'skipped_locked');
    RETURN false;
  END IF;

  WITH candidate AS (
    SELECT id FROM public.call_recording_ingest_jobs
     WHERE id = _job_id AND status = 'dead_letter'
     FOR UPDATE SKIP LOCKED
  )
  UPDATE public.call_recording_ingest_jobs j
     SET status = 'pending',
         attempts = 0,
         last_error = NULL,
         locked_at = NULL,
         locked_by = NULL,
         next_attempt_at = now(),
         updated_at = now()
    FROM candidate c
   WHERE j.id = c.id;

  GET DIAGNOSTICS _rows = ROW_COUNT;

  INSERT INTO public.dead_letter_replay_audit(job_id, performed_by, performed_role, outcome)
  VALUES (_job_id, _uid, COALESCE(_role,'unknown'),
          CASE WHEN _rows > 0 THEN 'replayed' ELSE 'not_found_or_not_dead_letter' END);

  RETURN _rows > 0;
END;
$function$
