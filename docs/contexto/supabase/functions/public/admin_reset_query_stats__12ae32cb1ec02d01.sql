CREATE OR REPLACE FUNCTION public.admin_reset_query_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE = '42501';
  END IF;
  PERFORM extensions.pg_stat_statements_reset();
  INSERT INTO public.maintenance_log(job_name, status, completed_at, metadata)
  VALUES ('pg_stat_statements_reset', 'completed', now(),
          jsonb_build_object('reset_by', auth.uid()));
END;
$function$
