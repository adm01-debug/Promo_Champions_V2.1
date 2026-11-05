CREATE OR REPLACE FUNCTION public.fn_cron_stalled_threshold(_schedule text)
 RETURNS interval
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT GREATEST(
    interval '30 minutes',
    LEAST(interval '25 hours', public.fn_cron_expected_interval(_schedule) * 2)
  );
$function$
