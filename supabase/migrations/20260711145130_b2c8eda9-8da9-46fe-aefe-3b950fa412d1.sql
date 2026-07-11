
CREATE OR REPLACE VIEW public.v_platform_slo
WITH (security_invoker = true) AS
WITH days AS (
  SELECT generate_series(
    (current_date - INTERVAL '29 days')::date,
    current_date,
    '1 day'::interval
  )::date AS day
),
dispatch AS (
  SELECT
    date_trunc('day', wd.created_at)::date AS day,
    COUNT(*) FILTER (WHERE wd.succeeded IS TRUE)  AS sent_ok,
    COUNT(*) FILTER (WHERE wd.succeeded IS FALSE) AS failed
  FROM public.winloss_webhook_deliveries wd
  WHERE wd.created_at >= current_date - INTERVAL '29 days'
  GROUP BY 1
),
v4 AS (
  SELECT
    v.day,
    COALESCE(v.sent_ok, 0)   AS ok,
    COALESCE(v.failed, 0)    AS ko,
    COALESCE(v.exhausted, 0) AS exhausted
  FROM public.v4_callback_metrics v
  WHERE v.day >= current_date - INTERVAL '29 days'
),
circuits AS (
  SELECT
    date_trunc('day', cb.created_at)::date AS day,
    COUNT(*) FILTER (WHERE cb.event_type = 'opened') AS opened,
    COUNT(*) AS total_events
  FROM public.circuit_breaker_events cb
  WHERE cb.created_at >= current_date - INTERVAL '29 days'
  GROUP BY 1
),
errors AS (
  SELECT
    date_trunc('day', el.created_at)::date AS day,
    COUNT(*) FILTER (WHERE el.severity IN ('critical','error','high')) AS critical_errors,
    COUNT(*) AS total_logs
  FROM public.error_logs el
  WHERE el.created_at >= current_date - INTERVAL '29 days'
  GROUP BY 1
)
SELECT
  d.day,
  CASE
    WHEN COALESCE(dp.sent_ok + dp.failed, 0) = 0 THEN NULL
    ELSE dp.sent_ok::numeric / NULLIF(dp.sent_ok + dp.failed, 0)
  END AS webhook_success_ratio,
  0.99::numeric AS webhook_success_target,
  COALESCE(dp.sent_ok, 0) AS webhook_sent_ok,
  COALESCE(dp.failed, 0)  AS webhook_failed,

  CASE
    WHEN COALESCE(v4.ok + v4.ko + v4.exhausted, 0) = 0 THEN NULL
    ELSE v4.ok::numeric / NULLIF(v4.ok + v4.ko + v4.exhausted, 0)
  END AS v4_callback_success_ratio,
  0.99::numeric AS v4_callback_success_target,
  COALESCE(v4.ok, 0)              AS v4_callback_ok,
  COALESCE(v4.ko + v4.exhausted, 0) AS v4_callback_failed,

  CASE
    WHEN COALESCE(c.total_events, 0) = 0 THEN NULL
    ELSE 1 - (c.opened::numeric / NULLIF(c.total_events, 0))
  END AS circuit_stability_ratio,
  0.95::numeric AS circuit_stability_target,
  COALESCE(c.opened, 0)       AS circuits_opened,
  COALESCE(c.total_events, 0) AS circuit_events_total,

  CASE
    WHEN COALESCE(e.total_logs, 0) = 0 THEN NULL
    ELSE 1 - (e.critical_errors::numeric / NULLIF(e.total_logs, 0))
  END AS error_free_ratio,
  0.99::numeric AS error_free_target,
  COALESCE(e.critical_errors, 0) AS critical_error_count,
  COALESCE(e.total_logs, 0)      AS total_log_count
FROM days d
LEFT JOIN dispatch dp ON dp.day = d.day
LEFT JOIN v4          ON v4.day = d.day
LEFT JOIN circuits c  ON c.day  = d.day
LEFT JOIN errors  e   ON e.day  = d.day
ORDER BY d.day DESC;

REVOKE ALL ON public.v_platform_slo FROM PUBLIC;
GRANT SELECT ON public.v_platform_slo TO service_role;

CREATE OR REPLACE FUNCTION public.fn_admin_platform_slo()
RETURNS SETOF public.v_platform_slo
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.v_platform_slo;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_platform_slo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_platform_slo() TO authenticated;
