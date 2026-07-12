
-- G5: Top queries por custo. Só admin. Filtra schemas internos e mascara text
-- (pg_stat_statements normaliza literais por padrão, mas ainda é sensível).

CREATE OR REPLACE FUNCTION public.admin_top_queries(_limit integer DEFAULT 20)
RETURNS TABLE(
  query text,
  calls bigint,
  total_exec_ms double precision,
  mean_exec_ms double precision,
  max_exec_ms double precision,
  rows_returned bigint,
  hit_ratio numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    left(pss.query, 500) AS query,
    pss.calls,
    round(pss.total_exec_time::numeric, 2)::double precision AS total_exec_ms,
    round(pss.mean_exec_time::numeric, 3)::double precision AS mean_exec_ms,
    round(pss.max_exec_time::numeric, 3)::double precision AS max_exec_ms,
    pss.rows AS rows_returned,
    CASE WHEN (pss.shared_blks_hit + pss.shared_blks_read) > 0
         THEN round(100.0 * pss.shared_blks_hit / (pss.shared_blks_hit + pss.shared_blks_read), 2)
         ELSE NULL END AS hit_ratio
  FROM extensions.pg_stat_statements pss
  JOIN pg_database d ON d.oid = pss.dbid AND d.datname = current_database()
  WHERE pss.query !~* '^(SET |BEGIN|COMMIT|ROLLBACK|SHOW |DEALLOCATE|DISCARD|VACUUM|ANALYZE|LISTEN|NOTIFY)'
    AND pss.query NOT ILIKE '%pg_stat_statements%'
    AND pss.query NOT ILIKE '%pg_catalog.%'
    AND pss.query NOT ILIKE '%information_schema.%'
    AND pss.query NOT ILIKE '%extensions.%'
  ORDER BY pss.total_exec_time DESC
  LIMIT LEAST(GREATEST(_limit, 1), 100);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_top_queries(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_top_queries(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_reset_query_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE = '42501';
  END IF;
  PERFORM extensions.pg_stat_statements_reset();
  INSERT INTO public.maintenance_log(job_name, status, completed_at, metadata)
  VALUES ('pg_stat_statements_reset', 'completed', now(),
          jsonb_build_object('reset_by', auth.uid()));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reset_query_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_query_stats() TO authenticated;
