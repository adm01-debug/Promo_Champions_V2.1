
CREATE OR REPLACE FUNCTION public.fn_admin_cron_alert_breakdown()
RETURNS TABLE(jobname text, alerts int, stalled int, failed int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(a.jobname, 'unknown') AS jobname,
    COUNT(*)::int AS alerts,
    COUNT(*) FILTER (WHERE a.alert_type = 'stalled')::int AS stalled,
    COUNT(*) FILTER (WHERE a.alert_type = 'failed')::int AS failed
  FROM public.cron_failure_alerts a
  WHERE a.created_at >= now() - interval '24 hours'
  GROUP BY COALESCE(a.jobname, 'unknown')
  ORDER BY alerts DESC
  LIMIT 20;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_cron_alert_breakdown() FROM public;
GRANT EXECUTE ON FUNCTION public.fn_admin_cron_alert_breakdown() TO authenticated, service_role;
