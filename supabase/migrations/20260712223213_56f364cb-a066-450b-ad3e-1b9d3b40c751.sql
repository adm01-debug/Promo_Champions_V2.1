
CREATE OR REPLACE FUNCTION public.detect_stalled_cron_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_alerts_created INTEGER := 0;
  v_job RECORD;
  v_last_run TIMESTAMPTZ;
  v_expected_interval INTERVAL;
  v_threshold INTERVAL;
  v_gap INTERVAL;
BEGIN
  FOR v_job IN
    SELECT jobid, jobname, schedule
    FROM cron.job
    WHERE active = true
      AND jobname NOT IN ('cron-failure-alerter-10min', 'detect-stalled-cron-15min')
  LOOP
    -- Estimate expected interval from schedule string (heuristic)
    v_expected_interval := CASE
      WHEN v_job.schedule LIKE '*/5 * * * *' THEN interval '5 minutes'
      WHEN v_job.schedule LIKE '*/10 * * * *' THEN interval '10 minutes'
      WHEN v_job.schedule LIKE '*/15 * * * *' THEN interval '15 minutes'
      WHEN v_job.schedule LIKE '*/30 * * * *' THEN interval '30 minutes'
      WHEN v_job.schedule ~ '^[0-9]+ \* \* \* \*$' THEN interval '1 hour'
      WHEN v_job.schedule ~ '^[0-9]+ [0-9]+ \* \* \*$' THEN interval '1 day'
      WHEN v_job.schedule ~ '^[0-9]+ [0-9]+ \* \* [0-9]$' THEN interval '7 days'
      ELSE interval '1 day'
    END;

    -- Threshold: 2x the expected interval, min 30 min, max 25h
    v_threshold := GREATEST(interval '30 minutes', LEAST(interval '25 hours', v_expected_interval * 2));

    -- Get last run (any status) from cron history
    SELECT MAX(start_time) INTO v_last_run
    FROM cron.job_run_details
    WHERE jobid = v_job.jobid;

    -- If never ran, use a very old timestamp
    IF v_last_run IS NULL THEN
      v_last_run := now() - interval '30 days';
    END IF;

    v_gap := now() - v_last_run;

    IF v_gap > v_threshold THEN
      -- Idempotency: skip if a stalled alert exists for this job in the last 6h
      IF NOT EXISTS (
        SELECT 1 FROM public.cron_failure_alerts
        WHERE jobid = v_job.jobid
          AND status = 'stalled'
          AND alerted_at > now() - interval '6 hours'
      ) THEN
        INSERT INTO public.cron_failure_alerts (
          jobid, jobname, start_time, status, return_message, alerted_at, notified_admin_count
        ) VALUES (
          v_job.jobid,
          v_job.jobname,
          v_last_run,
          'stalled',
          format(
            'Job %s não executa há %s (esperado a cada %s, threshold %s).',
            v_job.jobname,
            v_gap::text,
            v_expected_interval::text,
            v_threshold::text
          ),
          now(),
          0
        );
        v_alerts_created := v_alerts_created + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_alerts_created;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.detect_stalled_cron_jobs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.detect_stalled_cron_jobs() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_stalled_cron_jobs() TO service_role;
