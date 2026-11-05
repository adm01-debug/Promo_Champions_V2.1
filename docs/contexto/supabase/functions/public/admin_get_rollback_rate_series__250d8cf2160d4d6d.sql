CREATE OR REPLACE FUNCTION public.admin_get_rollback_rate_series(_hours integer DEFAULT 24)
 RETURNS TABLE(captured_at timestamp with time zone, xact_commit bigint, xact_rollback bigint, deadlocks bigint, rollbacks_per_min numeric, commits_per_min numeric, rollback_ratio_pct numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH snap AS (
    SELECT
      s.captured_at,
      s.xact_commit,
      s.xact_rollback,
      s.deadlocks,
      LAG(s.xact_commit)   OVER (ORDER BY s.captured_at) AS prev_commit,
      LAG(s.xact_rollback) OVER (ORDER BY s.captured_at) AS prev_rollback,
      LAG(s.captured_at)   OVER (ORDER BY s.captured_at) AS prev_at
    FROM public.db_rollback_snapshots s
    WHERE s.captured_at > now() - make_interval(hours => GREATEST(_hours, 1))
      AND public.has_role(auth.uid(), 'admin')
  )
  SELECT
    captured_at,
    xact_commit,
    xact_rollback,
    deadlocks,
    CASE
      WHEN prev_at IS NULL OR EXTRACT(EPOCH FROM (captured_at - prev_at)) <= 0 THEN 0::NUMERIC
      WHEN xact_rollback < prev_rollback THEN 0::NUMERIC  -- reset de contador (reboot)
      ELSE round(((xact_rollback - prev_rollback)::NUMERIC * 60.0)
                 / EXTRACT(EPOCH FROM (captured_at - prev_at))::NUMERIC, 2)
    END AS rollbacks_per_min,
    CASE
      WHEN prev_at IS NULL OR EXTRACT(EPOCH FROM (captured_at - prev_at)) <= 0 THEN 0::NUMERIC
      WHEN xact_commit < prev_commit THEN 0::NUMERIC
      ELSE round(((xact_commit - prev_commit)::NUMERIC * 60.0)
                 / EXTRACT(EPOCH FROM (captured_at - prev_at))::NUMERIC, 2)
    END AS commits_per_min,
    CASE
      WHEN prev_at IS NULL OR (xact_commit - COALESCE(prev_commit,0)) + (xact_rollback - COALESCE(prev_rollback,0)) <= 0 THEN 0::NUMERIC
      WHEN xact_rollback < prev_rollback OR xact_commit < prev_commit THEN 0::NUMERIC
      ELSE round(((xact_rollback - prev_rollback)::NUMERIC * 100.0)
                 / NULLIF((xact_commit - prev_commit) + (xact_rollback - prev_rollback), 0), 2)
    END AS rollback_ratio_pct
  FROM snap
  ORDER BY captured_at ASC;
$function$
