CREATE OR REPLACE FUNCTION public.fn_test_backdate_cron_alert(_jobid bigint, _hours numeric)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_updated INTEGER;
BEGIN
  IF _jobid >= 0 THEN RAISE EXCEPTION 'requires negative synthetic jobid'; END IF;
  UPDATE public.cron_failure_alerts
  SET alerted_at = now() - make_interval(mins => (_hours * 60)::int)
  WHERE jobid = _jobid;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END; $function$
