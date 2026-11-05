CREATE OR REPLACE FUNCTION public.detect_stalled_cron_jobs()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'cron'
AS $function$
DECLARE
  v_alerts_created integer := 0;
  v_inserted integer;
  v_job record;
  v_last_run timestamptz;
  v_expected_interval interval;
  v_threshold interval;
  v_gap interval;
BEGIN
  FOR v_job IN
    SELECT jobid, jobname, schedule
    FROM cron.job
    WHERE active = true
      AND jobname NOT IN ('cron-failure-alerter-10min', 'detect-stalled-cron-15min')
  LOOP
    v_expected_interval := public.fn_cron_expected_interval(v_job.schedule);
    v_threshold := public.fn_cron_stalled_threshold(v_job.schedule);

    SELECT max(start_time)
      INTO v_last_run
      FROM cron.job_run_details
     WHERE jobid = v_job.jobid;
    IF v_last_run IS NULL THEN
      v_last_run := now() - interval '30 days';
    END IF;
    v_gap := now() - v_last_run;

    IF v_gap > v_threshold
       AND NOT EXISTS (
         SELECT 1
         FROM public.cron_failure_alerts
         WHERE jobid = v_job.jobid
           AND status = 'stalled'
           AND alerted_at > now() - interval '6 hours'
       ) THEN
      INSERT INTO public.cron_failure_alerts (
        jobid, jobname, start_time, status, return_message,
        alerted_at, notified_admin_count
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
      )
      ON CONFLICT (jobid, start_time) DO NOTHING;
      GET DIAGNOSTICS v_inserted = ROW_COUNT;
      v_alerts_created := v_alerts_created + v_inserted;
    END IF;
  END LOOP;

  RETURN v_alerts_created;
END;
$function$
