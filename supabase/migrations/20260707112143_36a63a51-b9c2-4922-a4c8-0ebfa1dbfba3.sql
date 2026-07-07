
-- 1) Hardening da função: search_path fixo pg_catalog,public + owner service_role + logging interno
CREATE OR REPLACE FUNCTION public.fn_cleanup_webhook_dedupe()
RETURNS TABLE(deleted_count bigint, oldest_kept timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_deleted bigint;
  v_oldest timestamptz;
  v_started timestamptz := clock_timestamp();
BEGIN
  WITH deleted AS (
    DELETE FROM public.webhook_inbound_dedupe
    WHERE received_at < (now() - INTERVAL '90 days')
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;

  SELECT min(received_at) INTO v_oldest FROM public.webhook_inbound_dedupe;

  -- Auditoria interna: sempre registra a execução (mesmo com 0 linhas)
  INSERT INTO public.maintenance_log (
    job_name, started_at, completed_at, rows_affected, status, metadata
  ) VALUES (
    'fn_cleanup_webhook_dedupe',
    v_started,
    clock_timestamp(),
    v_deleted,
    'completed',
    jsonb_build_object(
      'oldest_kept', v_oldest,
      'invoked_by', session_user,
      'current_user', current_user,
      'cutoff', (now() - INTERVAL '90 days')
    )
  );

  RETURN QUERY SELECT v_deleted, v_oldest;
END;
$function$;

-- Owner: postgres (superuser padrão do Supabase). Garante que SECURITY DEFINER
-- rode com privilégios controlados (não do role que criou a migration).
ALTER FUNCTION public.fn_cleanup_webhook_dedupe() OWNER TO postgres;

-- 2) Revogar EXECUTE de anon/authenticated/public (defesa em profundidade)
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM anon;
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() TO service_role;

-- 3) RLS reforçado em webhook_inbound_dedupe (RLS já habilitado; garantir + FORCE)
ALTER TABLE public.webhook_inbound_dedupe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_inbound_dedupe FORCE ROW LEVEL SECURITY;

-- Bloquear qualquer INSERT/UPDATE/DELETE de anon/authenticated de forma explícita
DROP POLICY IF EXISTS "Deny writes to non-service" ON public.webhook_inbound_dedupe;
CREATE POLICY "Deny writes to non-service"
  ON public.webhook_inbound_dedupe
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Revogar grants de tabela para anon/authenticated (só service_role escreve)
REVOKE ALL ON public.webhook_inbound_dedupe FROM PUBLIC;
REVOKE ALL ON public.webhook_inbound_dedupe FROM anon;
REVOKE ALL ON public.webhook_inbound_dedupe FROM authenticated;
GRANT ALL ON public.webhook_inbound_dedupe TO service_role;

-- 4) RLS reforçado em maintenance_log
ALTER TABLE public.maintenance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny writes to non-service on maintenance_log" ON public.maintenance_log;
CREATE POLICY "Deny writes to non-service on maintenance_log"
  ON public.maintenance_log
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (false);

REVOKE INSERT, UPDATE, DELETE ON public.maintenance_log FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.maintenance_log TO service_role;

-- 5) Função de auto-teste dos privilégios (SECURITY INVOKER, callable por admin)
CREATE OR REPLACE FUNCTION public.fn_test_cleanup_dedupe_privileges()
RETURNS TABLE(role_name text, can_execute boolean, expected boolean, passed boolean)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.fn_test_cleanup_dedupe_privileges() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_test_cleanup_dedupe_privileges() TO authenticated, service_role;
