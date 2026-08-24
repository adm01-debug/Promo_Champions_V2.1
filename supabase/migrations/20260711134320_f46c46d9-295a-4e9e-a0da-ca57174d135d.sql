
-- =============================================================
-- SEC-01: Least privilege em SECURITY DEFINER
-- =============================================================
DO $mig$
DECLARE
  r record;
  v_allow_auth text[] := ARRAY[
    -- Client RPCs (varredura de src/**/*.ts)
    'append_agent_step','approve_agent_run','assign_task_to_squad','auto_assign_lead',
    'award_salesperson_xp','bulk_approve_assignments','bulk_recompute_engagement',
    'calculate_account_score','calculate_daily_challenge_streak','calculate_deal_health',
    'check_rate_limit','check_sla_violations','coaching_progress_by_salesperson',
    'complete_agent_run','compute_forecast_rollup','compute_optimal_send_time',
    'compute_pipeline_inspection','create_activities_from_action_items','create_agent_run',
    'declare_step_winner','detect_renewal_risks','disable_sms','disable_totp',
    'enroll_quote_in_cadence','finalize_race_season','find_matching_cadence_rule',
    'fn_convert_quote_to_sale','fn_get_orders_conversion_seq_last','fn_list_cron_jobs',
    'generate_api_token','get_ab_test_results','get_account_engagement_summary',
    'get_active_salespeople','get_auto_paused_count','get_bulk_job_summary',
    'get_cadence_metrics','get_client_purchase_heatmap','get_client_seasonality',
    'get_client_top_products','get_current_salesperson_id','get_current_user_email',
    'get_dashboard_kpis','get_detailed_kpis','get_dialer_queue_stats',
    'get_engagement_leaderboard','get_global_send_time_stats','get_industry_benchmark_stats',
    'get_industry_seasonality','get_industry_top_products','get_mfa_status',
    'get_purchase_intelligence_summary','get_revenue_forecast','get_score_trend',
    'get_semantic_coverage','get_top_accounts','get_user_permissions','get_user_role',
    'grant_task_xp','has_permission','has_role','increment_race_car_overtakes',
    'increment_race_car_wins','increment_v4_callback_metric','initialize_totp',
    'is_admin_or_manager','is_authenticated','is_known_device','is_mfa_enabled',
    'log_audit_event','manual_xp_adjustment','mark_all_notifications_read',
    'mark_entity_for_reindex','match_reply_to_enrollment','match_semantic',
    'next_dialer_item','pick_step_variant','process_lead_intent_event',
    'process_weekly_league_reset','recompute_engagement_score','record_engagement_signal',
    'record_outbound_message','refresh_session','regenerate_backup_codes',
    'register_race_daily_checkin','schedule_next_qbrs','search_call_library',
    'search_products_semantic','search_products_vector','send_notification',
    'set_mfa_preferred_method','setup_sms_mfa','toggle_workflow_active',
    'unlock_race_item','update_call_recording_diarization','update_call_recording_summary',
    'update_call_recording_transcript','update_own_profile','update_own_sale',
    'update_user_mfa_settings','upsert_client_from_quote','upsert_semantic_entry',
    'user_owns_engagement_contact','user_owns_sequence_step','validate_api_token',
    'validate_session','verify_and_enable_sms','verify_and_enable_totp',
    'verify_mfa_code','win_rate_breakdown','get_embedded_report_by_token',
    'generate_device_fingerprint'
  ];
  v_allow_anon text[] := ARRAY[
    -- Pré-autenticação (login/reset/rate-limit)
    'check_rate_limit','log_rate_limit','is_ip_blocked','is_ip_whitelisted',
    'is_country_blocked','count_failed_login_attempts','count_reset_requests_24h',
    'has_pending_reset_request','generate_device_fingerprint','is_authenticated',
    'get_embedded_report_by_token'
  ];
  v_ident text;
  v_revoked int := 0;
  v_granted_auth int := 0;
  v_granted_anon int := 0;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    v_ident := format('public.%I(%s)', r.proname, r.args);

    -- 1) Revogar EXECUTE do default (PUBLIC) e de anon/authenticated
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', v_ident);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', v_ident);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', v_ident);
    v_revoked := v_revoked + 1;

    -- 2) service_role sempre pode (edge functions, cron, admin scripts)
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', v_ident);

    -- 3) authenticated: apenas allowlist
    IF r.proname = ANY(v_allow_auth) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_ident);
      v_granted_auth := v_granted_auth + 1;
    END IF;

    -- 4) anon: allowlist mínima (auth pré-login)
    IF r.proname = ANY(v_allow_anon) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', v_ident);
      v_granted_anon := v_granted_anon + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'SEC-01 concluído: revoked=% granted_auth=% granted_anon=%',
    v_revoked, v_granted_auth, v_granted_anon;
END
$mig$;

-- =============================================================
-- Observabilidade contínua: exposição de SECURITY DEFINER
-- =============================================================
CREATE OR REPLACE VIEW public.v_security_definer_exposure
WITH (security_invoker = true) AS
SELECT
  n.nspname                                              AS schema_name,
  p.proname                                              AS function_name,
  pg_get_function_identity_arguments(p.oid)              AS args,
  has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
  has_function_privilege('service_role',  p.oid, 'EXECUTE') AS service_role_can_execute,
  (p.proconfig IS NOT NULL AND EXISTS (
     SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'
   ))                                                    AS has_search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
ORDER BY p.proname;

REVOKE ALL ON public.v_security_definer_exposure FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_security_definer_exposure TO service_role;
COMMENT ON VIEW public.v_security_definer_exposure IS
  'SEC-01 audit: SECURITY DEFINER exposure per role. Query as service_role or admin via RPC wrapper.';

-- =============================================================
-- PERF-01: monitoração de WAL / replication slots
-- =============================================================
CREATE OR REPLACE VIEW public.v_platform_wal_health
WITH (security_invoker = true) AS
SELECT
  (SELECT pg_size_pretty(sum(size)) FROM pg_ls_waldir())                    AS wal_dir_size,
  (SELECT pg_size_pretty(pg_database_size(current_database())))             AS db_size,
  (SELECT count(*) FROM pg_replication_slots WHERE active)                  AS active_slots,
  (SELECT count(*) FROM pg_replication_slots WHERE NOT active)              AS inactive_slots,
  (SELECT pg_size_pretty(coalesce(max(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)),0))
     FROM pg_replication_slots)                                             AS max_slot_lag_bytes,
  (SELECT count(*) FROM pg_stat_activity
     WHERE state <> 'idle' AND xact_start IS NOT NULL
       AND now() - xact_start > interval '5 minutes')                       AS long_running_tx_count,
  (SELECT extract(epoch FROM (now() - min(xact_start)))::int
     FROM pg_stat_activity
     WHERE state <> 'idle' AND xact_start IS NOT NULL)                      AS oldest_tx_age_seconds;

REVOKE ALL ON public.v_platform_wal_health FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_platform_wal_health TO service_role;
COMMENT ON VIEW public.v_platform_wal_health IS
  'PERF-01: WAL/replication health snapshot. Alert when max_slot_lag_bytes > 1GB or long_running_tx_count > 0.';

-- =============================================================
-- Admin wrappers (autenticados admin conseguem consultar via RPC)
-- =============================================================
CREATE OR REPLACE FUNCTION public.fn_admin_security_definer_exposure()
RETURNS SETOF public.v_security_definer_exposure
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.v_security_definer_exposure
  WHERE public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.fn_admin_security_definer_exposure() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.fn_admin_security_definer_exposure() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fn_admin_wal_health()
RETURNS SETOF public.v_platform_wal_health
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.v_platform_wal_health
  WHERE public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.fn_admin_wal_health() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.fn_admin_wal_health() TO authenticated, service_role;
