DO $$
DECLARE
  fn_name text;
  fn_sig  text;
BEGIN
  FOREACH fn_name IN ARRAY ARRAY[
    'count_failed_login_attempts','count_reset_requests_24h','generate_device_fingerprint',
    'get_bulk_job_summary','get_embedded_report_by_token','get_user_permissions','get_user_role',
    'has_pending_reset_request','has_permission','increment_sales_streak','is_country_blocked',
    'is_known_device','is_mfa_enabled','mark_entity_for_reindex','update_own_profile',
    'update_own_sale','update_user_mfa_settings'
  ] LOOP
    FOR fn_sig IN
      SELECT format('public.%I(%s)', p.proname, pg_get_function_identity_arguments(p.oid))
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn_name AND p.prosecdef = true
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn_sig);
      EXECUTE format('GRANT  EXECUTE ON FUNCTION %s TO service_role', fn_sig);
    END LOOP;
  END LOOP;
END $$;