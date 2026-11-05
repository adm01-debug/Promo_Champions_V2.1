CREATE OR REPLACE FUNCTION public.reset_pg_stat_statements_weekly()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM extensions.pg_stat_statements_reset();
END;
$function$
