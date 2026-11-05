CREATE OR REPLACE FUNCTION public.get_recovery_by_failure_type(_days integer DEFAULT 90)
 RETURNS TABLE(failure_type text, failed_total integer, recovered_count integer, still_failing integer, recovery_rate numeric, avg_recovery_minutes numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 90), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  failed AS (
    SELECT public.normalize_bulk_failure_reason(d.last_error_message) AS failure_type,
           d.recovered_at IS NOT NULL AS recovered,
           CASE WHEN d.recovered_at IS NOT NULL AND d.last_error_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (d.recovered_at - d.last_error_at)) / 60 END AS minutes
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
    WHERE d.last_error_message IS NOT NULL
  )
  SELECT f.failure_type,
         count(*)::integer,
         count(*) FILTER (WHERE f.recovered)::integer,
         count(*) FILTER (WHERE NOT f.recovered)::integer,
         round((count(*) FILTER (WHERE f.recovered))::numeric * 100 / count(*), 2),
         COALESCE(round(avg(f.minutes)::numeric, 1), 0)
  FROM failed f
  GROUP BY f.failure_type
  ORDER BY count(*) DESC;
$function$
