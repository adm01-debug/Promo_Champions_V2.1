CREATE OR REPLACE FUNCTION public.fn_gc_call_recording_ingest_jobs()
 RETURNS TABLE(deleted_succeeded integer, deleted_dead_letter integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _s int := 0;
  _d int := 0;
BEGIN
  WITH del AS (
    DELETE FROM public.call_recording_ingest_jobs
    WHERE status = 'succeeded' AND updated_at < now() - interval '7 days'
    RETURNING 1
  ) SELECT count(*) INTO _s FROM del;

  WITH del AS (
    DELETE FROM public.call_recording_ingest_jobs
    WHERE status = 'dead_letter' AND updated_at < now() - interval '30 days'
    RETURNING 1
  ) SELECT count(*) INTO _d FROM del;

  RETURN QUERY SELECT _s, _d;
END;
$function$
