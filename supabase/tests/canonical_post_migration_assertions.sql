-- Pós-condições executáveis dentro da mesma transação das migrations.
-- Este arquivo não altera estado; qualquer divergência aborta a simulação.
DO $$
DECLARE
  v_count integer;
  v_definition text;
BEGIN
  SELECT count(*)
    INTO v_count
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN (
       'activities_active', 'clients_active', 'tasks_active',
       'v_active_activities', 'v_active_clients', 'v_active_products',
       'v_active_suppliers', 'v_active_teams', 'v_deleted_clients'
     )
     AND c.reloptions @> ARRAY['security_invoker=true'];
  IF v_count <> 9 THEN
    RAISE EXCEPTION 'expected_9_security_invoker_views_got_%', v_count;
  END IF;

  IF has_table_privilege('anon', 'public.activities_active', 'SELECT')
     OR has_table_privilege('anon', 'public.clients_active', 'SELECT')
     OR has_table_privilege('anon', 'public.mv_competitive_ranking', 'SELECT') THEN
    RAISE EXCEPTION 'anon_internal_view_access_still_present';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname IN (
          'Users can view active activities',
          'Users can view active clients',
          'Users can view active products',
          'Users can view active suppliers',
          'Users can view active teams',
          'anon can insert login attempts',
          'anon can read own login attempts',
          'Deny writes to non-service on maintenance_log'
        )
      )
  ) THEN
    RAISE EXCEPTION 'legacy_permissive_policy_still_present';
  END IF;

  IF has_table_privilege('anon', 'public.login_attempts', 'SELECT')
     OR has_table_privilege('anon', 'public.login_attempts', 'INSERT')
     OR has_table_privilege('anon', 'public.maintenance_log', 'DELETE') THEN
    RAISE EXCEPTION 'anon_raw_log_access_still_present';
  END IF;

  IF NOT has_function_privilege(
       'anon', 'public.get_login_lockout_status(text)', 'EXECUTE'
     )
     OR NOT has_function_privilege(
       'anon', 'public.record_failed_login_attempt(text,text,text)', 'EXECUTE'
     )
     OR has_function_privilege(
       'anon', 'public.record_successful_login_attempt(text)', 'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'login_rpc_acl_mismatch';
  END IF;

  IF has_function_privilege(
       'anon', 'public.claim_pending_cadence_tasks(date,integer)', 'EXECUTE'
     )
     OR has_function_privilege(
       'authenticated', 'public.claim_pending_cadence_tasks(date,integer)', 'EXECUTE'
     )
     OR NOT has_function_privilege(
       'service_role', 'public.claim_pending_cadence_tasks(date,integer)', 'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'claim_pending_acl_mismatch';
  END IF;

  IF has_function_privilege(
       'anon', 'public.hard_delete_record(text,uuid,uuid)', 'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated', 'public.hard_delete_record(text,uuid,uuid)', 'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'soft_delete_helper_acl_mismatch';
  END IF;

  IF to_regprocedure('public.spin_prize_wheel(uuid)') IS NULL
     OR to_regprocedure(
       'public.route_unassigned_client_portfolio(uuid,text,uuid,text)'
     ) IS NULL
     OR to_regprocedure(
       'public.reassign_inactive_client_portfolio(uuid,uuid,timestamptz,uuid,integer,text)'
     ) IS NULL THEN
    RAISE EXCEPTION 'pending_business_rpc_missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaign_health_alerts'
      AND column_name = 'dedupe_bucket'
  ) OR NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'prize_wheel_spins'
      AND column_name = 'request_id'
  ) THEN
    RAISE EXCEPTION 'pending_business_column_missing';
  END IF;

  SELECT count(*)
    INTO v_count
    FROM pg_indexes
   WHERE schemaname = 'public'
     AND indexname IN (
       'idx_activities_deleted_by_fk',
       'idx_cadence_enrollments_cadence_id_fk',
       'idx_cadence_enrollments_client_id_fk',
       'idx_client_churn_alerts_state_last_task_id_fk',
       'idx_experiment_assignments_experiment_id_fk',
       'idx_experiment_assignments_variant_id_fk',
       'idx_experiment_variants_experiment_id_fk',
       'idx_products_deleted_by_fk',
       'idx_slow_query_alerts_acknowledged_by_fk',
       'idx_suppliers_deleted_by_fk',
       'idx_teams_deleted_by_fk'
     );
  IF v_count <> 11 THEN
    RAISE EXCEPTION 'expected_11_fk_indexes_got_%', v_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'slow_query_alerts_active_uk'
      AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%(query_hash)%'
      AND indexdef ILIKE '%acknowledged_at IS NULL%'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'cron_failure_alerts_unique'
      AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%(jobid, start_time)%'
  ) THEN
    RAISE EXCEPTION 'cron_conflict_unique_indexes_missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id IN (
      'avatars', 'call-recordings', 'quote-pdfs',
      'report-exports', 'report-snapshots'
    )
      AND (file_size_limit IS NULL OR allowed_mime_types IS NULL)
  ) OR NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'winloss-reports'
      AND public IS FALSE
      AND file_size_limit = 5242880
      AND allowed_mime_types = ARRAY['text/markdown']::text[]
  ) OR NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'call-recordings'
      AND allowed_mime_types @> ARRAY['audio/m4a', 'audio/vnd.wave']::text[]
  ) THEN
    RAISE EXCEPTION 'storage_hardening_incomplete';
  END IF;

  SELECT pg_get_functiondef('public.detect_slow_queries(double precision,bigint)'::regprocedure)
    INTO v_definition;
  IF v_definition NOT LIKE '%extensions.digest%' THEN
    RAISE EXCEPTION 'detect_slow_queries_digest_not_qualified';
  END IF;

  SELECT pg_get_functiondef('public.reset_pg_stat_statements_weekly()'::regprocedure)
    INTO v_definition;
  IF v_definition NOT LIKE '%extensions.pg_stat_statements_reset%' THEN
    RAISE EXCEPTION 'pg_stat_reset_not_qualified';
  END IF;

  SELECT pg_get_functiondef('public.trigger_campaign_health_alert()'::regprocedure)
    INTO v_definition;
  IF v_definition LIKE '%rapjswienfhkobhlamxb%'
     OR v_definition NOT LIKE '%X-Cron-Secret%'
     OR v_definition NOT LIKE '%_internal_secrets%'
     OR v_definition NOT LIKE '%campaign_health_cron_base_url_must_be_https%' THEN
    RAISE EXCEPTION 'campaign_health_trigger_not_hardened';
  END IF;

  IF to_regprocedure('public.add_salesperson_xp(uuid,integer,text)') IS NOT NULL
     AND has_function_privilege(
       'anon', 'public.add_salesperson_xp(uuid,integer,text)', 'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'anon_public_add_salesperson_xp_still_allowed';
  END IF;

  IF to_regprocedure('private.add_salesperson_xp(uuid,integer,text)') IS NOT NULL
     AND (
       has_function_privilege(
         'anon', 'private.add_salesperson_xp(uuid,integer,text)', 'EXECUTE'
       )
       OR has_function_privilege(
         'authenticated', 'private.add_salesperson_xp(uuid,integer,text)', 'EXECUTE'
       )
       OR NOT has_function_privilege(
         'service_role', 'private.add_salesperson_xp(uuid,integer,text)', 'EXECUTE'
       )
     ) THEN
    RAISE EXCEPTION 'private_add_salesperson_xp_acl_mismatch';
  END IF;
END;
$$;
