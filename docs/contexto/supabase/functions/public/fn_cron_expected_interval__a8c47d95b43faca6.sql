CREATE OR REPLACE FUNCTION public.fn_cron_expected_interval(_schedule text)
 RETURNS interval
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _schedule LIKE '*/5 * * * *'  THEN interval '5 minutes'
    WHEN _schedule LIKE '*/10 * * * *' THEN interval '10 minutes'
    WHEN _schedule LIKE '*/15 * * * *' THEN interval '15 minutes'
    WHEN _schedule LIKE '*/30 * * * *' THEN interval '30 minutes'
    WHEN _schedule ~ '^[0-9]+ \* \* \* \*$'         THEN interval '1 hour'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* \*$'     THEN interval '1 day'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* [0-9]$'  THEN interval '7 days'
    ELSE interval '1 day'
  END;
$function$
