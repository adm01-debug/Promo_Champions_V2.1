
-- 1. Tabela de snapshots
CREATE TABLE IF NOT EXISTS public.db_rollback_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xact_commit BIGINT NOT NULL,
  xact_rollback BIGINT NOT NULL,
  deadlocks BIGINT NOT NULL DEFAULT 0,
  temp_files BIGINT NOT NULL DEFAULT 0,
  temp_bytes BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_db_rollback_snapshots_captured_at
  ON public.db_rollback_snapshots (captured_at DESC);

GRANT SELECT ON public.db_rollback_snapshots TO authenticated;
GRANT ALL ON public.db_rollback_snapshots TO service_role;

ALTER TABLE public.db_rollback_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rollback snapshots"
  ON public.db_rollback_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Autovacuum agressivo (mesma política dos logs)
ALTER TABLE public.db_rollback_snapshots SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 500,
  autovacuum_analyze_threshold = 500
);

-- 2. RPC: captura snapshot (executada por cron via service_role)
CREATE OR REPLACE FUNCTION public.admin_capture_rollback_snapshot()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  _id UUID;
  _commit BIGINT;
  _rollback BIGINT;
  _deadlocks BIGINT;
  _temp_files BIGINT;
  _temp_bytes BIGINT;
BEGIN
  SELECT xact_commit, xact_rollback, deadlocks, temp_files, temp_bytes
    INTO _commit, _rollback, _deadlocks, _temp_files, _temp_bytes
  FROM pg_stat_database
  WHERE datname = current_database();

  INSERT INTO public.db_rollback_snapshots (
    xact_commit, xact_rollback, deadlocks, temp_files, temp_bytes
  ) VALUES (_commit, _rollback, _deadlocks, _temp_files, _temp_bytes)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_capture_rollback_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_capture_rollback_snapshot() TO service_role;

-- 3. RPC: série temporal com rate/min calculado pela janela entre snapshots
CREATE OR REPLACE FUNCTION public.admin_get_rollback_rate_series(_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  captured_at TIMESTAMPTZ,
  xact_commit BIGINT,
  xact_rollback BIGINT,
  deadlocks BIGINT,
  rollbacks_per_min NUMERIC,
  commits_per_min NUMERIC,
  rollback_ratio_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.admin_get_rollback_rate_series(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_rollback_rate_series(INTEGER) TO authenticated, service_role;

-- 4. Purge automático — mantém apenas 30 dias
CREATE OR REPLACE FUNCTION public.fn_purge_rollback_snapshots()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted INTEGER;
BEGIN
  DELETE FROM public.db_rollback_snapshots WHERE captured_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_purge_rollback_snapshots() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_purge_rollback_snapshots() TO service_role;

-- Captura inicial para termos ao menos 1 baseline
SELECT public.admin_capture_rollback_snapshot();
