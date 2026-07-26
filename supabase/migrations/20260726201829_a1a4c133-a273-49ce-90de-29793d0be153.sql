CREATE INDEX IF NOT EXISTS idx_email_bulk_drafts_job_sent_at
  ON public.email_bulk_drafts (job_id, sent_at)
  WHERE sent_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_campaign_delivery_stats(_days integer DEFAULT 30)
RETURNS TABLE(
  job_id uuid,
  prompt text,
  status text,
  created_at timestamp with time zone,
  target_count integer,
  sent_count integer,
  failed_count integer,
  pending_count integer,
  first_sent_at timestamp with time zone,
  last_sent_at timestamp with time zone,
  p50_latency_seconds numeric,
  p95_latency_seconds numeric,
  max_latency_seconds numeric,
  throughput_per_minute numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 30), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id, j.prompt, j.status, j.created_at, j.target_count
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  drafts AS (
    SELECT d.job_id,
           d.sent_at,
           d.error,
           CASE
             WHEN d.sent_at IS NOT NULL
               THEN GREATEST(EXTRACT(EPOCH FROM (d.sent_at - jobs.created_at)), 0)
             ELSE NULL
           END AS latency_seconds
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
  )
  SELECT jobs.id,
         jobs.prompt,
         jobs.status,
         jobs.created_at,
         COALESCE(jobs.target_count, 0)::integer,
         COALESCE(count(d.*) FILTER (WHERE d.sent_at IS NOT NULL), 0)::integer AS sent_count,
         COALESCE(count(d.*) FILTER (WHERE d.error IS NOT NULL AND d.sent_at IS NULL), 0)::integer AS failed_count,
         COALESCE(count(d.*) FILTER (WHERE d.sent_at IS NULL AND d.error IS NULL), 0)::integer AS pending_count,
         min(d.sent_at) AS first_sent_at,
         max(d.sent_at) AS last_sent_at,
         COALESCE(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY d.latency_seconds)::numeric, 2), 0) AS p50_latency_seconds,
         COALESCE(round(percentile_cont(0.95) WITHIN GROUP (ORDER BY d.latency_seconds)::numeric, 2), 0) AS p95_latency_seconds,
         COALESCE(round(max(d.latency_seconds)::numeric, 2), 0) AS max_latency_seconds,
         CASE
           WHEN count(d.*) FILTER (WHERE d.sent_at IS NOT NULL) > 0
            AND EXTRACT(EPOCH FROM (max(d.sent_at) - min(d.sent_at))) >= 1
             THEN round(
               (count(d.*) FILTER (WHERE d.sent_at IS NOT NULL))::numeric * 60
               / EXTRACT(EPOCH FROM (max(d.sent_at) - min(d.sent_at)))::numeric, 2)
           ELSE 0
         END AS throughput_per_minute
  FROM jobs
  LEFT JOIN drafts d ON d.job_id = jobs.id
  GROUP BY jobs.id, jobs.prompt, jobs.status, jobs.created_at, jobs.target_count
  ORDER BY jobs.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.get_campaign_delivery_stats(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_campaign_delivery_stats(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_delivery_stats(integer) TO service_role;