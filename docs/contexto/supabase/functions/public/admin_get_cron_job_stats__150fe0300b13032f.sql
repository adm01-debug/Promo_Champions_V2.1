CREATE OR REPLACE FUNCTION public.admin_get_cron_job_stats(_limit integer DEFAULT 50)
 RETURNS TABLE(jobid bigint, jobname text, status text, return_message text, start_time timestamp with time zone, end_time timestamp with time zone, duration_ms integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    d.jobid,
    j.jobname,
    d.status,
    d.return_message,
    d.start_time,
    d.end_time,
    (EXTRACT(EPOCH FROM (d.end_time - d.start_time)) * 1000)::int AS duration_ms
  FROM cron.job_run_details d
  JOIN cron.job j ON j.jobid = d.jobid
  ORDER BY d.start_time DESC
  LIMIT LEAST(GREATEST(_limit, 1), 500);
END;
$function$
