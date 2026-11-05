CREATE OR REPLACE FUNCTION public.get_campaign_recovery_rates(_days integer DEFAULT 90)
 RETURNS TABLE(job_id uuid, prompt text, created_at timestamp with time zone, failed_total integer, recovered_count integer, still_failing integer, recovery_rate numeric, avg_recovery_minutes numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 90), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id, j.prompt, j.created_at
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  failed AS (
    SELECT d.job_id,
           d.recovered_at IS NOT NULL AS recovered,
           CASE WHEN d.recovered_at IS NOT NULL AND d.last_error_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (d.recovered_at - d.last_error_at)) / 60 END AS minutes
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
    WHERE d.last_error_message IS NOT NULL
  )
  SELECT jobs.id,
         jobs.prompt,
         jobs.created_at,
         COALESCE(count(f.*), 0)::integer AS failed_total,
         COALESCE(count(f.*) FILTER (WHERE f.recovered), 0)::integer AS recovered_count,
         COALESCE(count(f.*) FILTER (WHERE NOT f.recovered), 0)::integer AS still_failing,
         CASE WHEN count(f.*) > 0
              THEN round((count(f.*) FILTER (WHERE f.recovered))::numeric * 100 / count(f.*), 2)
              ELSE 0 END AS recovery_rate,
         COALESCE(round(avg(f.minutes)::numeric, 1), 0) AS avg_recovery_minutes
  FROM jobs
  LEFT JOIN failed f ON f.job_id = jobs.id
  GROUP BY jobs.id, jobs.prompt, jobs.created_at
  HAVING count(f.*) > 0
  ORDER BY jobs.created_at DESC;
$function$
