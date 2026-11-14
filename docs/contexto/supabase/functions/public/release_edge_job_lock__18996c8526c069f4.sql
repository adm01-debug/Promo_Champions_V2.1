CREATE OR REPLACE FUNCTION public.release_edge_job_lock(_job_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.edge_job_locks WHERE job_name = _job_name;
END;
$function$
