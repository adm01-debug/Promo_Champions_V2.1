
-- G6: alerts de queries lentas com dedupe 24h.

CREATE TABLE IF NOT EXISTS public.slow_query_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  query_preview text NOT NULL,
  mean_exec_ms double precision NOT NULL,
  max_exec_ms double precision NOT NULL,
  calls bigint NOT NULL,
  total_exec_ms double precision NOT NULL,
  threshold_mean_ms double precision NOT NULL,
  threshold_min_calls bigint NOT NULL,
  first_detected_at timestamptz NOT NULL DEFAULT now(),
  last_detected_at timestamptz NOT NULL DEFAULT now(),
  detection_count integer NOT NULL DEFAULT 1,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS slow_query_alerts_active_uk
  ON public.slow_query_alerts (query_hash)
  WHERE acknowledged_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_slow_query_alerts_last_detected
  ON public.slow_query_alerts (last_detected_at DESC);

GRANT SELECT, UPDATE ON public.slow_query_alerts TO authenticated;
GRANT ALL ON public.slow_query_alerts TO service_role;

ALTER TABLE public.slow_query_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view slow query alerts"
  ON public.slow_query_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins ack slow query alerts"
  ON public.slow_query_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Detector: roda no cron; SECURITY DEFINER p/ ler pg_stat_statements.
CREATE OR REPLACE FUNCTION public.detect_slow_queries(
  _mean_ms double precision DEFAULT 500,
  _min_calls bigint DEFAULT 100
)
RETURNS TABLE(inserted integer, updated integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  ins integer := 0;
  upd integer := 0;
  r record;
  h text;
BEGIN
  FOR r IN
    SELECT
      left(pss.query, 500) AS query_text,
      pss.calls,
      pss.total_exec_time,
      pss.mean_exec_time,
      pss.max_exec_time
    FROM extensions.pg_stat_statements pss
    JOIN pg_database d ON d.oid = pss.dbid AND d.datname = current_database()
    WHERE pss.mean_exec_time >= _mean_ms
      AND pss.calls >= _min_calls
      AND pss.query !~* '^(SET |BEGIN|COMMIT|ROLLBACK|SHOW |DEALLOCATE|DISCARD|VACUUM|ANALYZE|LISTEN|NOTIFY)'
      AND pss.query NOT ILIKE '%pg_stat_statements%'
      AND pss.query NOT ILIKE '%pg_catalog.%'
    ORDER BY pss.mean_exec_time DESC
    LIMIT 50
  LOOP
    h := encode(digest(r.query_text, 'sha1'), 'hex');

    INSERT INTO public.slow_query_alerts(
      query_hash, query_preview, mean_exec_ms, max_exec_ms,
      calls, total_exec_ms, threshold_mean_ms, threshold_min_calls
    )
    VALUES (h, r.query_text, r.mean_exec_time, r.max_exec_time,
            r.calls, r.total_exec_time, _mean_ms, _min_calls)
    ON CONFLICT (query_hash) WHERE acknowledged_at IS NULL
    DO UPDATE SET
      last_detected_at = now(),
      detection_count = public.slow_query_alerts.detection_count + 1,
      mean_exec_ms = EXCLUDED.mean_exec_ms,
      max_exec_ms = EXCLUDED.max_exec_ms,
      calls = EXCLUDED.calls,
      total_exec_ms = EXCLUDED.total_exec_ms;

    IF FOUND THEN
      IF (SELECT detection_count = 1 FROM public.slow_query_alerts WHERE query_hash = h AND acknowledged_at IS NULL) THEN
        ins := ins + 1;
      ELSE
        upd := upd + 1;
      END IF;
    END IF;
  END LOOP;

  INSERT INTO public.maintenance_log(job_name, status, completed_at, rows_affected, metadata)
  VALUES ('detect_slow_queries', 'completed', now(), ins + upd,
          jsonb_build_object('inserted', ins, 'updated', upd,
                             'threshold_mean_ms', _mean_ms,
                             'threshold_min_calls', _min_calls));

  inserted := ins;
  updated := upd;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_slow_queries(double precision, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_slow_queries(double precision, bigint) TO service_role;

COMMENT ON TABLE public.slow_query_alerts IS
  'G6: consultas SQL detectadas como lentas. Dedupe por query_hash enquanto não reconhecidas.';
