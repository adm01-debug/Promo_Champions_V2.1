DO $$
DECLARE
  fn text;
  sig text;
BEGIN
  FOR fn IN SELECT unnest(ARRAY[
    'generate_cadence_tasks','process_audit_log','record_lead_score_history','record_price_history',
    'record_sale_stage_transition','set_sdr_id_on_insert','snapshot_committee_coverage',
    'snapshot_engagement_score','sync_performance_bets','sync_quote_to_sale_status',
    'sync_territory_ownership','sync_total_xp','validate_race_event'
  ]) LOOP
    FOR sig IN
      SELECT 'public.' || quote_ident(p.proname) || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname=fn
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
    END LOOP;
  END LOOP;
END $$;