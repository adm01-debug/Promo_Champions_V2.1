-- Enforce SET search_path = 'public' on every SECURITY DEFINER function in the
-- public schema. Without this, an attacker who can create objects in a schema
-- earlier on the search_path could shadow system/public functions and escalate
-- privileges inside a SECURITY DEFINER context (CWE-426 / CVE-2018-1058).
--
-- This DO block queries the pg_proc catalog directly so it handles any function
-- signature without requiring us to enumerate parameter types individually.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prosecdef = true
      AND n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = ''public''',
        r.proname,
        r.args
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log but do not abort: some functions may have been dropped or renamed.
      RAISE WARNING 'Could not set search_path for function public.%(%). Skipped.',
        r.proname, r.args;
    END;
  END LOOP;
END;
$$;
