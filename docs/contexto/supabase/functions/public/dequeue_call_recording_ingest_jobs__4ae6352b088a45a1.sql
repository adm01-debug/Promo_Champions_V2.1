CREATE OR REPLACE FUNCTION public.dequeue_call_recording_ingest_jobs(_batch_size integer DEFAULT 10, _worker_id text DEFAULT 'edge-worker'::text)
 RETURNS SETOF call_recording_ingest_jobs
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.call_recording_ingest_jobs j
     SET status     = 'processing',
         attempts   = j.attempts + 1,
         locked_at  = now(),
         locked_by  = _worker_id,
         updated_at = now()
   WHERE j.id IN (
     SELECT id
       FROM public.call_recording_ingest_jobs
      WHERE status IN ('pending','processing')
        AND next_attempt_at <= now()
        AND (locked_at IS NULL OR locked_at < now() - INTERVAL '5 minutes')
      ORDER BY next_attempt_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT _batch_size
   )
  RETURNING *;
END;
$function$
