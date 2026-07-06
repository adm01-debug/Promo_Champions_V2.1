CREATE OR REPLACE FUNCTION public.fn_cleanup_webhook_dedupe()
RETURNS TABLE(deleted_count bigint, oldest_kept timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_deleted bigint;
  v_oldest timestamptz;
BEGIN
  WITH deleted AS (
    DELETE FROM public.webhook_inbound_dedupe
    WHERE received_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;

  SELECT min(received_at) INTO v_oldest FROM public.webhook_inbound_dedupe;

  RETURN QUERY SELECT v_deleted, v_oldest;
END;
$$;

CREATE TABLE IF NOT EXISTS public.maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rows_affected BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

GRANT SELECT ON public.maintenance_log TO authenticated;
GRANT ALL ON public.maintenance_log TO service_role;

ALTER TABLE public.maintenance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view maintenance log" ON public.maintenance_log;
CREATE POLICY "Admins can view maintenance log"
ON public.maintenance_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_maintenance_log_job_started
  ON public.maintenance_log (job_name, started_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('cleanup-webhook-dedupe')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-webhook-dedupe');

SELECT cron.schedule(
  'cleanup-webhook-dedupe',
  '0 3 * * 0',
  $$
    WITH result AS (
      SELECT * FROM public.fn_cleanup_webhook_dedupe()
    ),
    log_entry AS (
      INSERT INTO public.maintenance_log (job_name, completed_at, rows_affected, status, metadata)
      SELECT
        'cleanup-webhook-dedupe',
        NOW(),
        deleted_count,
        'completed',
        jsonb_build_object('oldest_kept', oldest_kept, 'ran_at', NOW())
      FROM result
      RETURNING id
    )
    SELECT deleted_count FROM result;
  $$
);