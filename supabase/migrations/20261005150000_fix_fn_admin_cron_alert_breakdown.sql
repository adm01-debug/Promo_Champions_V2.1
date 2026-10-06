-- Corrige fn_admin_cron_alert_breakdown: a função referenciava a coluna
-- inexistente a.alert_type (cron_failure_alerts usa `status` com valores
-- 'stalled'/'failed'/'running'). Bug latente desde 20260712231828 — plpgsql
-- só valida a coluna em tempo de execução, então toda chamada falhava 42703.
CREATE OR REPLACE FUNCTION public.fn_admin_cron_alert_breakdown()
 RETURNS TABLE(jobname text, alerts integer, stalled integer, failed integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(a.jobname, 'unknown') AS jobname,
    COUNT(*)::int AS alerts,
    COUNT(*) FILTER (WHERE a.status = 'stalled')::int AS stalled,
    COUNT(*) FILTER (WHERE a.status = 'failed')::int AS failed
  FROM public.cron_failure_alerts a
  WHERE a.created_at >= now() - interval '24 hours'
  GROUP BY COALESCE(a.jobname, 'unknown')
  ORDER BY alerts DESC
  LIMIT 20;
END;
$function$;
