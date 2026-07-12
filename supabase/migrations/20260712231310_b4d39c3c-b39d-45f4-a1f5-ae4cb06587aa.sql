
CREATE OR REPLACE FUNCTION public.fn_admin_cron_alert_metrics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_24h_total       INTEGER;
  v_24h_stalled     INTEGER;
  v_24h_failed      INTEGER;
  v_24h_jobs        INTEGER;
  v_7d_total        INTEGER;
  v_7d_stalled      INTEGER;
  v_7d_jobs         INTEGER;
  v_raw_failures_24h INTEGER;
  v_dedupe_saved_24h INTEGER;
  v_last_alert      TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status='stalled'),
         COUNT(*) FILTER (WHERE status<>'stalled'), COUNT(DISTINCT jobid)
    INTO v_24h_total, v_24h_stalled, v_24h_failed, v_24h_jobs
  FROM public.cron_failure_alerts
  WHERE alerted_at > now() - interval '24 hours';

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status='stalled'), COUNT(DISTINCT jobid)
    INTO v_7d_total, v_7d_stalled, v_7d_jobs
  FROM public.cron_failure_alerts
  WHERE alerted_at > now() - interval '7 days';

  SELECT MAX(alerted_at) INTO v_last_alert FROM public.cron_failure_alerts;

  -- Estimativa de dedupe: falhas brutas do cron nas últimas 24h vs registros alertados.
  BEGIN
    SELECT COUNT(*) INTO v_raw_failures_24h
    FROM cron.job_run_details
    WHERE status <> 'succeeded' AND start_time > now() - interval '24 hours';
  EXCEPTION WHEN OTHERS THEN
    v_raw_failures_24h := NULL;
  END;

  IF v_raw_failures_24h IS NOT NULL THEN
    v_dedupe_saved_24h := GREATEST(0, v_raw_failures_24h - v_24h_total);
  ELSE
    v_dedupe_saved_24h := NULL;
  END IF;

  RETURN jsonb_build_object(
    'last_alert_at',       v_last_alert,
    'window_24h', jsonb_build_object(
      'alerts_total',      v_24h_total,
      'alerts_stalled',    v_24h_stalled,
      'alerts_failed',     v_24h_failed,
      'jobs_affected',     v_24h_jobs,
      'raw_failures',      v_raw_failures_24h,
      'dedupe_saved',      v_dedupe_saved_24h
    ),
    'window_7d', jsonb_build_object(
      'alerts_total',      v_7d_total,
      'alerts_stalled',    v_7d_stalled,
      'jobs_affected',     v_7d_jobs
    ),
    'generated_at',        now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_cron_alert_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_cron_alert_metrics() TO authenticated, service_role;
