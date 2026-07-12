
CREATE OR REPLACE FUNCTION public.fn_gc_call_recording_ingest_jobs()
RETURNS TABLE(deleted_succeeded int, deleted_dead_letter int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.fn_gc_call_recording_ingest_jobs() FROM public;
GRANT EXECUTE ON FUNCTION public.fn_gc_call_recording_ingest_jobs() TO service_role;

-- Agenda cron diário 03:15 UTC (00:15 BRT), somente se pg_cron disponível.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('gc-call-recording-ingest-jobs')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gc-call-recording-ingest-jobs');
    PERFORM cron.schedule(
      'gc-call-recording-ingest-jobs',
      '15 3 * * *',
      $cron$ SELECT public.fn_gc_call_recording_ingest_jobs(); $cron$
    );
  END IF;
END $$;
