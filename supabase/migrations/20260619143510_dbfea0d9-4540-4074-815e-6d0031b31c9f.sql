-- Melhoria #1: Blindar SECURITY DEFINER do schema public contra execução anônima
-- Revoga EXECUTE de PUBLIC e anon, mantém authenticated e service_role
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname  AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon;',
      r.schema_name, r.func_name, r.args
    );
    EXECUTE format(
      'GRANT  EXECUTE ON FUNCTION %I.%I(%s) TO authenticated, service_role;',
      r.schema_name, r.func_name, r.args
    );
  END LOOP;
END $$;