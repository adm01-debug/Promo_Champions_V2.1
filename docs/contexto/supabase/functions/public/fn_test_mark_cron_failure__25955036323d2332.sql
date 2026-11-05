CREATE OR REPLACE FUNCTION public.fn_test_mark_cron_failure(_jobid bigint, _jobname text, _start_time timestamp with time zone, _status text, _return_message text, _notified_admin_count integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _id UUID;
BEGIN
  IF _jobid >= 0 THEN
    RAISE EXCEPTION 'fn_test_mark_cron_failure requires negative synthetic jobid';
  END IF;
  INSERT INTO public.cron_failure_alerts (
    jobid, jobname, start_time, status, return_message, notified_admin_count
  ) VALUES (_jobid, _jobname, _start_time, _status, _return_message, _notified_admin_count)
  ON CONFLICT (jobid, start_time) DO UPDATE
    SET notified_admin_count = EXCLUDED.notified_admin_count,
        alerted_at = now()
  RETURNING id INTO _id;
  RETURN _id;
END; $function$
