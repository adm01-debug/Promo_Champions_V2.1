CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
BEGIN
  IF p_function_name IS NULL OR NOT (
    p_function_name = ANY (ARRAY[
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'deal-risk-digest',
      'email-bulk-retry',
      'wal-health-alert',
      'winloss-webhook-health-monitor',
      'webvitals-regression-alert',
      'sequence-runner',
      'process-cadence-tasks',
      'process-scheduled-sends',
      'check-quote-expiration',
      'check-lead-sla',
      'sdr-consecutive-alerts',
      'activity-goal-alerts',
      'challenge-expiration-alerts',
      'send-alert-notifications',
      'auto-reassign-inactive',
      'access-denied-alerts',
      'scheduled-reports-runner',
      'rotate-daily-challenges',
      'bitrix24-sync',
      'semantic-reindex-batch'
    ]::text[])
  ) THEN
    RAISE EXCEPTION 'internal_edge_job_not_allowed';
  END IF;

  RETURN public.post_internal_edge_job(p_function_name, 1, 3);
END;
$function$
