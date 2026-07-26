CREATE OR REPLACE FUNCTION public.get_campaign_optout_rates(_days integer DEFAULT 90)
RETURNS TABLE (
  job_id uuid,
  prompt text,
  created_at timestamptz,
  sent_count integer,
  opted_out_count integer,
  opt_out_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 90), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id, j.prompt, j.created_at
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  sent AS (
    SELECT d.job_id,
           lower(btrim(d.recipient_email)) AS email,
           min(d.sent_at) AS sent_at
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
    WHERE d.sent_at IS NOT NULL
      AND d.recipient_email IS NOT NULL
      AND btrim(d.recipient_email) <> ''
    GROUP BY d.job_id, lower(btrim(d.recipient_email))
  ),
  matched AS (
    SELECT s.job_id,
           s.email,
           EXISTS (
             SELECT 1
             FROM public.email_opt_outs o
             WHERE lower(btrim(o.email)) = s.email
               AND o.created_at >= s.sent_at
           ) AS opted_out
    FROM sent s
  )
  SELECT jobs.id,
         jobs.prompt,
         jobs.created_at,
         COALESCE(count(m.email), 0)::integer AS sent_count,
         COALESCE(count(m.email) FILTER (WHERE m.opted_out), 0)::integer AS opted_out_count,
         CASE
           WHEN count(m.email) > 0
             THEN round((count(m.email) FILTER (WHERE m.opted_out))::numeric * 100 / count(m.email), 2)
           ELSE 0
         END AS opt_out_rate
  FROM jobs
  LEFT JOIN matched m ON m.job_id = jobs.id
  GROUP BY jobs.id, jobs.prompt, jobs.created_at
  ORDER BY jobs.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_campaign_optout_rates(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_campaign_optout_rates(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_optout_rates(integer) TO service_role;

CREATE INDEX IF NOT EXISTS idx_email_opt_outs_email_lower_created
  ON public.email_opt_outs (lower(btrim(email)), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_bulk_drafts_sent_email
  ON public.email_bulk_drafts (job_id, lower(btrim(recipient_email)))
  WHERE sent_at IS NOT NULL;