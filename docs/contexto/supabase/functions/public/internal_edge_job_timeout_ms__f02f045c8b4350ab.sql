CREATE OR REPLACE FUNCTION public.internal_edge_job_timeout_ms(p_function_name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_function_name
    WHEN 'semantic-reindex-batch' THEN 120000
    WHEN 'process-call-recording-ingest' THEN 60000
    WHEN 'cron-failure-alerter' THEN 60000
    WHEN 'wal-health-alert' THEN 60000
    WHEN 'send-alert-notifications' THEN 60000
    WHEN 'access-denied-alerts' THEN 60000
    ELSE 5000
  END;
$function$
