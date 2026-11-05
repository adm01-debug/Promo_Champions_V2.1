CREATE OR REPLACE FUNCTION public.fn_list_cron_jobs()
 RETURNS TABLE(jobid bigint, jobname text, schedule text, command text, active boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT j.jobid, j.jobname, j.schedule, j.command, j.active
  FROM cron.job j
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$function$
