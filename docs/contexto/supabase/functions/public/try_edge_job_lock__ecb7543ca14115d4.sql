CREATE OR REPLACE FUNCTION public.try_edge_job_lock(_job_name text, _ttl_seconds integer, _request_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_acquired integer;
BEGIN
  INSERT INTO public.edge_job_locks (job_name, locked_at, request_id)
  VALUES (_job_name, now(), _request_id)
  ON CONFLICT (job_name) DO UPDATE
    SET locked_at = now(),
        request_id = EXCLUDED.request_id
    WHERE edge_job_locks.locked_at < now() - make_interval(secs => _ttl_seconds);
  GET DIAGNOSTICS v_acquired = ROW_COUNT;
  RETURN v_acquired > 0;
END;
$function$
