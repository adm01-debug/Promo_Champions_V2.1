CREATE OR REPLACE FUNCTION public.complete_call_recording_ingest_job(_job_id uuid, _success boolean, _error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  j public.call_recording_ingest_jobs;
  backoff_secs INTEGER;
BEGIN
  SELECT * INTO j FROM public.call_recording_ingest_jobs WHERE id = _job_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'job % not found', _job_id; END IF;

  IF _success THEN
    UPDATE public.call_recording_ingest_jobs
       SET status = 'succeeded', completed_at = now(),
           locked_at = NULL, locked_by = NULL, last_error = NULL, updated_at = now()
     WHERE id = _job_id;
  ELSIF j.attempts >= j.max_attempts THEN
    UPDATE public.call_recording_ingest_jobs
       SET status = 'dead_letter', last_error = COALESCE(_error,'unknown'),
           last_error_at = now(), locked_at = NULL, locked_by = NULL, updated_at = now()
     WHERE id = _job_id;
  ELSE
    backoff_secs := LEAST(3600, POWER(2, j.attempts)::int * 30) + FLOOR(random() * 30)::int;
    UPDATE public.call_recording_ingest_jobs
       SET status = 'pending',
           next_attempt_at = now() + make_interval(secs => backoff_secs),
           last_error = COALESCE(_error,'unknown'), last_error_at = now(),
           locked_at = NULL, locked_by = NULL, updated_at = now()
     WHERE id = _job_id;
  END IF;
END;
$function$
