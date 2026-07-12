
CREATE OR REPLACE FUNCTION public.fn_cron_expected_interval(_schedule TEXT)
RETURNS INTERVAL LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _schedule LIKE '*/5 * * * *'  THEN interval '5 minutes'
    WHEN _schedule LIKE '*/10 * * * *' THEN interval '10 minutes'
    WHEN _schedule LIKE '*/15 * * * *' THEN interval '15 minutes'
    WHEN _schedule LIKE '*/30 * * * *' THEN interval '30 minutes'
    WHEN _schedule ~ '^[0-9]+ \* \* \* \*$'         THEN interval '1 hour'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* \*$'     THEN interval '1 day'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* [0-9]$'  THEN interval '7 days'
    ELSE interval '1 day'
  END;
$$;

CREATE OR REPLACE FUNCTION public.fn_cron_stalled_threshold(_schedule TEXT)
RETURNS INTERVAL LANGUAGE sql IMMUTABLE AS $$
  SELECT GREATEST(
    interval '30 minutes',
    LEAST(interval '25 hours', public.fn_cron_expected_interval(_schedule) * 2)
  );
$$;

GRANT EXECUTE ON FUNCTION public.fn_cron_expected_interval(TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_cron_stalled_threshold(TEXT) TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION public.detect_stalled_cron_jobs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, cron AS $$
DECLARE
  v_alerts_created INTEGER := 0;
  v_job RECORD;
  v_last_run TIMESTAMPTZ;
  v_expected_interval INTERVAL;
  v_threshold INTERVAL;
  v_gap INTERVAL;
BEGIN
  FOR v_job IN
    SELECT jobid, jobname, schedule FROM cron.job
    WHERE active = true
      AND jobname NOT IN ('cron-failure-alerter-10min', 'detect-stalled-cron-15min')
  LOOP
    v_expected_interval := public.fn_cron_expected_interval(v_job.schedule);
    v_threshold         := public.fn_cron_stalled_threshold(v_job.schedule);

    SELECT MAX(start_time) INTO v_last_run FROM cron.job_run_details WHERE jobid = v_job.jobid;
    IF v_last_run IS NULL THEN v_last_run := now() - interval '30 days'; END IF;
    v_gap := now() - v_last_run;

    IF v_gap > v_threshold THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.cron_failure_alerts
        WHERE jobid = v_job.jobid AND status = 'stalled' AND alerted_at > now() - interval '6 hours'
      ) THEN
        INSERT INTO public.cron_failure_alerts (
          jobid, jobname, start_time, status, return_message, alerted_at, notified_admin_count
        ) VALUES (
          v_job.jobid, v_job.jobname, v_last_run, 'stalled',
          format('Job %s não executa há %s (esperado a cada %s, threshold %s).',
                 v_job.jobname, v_gap::text, v_expected_interval::text, v_threshold::text),
          now(), 0
        );
        v_alerts_created := v_alerts_created + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN v_alerts_created;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_test_simulate_stalled_check(
  _jobid BIGINT, _jobname TEXT, _schedule TEXT, _last_run TIMESTAMPTZ
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_expected_interval INTERVAL;
  v_threshold INTERVAL;
  v_gap INTERVAL;
  v_alert_created BOOLEAN := false;
  v_skipped_reason TEXT := NULL;
BEGIN
  IF _jobid >= 0 THEN
    RAISE EXCEPTION 'fn_test_simulate_stalled_check requires negative synthetic jobid';
  END IF;
  v_expected_interval := public.fn_cron_expected_interval(_schedule);
  v_threshold         := public.fn_cron_stalled_threshold(_schedule);
  v_gap               := now() - _last_run;

  IF v_gap <= v_threshold THEN
    v_skipped_reason := 'gap_below_threshold';
  ELSIF EXISTS (
    SELECT 1 FROM public.cron_failure_alerts
    WHERE jobid = _jobid AND status = 'stalled' AND alerted_at > now() - interval '6 hours'
  ) THEN
    v_skipped_reason := 'deduped_within_6h';
  ELSE
    INSERT INTO public.cron_failure_alerts (
      jobid, jobname, start_time, status, return_message, alerted_at, notified_admin_count
    ) VALUES (
      _jobid, _jobname, _last_run, 'stalled',
      format('SIMULATED %s gap=%s threshold=%s', _jobname, v_gap::text, v_threshold::text),
      now(), 0
    );
    v_alert_created := true;
  END IF;

  RETURN jsonb_build_object(
    'alert_created', v_alert_created,
    'skipped_reason', v_skipped_reason,
    'expected_interval', v_expected_interval::text,
    'threshold', v_threshold::text,
    'gap', v_gap::text
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_test_cleanup_cron_alerts(_jobid BIGINT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
  IF _jobid >= 0 THEN RAISE EXCEPTION 'requires negative synthetic jobid'; END IF;
  DELETE FROM public.cron_failure_alerts WHERE jobid = _jobid;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END; $$;

CREATE OR REPLACE FUNCTION public.fn_test_backdate_cron_alert(_jobid BIGINT, _hours NUMERIC)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_updated INTEGER;
BEGIN
  IF _jobid >= 0 THEN RAISE EXCEPTION 'requires negative synthetic jobid'; END IF;
  UPDATE public.cron_failure_alerts
  SET alerted_at = now() - make_interval(mins => (_hours * 60)::int)
  WHERE jobid = _jobid;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END; $$;

GRANT EXECUTE ON FUNCTION public.fn_test_simulate_stalled_check(BIGINT, TEXT, TEXT, TIMESTAMPTZ) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_test_cleanup_cron_alerts(BIGINT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_test_backdate_cron_alert(BIGINT, NUMERIC) TO authenticated, anon, service_role;
