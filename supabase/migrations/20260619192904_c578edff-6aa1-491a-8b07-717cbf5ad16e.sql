-- Hardening #15.1: revoke EXECUTE from authenticated on internal/background SECURITY DEFINER functions.
-- These are invoked only by cron jobs, edge functions, or admin scripts (service_role).
DO $$
DECLARE
  r RECORD;
  v_internal TEXT[] := ARRAY[
    'append_agent_step','approve_agent_run','complete_agent_run','create_agent_run',
    'auto_pause_enrollment','auto_promote_sequence_winners','bulk_recompute_engagement',
    'check_sla_violations','compute_forecast_rollup','compute_optimal_send_time',
    'detect_renewal_risks','find_matching_cadence_rule','finalize_race_season',
    'is_ip_blocked','is_ip_whitelisted','process_weekly_league_reset','schedule_next_qbrs',
    'calculate_asset_efficiency','match_reply_to_enrollment','log_audit_event',
    'log_rate_limit','toggle_workflow_active','update_call_recording_diarization',
    'update_call_recording_summary','update_call_recording_transcript',
    'upsert_semantic_entry','recompute_engagement_score','record_engagement_signal',
    'record_outbound_message','process_lead_intent_event','pick_step_variant',
    'compute_pipeline_inspection'
  ];
  v_sig TEXT;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.prokind   = 'f'
      AND p.proname = ANY (v_internal)
  LOOP
    v_sig := format('public.%I(%s)', r.proname, r.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC',        v_sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon',          v_sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', v_sig);
    EXECUTE format('GRANT  EXECUTE ON FUNCTION %s TO service_role',    v_sig);
  END LOOP;
END
$$;