-- Reparos operacionais do banco canônico.
-- Não remove dados, constraints ou índices existentes.

-- ---------------------------------------------------------------------------
-- 1. Índices para FKs sem índice líder.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_activities_deleted_by_fk
  ON public.activities (deleted_by);
CREATE INDEX IF NOT EXISTS idx_cadence_enrollments_cadence_id_fk
  ON public.cadence_enrollments (cadence_id);
CREATE INDEX IF NOT EXISTS idx_cadence_enrollments_client_id_fk
  ON public.cadence_enrollments (client_id);
CREATE INDEX IF NOT EXISTS idx_client_churn_alerts_state_last_task_id_fk
  ON public.client_churn_alerts_state (last_task_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment_id_fk
  ON public.experiment_assignments (experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_variant_id_fk
  ON public.experiment_assignments (variant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_variants_experiment_id_fk
  ON public.experiment_variants (experiment_id);
CREATE INDEX IF NOT EXISTS idx_products_deleted_by_fk
  ON public.products (deleted_by);
CREATE INDEX IF NOT EXISTS idx_slow_query_alerts_acknowledged_by_fk
  ON public.slow_query_alerts (acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_suppliers_deleted_by_fk
  ON public.suppliers (deleted_by);
CREATE INDEX IF NOT EXISTS idx_teams_deleted_by_fk
  ON public.teams (deleted_by);

-- Os alvos de ON CONFLICT abaixo precisam existir também em bancos que
-- tenham drift no ledger. Se houver dados incompatíveis, a migration falha
-- aqui de forma explícita, antes de instalar jobs que quebrariam em runtime.
CREATE UNIQUE INDEX IF NOT EXISTS slow_query_alerts_active_uk
  ON public.slow_query_alerts (query_hash)
  WHERE acknowledged_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS cron_failure_alerts_unique
  ON public.cron_failure_alerts (jobid, start_time);

-- ---------------------------------------------------------------------------
-- 2. Detecção de queries lentas: pgcrypto está instalado em extensions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.detect_slow_queries(
  _mean_ms double precision DEFAULT 500,
  _min_calls bigint DEFAULT 100
)
RETURNS TABLE(inserted integer, updated integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ins integer := 0;
  upd integer := 0;
  r record;
  h text;
BEGIN
  IF _mean_ms <= 0 OR _min_calls <= 0 THEN
    RAISE EXCEPTION 'thresholds_must_be_positive' USING ERRCODE = '22023';
  END IF;

  FOR r IN
    SELECT
      left(pss.query, 500) AS query_text,
      pss.calls,
      pss.total_exec_time,
      pss.mean_exec_time,
      pss.max_exec_time
    FROM extensions.pg_stat_statements AS pss
    JOIN pg_catalog.pg_database AS d
      ON d.oid = pss.dbid
     AND d.datname = current_database()
    WHERE pss.mean_exec_time >= _mean_ms
      AND pss.calls >= _min_calls
      AND pss.query !~* '^(SET |BEGIN|COMMIT|ROLLBACK|SHOW |DEALLOCATE|DISCARD|VACUUM|ANALYZE|LISTEN|NOTIFY)'
      AND pss.query NOT ILIKE '%pg_stat_statements%'
      AND pss.query NOT ILIKE '%pg_catalog.%'
    ORDER BY pss.mean_exec_time DESC
    LIMIT 50
  LOOP
    h := encode(extensions.digest(r.query_text, 'sha1'), 'hex');

    INSERT INTO public.slow_query_alerts(
      query_hash, query_preview, mean_exec_ms, max_exec_ms,
      calls, total_exec_ms, threshold_mean_ms, threshold_min_calls
    )
    VALUES (
      h, r.query_text, r.mean_exec_time, r.max_exec_time,
      r.calls, r.total_exec_time, _mean_ms, _min_calls
    )
    ON CONFLICT (query_hash) WHERE acknowledged_at IS NULL
    DO UPDATE SET
      last_detected_at = now(),
      detection_count = public.slow_query_alerts.detection_count + 1,
      mean_exec_ms = EXCLUDED.mean_exec_ms,
      max_exec_ms = EXCLUDED.max_exec_ms,
      calls = EXCLUDED.calls,
      total_exec_ms = EXCLUDED.total_exec_ms;

    IF FOUND THEN
      IF (
        SELECT detection_count = 1
        FROM public.slow_query_alerts
        WHERE query_hash = h AND acknowledged_at IS NULL
      ) THEN
        ins := ins + 1;
      ELSE
        upd := upd + 1;
      END IF;
    END IF;
  END LOOP;

  INSERT INTO public.maintenance_log(
    job_name, status, completed_at, rows_affected, metadata
  ) VALUES (
    'detect_slow_queries',
    'completed',
    now(),
    ins + upd,
    jsonb_build_object(
      'inserted', ins,
      'updated', upd,
      'threshold_mean_ms', _mean_ms,
      'threshold_min_calls', _min_calls
    )
  );

  inserted := ins;
  updated := upd;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_slow_queries(double precision, bigint)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_slow_queries(double precision, bigint)
  TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Retenção: desambiguar a OUT variable table_name de information_schema.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_telemetry_retention()
RETURNS TABLE(table_name text, deleted_rows bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wv bigint := 0;
  v_qt bigint := 0;
  v_pa bigint := 0;
BEGIN
  DELETE FROM public.web_vitals_samples
   WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_wv = ROW_COUNT;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables AS ist
    WHERE ist.table_schema = 'public'
      AND ist.table_name = 'query_telemetry'
  ) THEN
    DELETE FROM public.query_telemetry
     WHERE created_at < now() - interval '60 days';
    GET DIAGNOSTICS v_qt = ROW_COUNT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables AS ist
    WHERE ist.table_schema = 'public'
      AND ist.table_name = 'page_analytics'
  ) THEN
    DELETE FROM public.page_analytics
     WHERE created_at < now() - interval '90 days';
    GET DIAGNOSTICS v_pa = ROW_COUNT;
  END IF;

  RETURN QUERY VALUES
    ('web_vitals_samples'::text, v_wv),
    ('query_telemetry'::text, v_qt),
    ('page_analytics'::text, v_pa);
END;
$$;

REVOKE ALL ON FUNCTION public.purge_telemetry_retention()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_telemetry_retention()
  TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Reset semanal: a extensão está no schema extensions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reset_pg_stat_statements_weekly()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM extensions.pg_stat_statements_reset();
END;
$$;

REVOKE ALL ON FUNCTION public.reset_pg_stat_statements_weekly()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_pg_stat_statements_weekly()
  TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Detecção de cron travado: dedupe resistente a concorrência.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.detect_stalled_cron_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_alerts_created integer := 0;
  v_inserted integer;
  v_job record;
  v_last_run timestamptz;
  v_expected_interval interval;
  v_threshold interval;
  v_gap interval;
BEGIN
  FOR v_job IN
    SELECT jobid, jobname, schedule
    FROM cron.job
    WHERE active = true
      AND jobname NOT IN ('cron-failure-alerter-10min', 'detect-stalled-cron-15min')
  LOOP
    v_expected_interval := public.fn_cron_expected_interval(v_job.schedule);
    v_threshold := public.fn_cron_stalled_threshold(v_job.schedule);

    SELECT max(start_time)
      INTO v_last_run
      FROM cron.job_run_details
     WHERE jobid = v_job.jobid;
    IF v_last_run IS NULL THEN
      v_last_run := now() - interval '30 days';
    END IF;
    v_gap := now() - v_last_run;

    IF v_gap > v_threshold
       AND NOT EXISTS (
         SELECT 1
         FROM public.cron_failure_alerts
         WHERE jobid = v_job.jobid
           AND status = 'stalled'
           AND alerted_at > now() - interval '6 hours'
       ) THEN
      INSERT INTO public.cron_failure_alerts (
        jobid, jobname, start_time, status, return_message,
        alerted_at, notified_admin_count
      ) VALUES (
        v_job.jobid,
        v_job.jobname,
        v_last_run,
        'stalled',
        format(
          'Job %s não executa há %s (esperado a cada %s, threshold %s).',
          v_job.jobname,
          v_gap::text,
          v_expected_interval::text,
          v_threshold::text
        ),
        now(),
        0
      )
      ON CONFLICT (jobid, start_time) DO NOTHING;
      GET DIAGNOSTICS v_inserted = ROW_COUNT;
      v_alerts_created := v_alerts_created + v_inserted;
    END IF;
  END LOOP;

  RETURN v_alerts_created;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_stalled_cron_jobs()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_stalled_cron_jobs()
  TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Matchmaking semanal: recria a função ausente, torna o pareamento
--    determinístico por semana e impede duplicação em reexecuções.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_weekly_players()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_players uuid[];
  v_player_a uuid;
  v_player_b uuid;
  v_index integer;
  v_count integer;
  v_week_start date := public.start_of_week(current_date, 1);
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended('match_weekly_players:' || v_week_start::text, 0)
  );

  SELECT array_agg(
           s.id ORDER BY md5(s.id::text || ':' || v_week_start::text), s.id
         )
    INTO v_players
    FROM public.salespeople AS s
   WHERE s.is_active IS TRUE;

  v_count := COALESCE(array_length(v_players, 1), 0);
  IF v_count < 2 THEN
    RETURN;
  END IF;
  IF v_count % 2 <> 0 THEN
    v_count := v_count - 1;
  END IF;

  FOR v_index IN 1..v_count BY 2 LOOP
    v_player_a := v_players[v_index];
    v_player_b := v_players[v_index + 1];

    IF NOT EXISTS (
      SELECT 1
      FROM public.weekly_matchups AS wm
      WHERE wm.week_start = v_week_start
        AND (
          wm.salesperson_a_id IN (v_player_a, v_player_b)
          OR wm.salesperson_b_id IN (v_player_a, v_player_b)
        )
    ) THEN
      INSERT INTO public.weekly_matchups (
        salesperson_a_id, salesperson_b_id, week_start, xp_reward, status
      ) VALUES (
        v_player_a, v_player_b, v_week_start, 250, 'active'
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.match_weekly_players()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_weekly_players()
  TO service_role;

COMMENT ON FUNCTION public.match_weekly_players() IS
  'Pareamento semanal idempotente e serializado; ordenação muda por semana.';
