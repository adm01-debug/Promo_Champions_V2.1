CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

DO $$
DECLARE
  fn text;
  sig text;
  names text[] := ARRAY[
    'check_quote_expirations','settle_performance_bets','sync_weekly_xp',
    'match_weekly_players','add_league_weekly_xp','compute_cohort_retention',
    'compute_customer_health_v2','calculate_deal_risk_score','enrich_lead_data',
    'increment_combo','increment_goal_progress','check_is_first_sale',
    'assign_cadence_variant'
  ];
BEGIN
  FOREACH fn IN ARRAY names LOOP
    FOR sig IN
      SELECT p.oid::regprocedure::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn
    LOOP
      EXECUTE format('ALTER FUNCTION %s SET SCHEMA private', sig);
      RAISE NOTICE 'Moved % to private', sig;
    END LOOP;
  END LOOP;
END $$;