
CREATE OR REPLACE FUNCTION public.fn_admin_get_new_cron_failures(_since_minutes INTEGER DEFAULT 30)
RETURNS TABLE (
  jobid BIGINT, jobname TEXT, status TEXT, return_message TEXT,
  start_time TIMESTAMPTZ, end_time TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, cron
AS $$
BEGIN
  -- Permite chamadas via service_role (auth.uid IS NULL). Chamadas de usuário
  -- só passam se forem admin. EXECUTE está restrito a service_role via GRANT,
  -- então este check é defesa em profundidade.
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  RETURN QUERY
  SELECT jrd.jobid, j.jobname, jrd.status, jrd.return_message, jrd.start_time, jrd.end_time
  FROM cron.job_run_details jrd
  LEFT JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE jrd.status <> 'succeeded'
    AND jrd.start_time > now() - make_interval(mins => _since_minutes)
    AND NOT EXISTS (
      SELECT 1 FROM public.cron_failure_alerts a
      WHERE a.jobid = jrd.jobid AND a.start_time = jrd.start_time
    )
  ORDER BY jrd.start_time DESC
  LIMIT 200;
END;
$$;
