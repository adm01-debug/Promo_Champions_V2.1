
CREATE OR REPLACE FUNCTION public.fn_test_mark_cron_failure(
  _jobid BIGINT, _jobname TEXT, _start_time TIMESTAMPTZ,
  _status TEXT, _return_message TEXT, _notified_admin_count INTEGER
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END; $$;

GRANT EXECUTE ON FUNCTION public.fn_test_mark_cron_failure(BIGINT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER)
  TO authenticated, anon, service_role;
