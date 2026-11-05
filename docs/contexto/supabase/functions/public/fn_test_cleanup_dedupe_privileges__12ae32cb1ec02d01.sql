CREATE OR REPLACE FUNCTION public.fn_test_cleanup_dedupe_privileges()
 RETURNS TABLE(role_name text, can_execute boolean, expected boolean, passed boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
  SELECT r.role_name,
         has_function_privilege(r.role_name, 'public.fn_cleanup_webhook_dedupe()', 'EXECUTE') AS can_execute,
         r.expected,
         has_function_privilege(r.role_name, 'public.fn_cleanup_webhook_dedupe()', 'EXECUTE') = r.expected AS passed
  FROM (VALUES
    ('anon', false),
    ('authenticated', false),
    ('service_role', true),
    ('public', false)
  ) AS r(role_name, expected);
$function$
