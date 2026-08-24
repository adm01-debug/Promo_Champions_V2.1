
-- ─────────────────────────────────────────────────────────────
-- COST-01: Log retention via pg_cron
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.fn_cleanup_stale_logs(_days INTEGER DEFAULT 90)
RETURNS TABLE(table_name TEXT, deleted_rows BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cutoff TIMESTAMPTZ := now() - make_interval(days => _days);
  _tbl TEXT;
  _deleted BIGINT;
  _targets TEXT[] := ARRAY[
    'access_denied_logs',
    'geo_access_logs',
    'rate_limit_logs',
    'email_tracking_events',
    'login_attempts',
    'webhook_inbound_log',
    'error_logs',
    'duplicate_block_logs',
    'mfa_verification_attempts',
    'page_analytics'
  ];
BEGIN
  FOREACH _tbl IN ARRAY _targets LOOP
    BEGIN
      EXECUTE format(
        'WITH d AS (DELETE FROM public.%I WHERE created_at < $1 RETURNING 1) SELECT count(*) FROM d',
        _tbl
      ) INTO _deleted USING _cutoff;
      table_name := _tbl;
      deleted_rows := COALESCE(_deleted, 0);
      RETURN NEXT;
    EXCEPTION WHEN undefined_column OR undefined_table THEN
      CONTINUE;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_cleanup_stale_logs(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cleanup_stale_logs(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.fn_admin_cleanup_stale_logs(_days INTEGER DEFAULT 90)
RETURNS TABLE(table_name TEXT, deleted_rows BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.fn_cleanup_stale_logs(_days);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_cleanup_stale_logs(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_cleanup_stale_logs(INTEGER) TO authenticated;

DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-stale-logs-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-logs-daily');
  PERFORM cron.schedule(
    'cleanup-stale-logs-daily',
    '15 3 * * *',
    $CRON$ SELECT public.fn_cleanup_stale_logs(90); $CRON$
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- QUAL-01: Web Vitals P75 view + admin RPC
-- device_type derivado de viewport_width (mobile <768, tablet <1024, desktop)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_web_vitals_p75
WITH (security_invoker = true) AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COALESCE(NULLIF(route, ''), '/')     AS route,
  CASE
    WHEN viewport_width IS NULL         THEN 'unknown'
    WHEN viewport_width < 768           THEN 'mobile'
    WHEN viewport_width < 1024          THEN 'tablet'
    ELSE 'desktop'
  END                                   AS device_type,
  metric                                AS metric_name,
  COUNT(*)::int                         AS samples,
  percentile_disc(0.50) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p50,
  percentile_disc(0.75) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p75,
  percentile_disc(0.95) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p95,
  CASE metric
    WHEN 'LCP' THEN 2500
    WHEN 'CLS' THEN 0.1
    WHEN 'INP' THEN 200
    WHEN 'FCP' THEN 1800
    WHEN 'TTFB' THEN 800
    ELSE NULL
  END::numeric AS budget_p75
FROM public.web_vitals_samples
WHERE created_at >= (current_date - INTERVAL '30 days')
GROUP BY 1, 2, 3, 4
ORDER BY 1 DESC, 2, 3, 4;

REVOKE ALL ON public.v_web_vitals_p75 FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_web_vitals_p75 TO service_role;

CREATE OR REPLACE FUNCTION public.fn_admin_web_vitals_p75()
RETURNS SETOF public.v_web_vitals_p75
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.v_web_vitals_p75;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_web_vitals_p75() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_web_vitals_p75() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- REL-03: Admin manual reset of a circuit breaker
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_admin_reset_circuit(_circuit_name TEXT, _reason TEXT DEFAULT 'manual_reset')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  IF _circuit_name IS NULL OR length(_circuit_name) = 0 THEN
    RAISE EXCEPTION 'circuit_name required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.circuit_breaker_events (
    circuit_name, event_type, previous_state, new_state, failure_count, details
  ) VALUES (
    _circuit_name,
    'closed',
    'OPEN',
    'CLOSED',
    0,
    jsonb_build_object('reason', _reason, 'actor', auth.uid())
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_reset_circuit(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_reset_circuit(TEXT, TEXT) TO authenticated;
