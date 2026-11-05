CREATE OR REPLACE FUNCTION public.fn_test_simulate_stalled_check(_jobid bigint, _jobname text, _schedule text, _last_run timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
