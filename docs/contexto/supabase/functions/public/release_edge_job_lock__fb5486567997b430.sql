CREATE OR REPLACE FUNCTION public.release_edge_job_lock(_job_name text, _request_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.edge_job_locks
   WHERE job_name = _job_name
     AND request_id = _request_id;
END;
$function$
