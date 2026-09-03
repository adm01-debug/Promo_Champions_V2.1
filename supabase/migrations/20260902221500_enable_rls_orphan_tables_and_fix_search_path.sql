-- Auditoria técnica 2026-09-02 (PR #90) — fechamento de 2 gaps de autorização:
--
-- 1) 8 tabelas criadas sem ENABLE ROW LEVEL SECURITY. Verificação estática
--    exaustiva (grep em src/, supabase/functions/ e types.ts gerado) confirmou
--    ZERO leitura/escrita via PostgREST em todas elas; as escritas existentes
--    passam por funções SECURITY DEFINER (log_security_event, has_permission)
--    ou por migrations (migration_log), que não são afetadas por RLS do
--    invocador. Portanto: ENABLE RLS (sem FORCE, para não quebrar owner/DEFINER)
--    + REVOKE de anon/authenticated (defesa em profundidade — o default do
--    Supabase concede GRANT ALL a ambos) + deny-all por ausência de policy.
--    Exceção: security_events ganha policy de SELECT para admins (tela futura).
--    Destaque: user_permissions_cache era escalada de privilégio em potencial —
--    has_permission() confia no cache antes de recalcular.
--
-- 2) 3 funções SECURITY DEFINER recriadas APÓS o fix global de search_path
--    (20260718000004) voltaram a ficar sem SET search_path (CWE-426):
--    auto_victory_post, audit_trigger_func, maintain_sales_streaks.
--    (sync_battle_score teve o mesmo problema e já foi corrigida em
--    20260902121000.)
--
-- Idempotente e defensiva: só toca objetos que existirem no banco alvo.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_events',
    'roles',
    'user_permissions_cache',
    'experiments',
    'experiment_variants',
    'experiment_assignments',
    'ab_tests',
    'migration_log'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- security_events: admins podem consultar (auditoria de incidentes).
-- GRANT SELECT volta só para authenticated; a policy restringe a admins.
DO $$
BEGIN
  IF to_regclass('public.security_events') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT ON TABLE public.security_events TO authenticated';
    EXECUTE 'DROP POLICY IF EXISTS security_events_admin_select ON public.security_events';
    EXECUTE $pol$
      CREATE POLICY security_events_admin_select
        ON public.security_events
        FOR SELECT
        TO authenticated
        USING (public.has_role(auth.uid(), 'admin'))
    $pol$;
  END IF;
END $$;

-- 2) search_path nas SECURITY DEFINER que regrediram (todas trigger functions
--    sem argumentos). to_regprocedure evita erro se a função não existir.
DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.auto_victory_post()',
    'public.audit_trigger_func()',
    'public.maintain_sales_streaks()'
  ] LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', f);
    END IF;
  END LOOP;
END $$;
