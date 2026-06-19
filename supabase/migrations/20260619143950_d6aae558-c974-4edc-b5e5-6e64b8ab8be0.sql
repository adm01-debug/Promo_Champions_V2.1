-- Lote A: mover 33 funções de trigger para schema private
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'auto_assign_lead','auto_create_commission','auto_enroll_in_cadence',
    'auto_enroll_quote_cadence','auto_link_sale_to_account','auto_pause_cadence_on_response',
    'auto_pause_enrollment','auto_promote_sequence_winners','auto_set_forecast_category',
    'auto_victory_post','award_xp_on_quote_approved_via_cadence',
    'award_xp_on_quote_cadence_task_complete','ensure_single_default_filter',
    'handle_audit_logging','handle_new_user_role','handle_performance_update',
    'handle_sale_commissions','handle_template_versioning','handle_territory_conquest',
    'log_audit_event','log_lead_stage_transition','log_order_creation',
    'log_order_status_change','log_rate_limit','notify_critical_moment_created',
    'notify_critical_winloss_pattern','track_deal_health_change',
    'trg_activities_auto_pause_sequences','trg_recompute_engagement',
    'trigger_recalculate_deal_health','trigger_refresh_monthly_summary',
    'trigger_update_performance_bets','trigger_update_territories'
  ];
  r record;
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    FOR r IN
      SELECT p.oid, pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn
    LOOP
      EXECUTE format('ALTER FUNCTION public.%I(%s) SET SCHEMA private;', fn, r.args);
    END LOOP;
  END LOOP;
END $$;