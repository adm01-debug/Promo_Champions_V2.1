-- Hardening #15: Revoke EXECUTE on every public SECURITY DEFINER function,
-- then re-grant only to RPCs actually invoked by the frontend / edge functions.
-- Goal: drive Supabase linter 0029 warnings from 69 down to ~0 without breaking the app.

DO $$
DECLARE
  r RECORD;
  v_allowlist TEXT[] := ARRAY[
    'append_agent_step','approve_agent_run','assign_task_to_squad','auto_assign_lead',
    'auto_pause_enrollment','auto_promote_sequence_winners','award_salesperson_xp',
    'bulk_approve_assignments','bulk_recompute_engagement','calculate_account_score',
    'calculate_asset_efficiency','calculate_daily_challenge_streak','calculate_deal_health',
    'check_rate_limit','check_sla_violations','coaching_progress_by_salesperson',
    'complete_agent_run','compute_forecast_rollup','compute_optimal_send_time',
    'compute_pipeline_inspection','create_activities_from_action_items','create_agent_run',
    'declare_step_winner','detect_renewal_risks','disable_sms','disable_totp',
    'enroll_quote_in_cadence','finalize_race_season','find_matching_cadence_rule',
    'generate_api_token','get_ab_test_results','get_account_engagement_summary',
    'get_active_salespeople','get_auto_paused_count','get_cadence_metrics',
    'get_client_purchase_heatmap','get_client_seasonality','get_client_top_products',
    'get_current_salesperson_id','get_dashboard_kpis','get_detailed_kpis',
    'get_dialer_queue_stats','get_engagement_leaderboard','get_global_send_time_stats',
    'get_industry_benchmark_stats','get_industry_seasonality','get_industry_top_products',
    'get_mfa_status','get_monthly_sales_benchmark','get_purchase_intelligence_summary',
    'get_revenue_forecast','get_score_trend','get_semantic_coverage','get_top_accounts',
    'grant_task_xp','has_role','increment_race_car_overtakes','increment_race_car_wins',
    'initialize_totp','is_admin_or_manager','is_ip_blocked','is_ip_whitelisted',
    'log_audit_event','log_rate_limit','manual_xp_adjustment','mark_all_notifications_read',
    'match_reply_to_enrollment','match_semantic','merge_clients','next_dialer_item',
    'pick_step_variant','process_lead_intent_event','process_weekly_league_reset',
    'recompute_engagement_score','record_engagement_signal','record_outbound_message',
    'refresh_session','regenerate_backup_codes','register_race_daily_checkin',
    'schedule_next_qbrs','search_call_library','search_products_semantic',
    'search_products_vector','send_notification','set_mfa_preferred_method',
    'setup_sms_mfa','toggle_workflow_active','unlock_race_item',
    'update_call_recording_diarization','update_call_recording_summary',
    'update_call_recording_transcript','upsert_semantic_entry','validate_api_token',
    'validate_session','verify_and_enable_sms','verify_and_enable_totp',
    'verify_mfa_code','win_rate_breakdown'
  ];
  v_sig TEXT;
BEGIN
  FOR r IN
    SELECT p.oid,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.prokind   = 'f'
  LOOP
    v_sig := format('public.%I(%s)', r.proname, r.args);

    -- Revoke broadly; trigger functions and internal helpers do not need EXECUTE.
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC',        v_sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon',          v_sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', v_sig);

    -- service_role keeps full access for edge functions / admin operations.
    EXECUTE format('GRANT  EXECUTE ON FUNCTION %s TO service_role',    v_sig);

    -- Re-grant to authenticated ONLY for whitelisted RPCs.
    IF r.proname = ANY (v_allowlist) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_sig);
    END IF;
  END LOOP;
END
$$;