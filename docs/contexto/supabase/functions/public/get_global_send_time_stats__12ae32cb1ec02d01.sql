CREATE OR REPLACE FUNCTION public.get_global_send_time_stats()
 RETURNS TABLE(best_hour integer, best_dow integer, sample_size bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH opens AS (
    SELECT EXTRACT(HOUR FROM tracked_at AT TIME ZONE 'America/Sao_Paulo')::int AS h,
           EXTRACT(DOW FROM tracked_at AT TIME ZONE 'America/Sao_Paulo')::int AS d
    FROM public.email_tracking_events
    WHERE event_type IN ('open','opened') AND tracked_at > now() - interval '90 days'
  ),
  hour_agg AS (SELECT h, COUNT(*) c FROM opens GROUP BY h ORDER BY COUNT(*) DESC LIMIT 1),
  dow_agg AS (SELECT d, COUNT(*) c FROM opens GROUP BY d ORDER BY COUNT(*) DESC LIMIT 1)
  SELECT COALESCE((SELECT h FROM hour_agg), 10)::int,
         COALESCE((SELECT d FROM dow_agg), 2)::int,
         (SELECT COUNT(*) FROM opens)::bigint;
$function$
