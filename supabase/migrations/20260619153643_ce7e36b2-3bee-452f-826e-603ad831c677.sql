DO $$
DECLARE fn text; sig text;
BEGIN
  FOR fn IN SELECT unnest(ARRAY[
    'upsert_semantic_entry','schedule_next_qbrs','record_outbound_message','get_semantic_coverage',
    'update_call_recording_transcript','update_call_recording_summary','update_call_recording_diarization',
    'match_reply_to_enrollment','match_semantic','compute_optimal_send_time','append_agent_step',
    'search_products_vector','find_matching_cadence_rule','compute_forecast_rollup',
    'increment_race_car_wins','increment_race_car_overtakes','create_agent_run','complete_agent_run',
    'validate_api_token','bulk_recompute_engagement','pick_step_variant'
  ]) LOOP
    FOR sig IN
      SELECT 'public.' || quote_ident(p.proname) || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname=fn AND p.prosecdef=true
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
    END LOOP;
  END LOOP;
END $$;