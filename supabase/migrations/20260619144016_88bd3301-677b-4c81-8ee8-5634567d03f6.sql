DO $$
DECLARE
  fn text;
  r record;
  fns text[] := ARRAY['log_audit_event','auto_assign_lead','log_rate_limit'];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    FOR r IN
      SELECT pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'private' AND p.proname = fn
    LOOP
      EXECUTE format('ALTER FUNCTION private.%I(%s) SET SCHEMA public;', fn, r.args);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon;', fn, r.args);
      EXECUTE format('GRANT  EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role;', fn, r.args);
    END LOOP;
  END LOOP;
END $$;