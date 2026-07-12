
-- 1. Tabela de dedupe de alertas de falha de cron
CREATE TABLE IF NOT EXISTS public.cron_failure_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jobid BIGINT NOT NULL,
  jobname TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  return_message TEXT,
  alerted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_admin_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cron_failure_alerts_unique UNIQUE (jobid, start_time)
);

CREATE INDEX IF NOT EXISTS idx_cron_failure_alerts_alerted_at
  ON public.cron_failure_alerts (alerted_at DESC);

GRANT SELECT ON public.cron_failure_alerts TO authenticated;
GRANT ALL ON public.cron_failure_alerts TO service_role;

ALTER TABLE public.cron_failure_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cron failure alerts"
  ON public.cron_failure_alerts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. RPC: falhas novas (não alertadas) nos últimos N minutos
CREATE OR REPLACE FUNCTION public.fn_admin_get_new_cron_failures(_since_minutes INTEGER DEFAULT 30)
RETURNS TABLE (
  jobid BIGINT,
  jobname TEXT,
  status TEXT,
  return_message TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  RETURN QUERY
  SELECT jrd.jobid,
         j.jobname,
         jrd.status,
         jrd.return_message,
         jrd.start_time,
         jrd.end_time
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

REVOKE ALL ON FUNCTION public.fn_admin_get_new_cron_failures(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_get_new_cron_failures(INTEGER) TO service_role;

-- 3. RPC: marca falha como alertada (chamada pela edge function via service_role)
CREATE OR REPLACE FUNCTION public.fn_admin_mark_cron_failure_alerted(
  _jobid BIGINT,
  _jobname TEXT,
  _start_time TIMESTAMPTZ,
  _status TEXT,
  _return_message TEXT,
  _notified_admin_count INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO public.cron_failure_alerts (
    jobid, jobname, start_time, status, return_message, notified_admin_count
  ) VALUES (
    _jobid, _jobname, _start_time, _status, _return_message, _notified_admin_count
  )
  ON CONFLICT (jobid, start_time) DO UPDATE
    SET notified_admin_count = EXCLUDED.notified_admin_count,
        alerted_at = now()
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_mark_cron_failure_alerted(BIGINT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_mark_cron_failure_alerted(BIGINT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER) TO service_role;
