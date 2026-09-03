-- Auditoria técnica 2026-09-02/03 (PR #90) — fechamento de 2 gaps de autorização,
-- endurecida pela revisão adversarial (banca de 5 agentes, achados B1-B13):
--
-- 1) 8 tabelas criadas sem ENABLE ROW LEVEL SECURITY. Varredura exaustiva em
--    src/ e supabase/functions/ (literais e acesso dinâmico) confirmou ZERO
--    leitura/escrita via PostgREST; as escritas existentes passam por funções
--    SECURITY DEFINER (log_security_event) ou por migrations (migration_log),
--    que não são afetadas por RLS do invocador. ENABLE RLS (sem FORCE, para
--    preservar owner/DEFINER) + REVOKE de PUBLIC/anon/authenticated em tabelas
--    E sequences associadas + deny-all por ausência de policy.
--    Exceção: security_events ganha policy de SELECT para admins.
--    Destaque: user_permissions_cache era escalada de privilégio em potencial.
--
-- 2) SET search_path em toda SECURITY DEFINER de public/private que esteja sem
--    (CWE-426) — varredura por catálogo (padrão de 20260718000004), cobrindo as
--    3 regressões conhecidas (auto_victory_post, audit_trigger_func,
--    maintain_sales_streaks) e qualquer outra criada fora do fluxo.
--
-- Idempotente; falhas de ownership são acumuladas e reportadas de uma vez; a
-- asserção final impede "verde vazio" (tabela existente sem RLS => EXCEPTION).

SET lock_timeout = '3s';
SET statement_timeout = '30s';

DO $$
DECLARE
  t text;
  seq_sql text;
  failures text := '';
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
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', t);
        -- Sequences OWNED BY colunas da tabela (ex.: migration_log_id_seq) —
        -- REVOKE de tabela não alcança sequences (achado B4).
        SELECT coalesce(string_agg(
                 format('REVOKE ALL ON SEQUENCE %s FROM PUBLIC, anon, authenticated;', s), ' '), '')
          INTO seq_sql
          FROM (SELECT DISTINCT pg_get_serial_sequence(format('public.%I', t), a.attname) AS s
                  FROM pg_attribute a
                 WHERE a.attrelid = to_regclass(format('public.%I', t))
                   AND a.attnum > 0 AND NOT a.attisdropped
                   AND pg_get_serial_sequence(format('public.%I', t), a.attname) IS NOT NULL) x;
        IF seq_sql <> '' THEN
          EXECUTE seq_sql;
        END IF;
      EXCEPTION WHEN insufficient_privilege THEN
        -- Tabela criada fora do fluxo de migrations com owner diferente
        -- (achado B1). Acumula para reportar todas de uma vez.
        failures := failures || t || ' (owner: ' ||
          (SELECT pg_get_userbyid(c.relowner) FROM pg_class c
            WHERE c.oid = to_regclass(format('public.%I', t))) || '); ';
      END;
    END IF;
  END LOOP;

  IF failures <> '' THEN
    RAISE EXCEPTION 'RLS não pôde ser habilitada (ownership) em: % — reatribua com ALTER TABLE ... OWNER TO postgres e reaplique', failures;
  END IF;
END $$;

-- security_events: admins podem consultar (auditoria de incidentes).
-- GRANT SELECT volta só para authenticated; a policy restringe a admins.
-- has_role/auth.uid() envolvidos em SELECT => InitPlan, avaliado 1× por query
-- em vez de por linha (achado B9).
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
        USING ((SELECT public.has_role((SELECT auth.uid()), 'admin')))
    $pol$;
  END IF;
END $$;

-- 2) search_path em TODA SECURITY DEFINER sem search_path fixado, por catálogo
--    (achado B6 — auto-atualizável; cobre public e private, mesmo padrão de
--    20260718000004, agora com pg_temp explícito).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE p.prosecdef
       AND n.nspname IN ('public', 'private')
       AND NOT EXISTS (
         SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search\_path=%'
       )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
                   r.nspname, r.proname, r.args);
  END LOOP;
END $$;

-- Asserção final (achado B2): impede sucesso vazio. Toda tabela-alvo EXISTENTE
-- precisa estar com RLS ligada, e a policy de security_events precisa existir.
DO $$
DECLARE missing text;
BEGIN
  SELECT string_agg(t, ', ') INTO missing
    FROM unnest(ARRAY['security_events','roles','user_permissions_cache','experiments',
                      'experiment_variants','experiment_assignments','ab_tests','migration_log']) AS t
   WHERE to_regclass(format('public.%I', t)) IS NOT NULL
     AND NOT (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass(format('public.%I', t)));
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'RLS não habilitada em: %', missing;
  END IF;

  IF to_regclass('public.security_events') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies
                      WHERE schemaname = 'public' AND tablename = 'security_events'
                        AND policyname = 'security_events_admin_select') THEN
    RAISE EXCEPTION 'policy security_events_admin_select ausente';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE p.prosecdef AND n.nspname IN ('public', 'private')
       AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search\_path=%')
  ) THEN
    RAISE EXCEPTION 'restam SECURITY DEFINER sem search_path fixado';
  END IF;
END $$;
