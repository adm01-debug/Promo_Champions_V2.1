
CREATE OR REPLACE FUNCTION public.admin_get_cron_job_stats(_limit int DEFAULT 50)
RETURNS TABLE (
  jobid bigint,
  jobname text,
  status text,
  return_message text,
  start_time timestamptz,
  end_time timestamptz,
  duration_ms int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, pg_temp
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.admin_get_cron_job_stats(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_cron_job_stats(int) TO authenticated, service_role;
