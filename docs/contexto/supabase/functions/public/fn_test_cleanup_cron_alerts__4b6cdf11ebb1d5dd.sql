CREATE OR REPLACE FUNCTION public.fn_test_cleanup_cron_alerts(_jobid bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_deleted INTEGER;
BEGIN
  IF _jobid >= 0 THEN RAISE EXCEPTION 'requires negative synthetic jobid'; END IF;
  DELETE FROM public.cron_failure_alerts WHERE jobid = _jobid;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END; $function$
