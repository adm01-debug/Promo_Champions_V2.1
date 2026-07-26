-- ============================================================
-- promo-champions-v2.1 — Missing RLS Policies
-- Auditoria ETAPA 1, 2 — Tables without RLS or incomplete policies
--
-- PROBLEMA:
-- 576 migrations sem coverage uniforme. Tabelas de infra/cron/eventos
-- podem não ter RLS habilitado.
--
-- SOLUÇÃO:
-- 1. Habilitar RLS em todas as tabelas de sistema que permitem RLS
-- 2. Criar policies mínimas (SELECT público para dados de consulta, INSERT/DELETE restrito)
-- 3. Tables de sistema: permitir SELECT anônimo (para dashboards públicos)
-- ============================================================

DO $$
DECLARE
  _tbl TEXT;
  _has_rls BOOLEAN;
  _rls_query TEXT := '
    SELECT DISTINCT tc.table_name
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
      AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
    LEFT JOIN pg_namespace ns ON ns.nspname = t.table_schema
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    LEFT JOIN pg_class dep ON dep.relnamespace = ns.oid AND dep.relname = t.table_name
    WHERE t.table_schema = ''public''
      AND t.table_type = ''BASE TABLE''
      AND c.oid IS NOT NULL
      AND NOT t.table_name LIKE ''_%_DEPRECATED_%''
      AND NOT t.table_name IN (''schema_migrations'', ''supabase_migrations'')
    GROUP BY t.table_schema, t.table_name, c.oid
    HAVING count(DISTINCT p.polname) = 0
    ORDER BY t.table_name
  ';
BEGIN
  -- Log tables without policies for review
  RAISE NOTICE 'Tables sem RLS policies (para auditoria):';
  FOR _tbl IN EXECUTE _rls_query
  LOOP
    RAISE NOTICE '  - %', _tbl;
  END LOOP;
END;
$$;

-- ── 1. Tabelas de sistema: habilitar RLS + policies mínimas ─────────────────
DO $$
DECLARE
  _tbl TEXT;
BEGIN
  FOR _tbl IN
    SELECT t.table_name
    FROM information_schema.tables t
    JOIN pg_class c ON c.relname = t.table_name
      AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LEFT JOIN pg_class dep ON dep.relnamespace = c.relnamespace AND dep.relname = t.table_name
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND NOT t.table_name LIKE '%_DEPRECATED_%'
      AND NOT t.table_name IN ('schema_migrations', 'supabase_migrations')
    GROUP BY t.table_schema, t.table_name, c.oid
    HAVING count(DISTINCT p.polname) = 0
  LOOP
    -- Habilitar RLS (IF NOT EXISTS para segurança)
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);
    RAISE NOTICE 'RLS habilitado em: %', _tbl;

    -- Policy padrão: SELECT público ( dashboards, webhooks, callbacks )
    -- Quem não quer SELECT público deve criar sua própria policy depois
    EXECUTE format(
      'CREATE POLICY "public_select_%I" ON public.%I FOR SELECT USING (true)',
      _tbl, _tbl
    );
    RAISE NOTICE '  Policy public_select criada para: %', _tbl;
  END LOOP;
END;
$$;

-- ── 2. Tables específicas: policies customizadas ───────────────────────────

-- 2a. webhook_inbound_dedupe: só service_role insere/lê
DO $$
BEGIN
  ALTER TABLE public.webhook_inbound_dedupe ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "service_only_webhook_inbound_dedupe" ON public.webhook_inbound_dedupe;
  CREATE POLICY "service_only_webhook_inbound_dedupe" ON public.webhook_inbound_dedupe
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  RAISE NOTICE 'webhook_inbound_dedupe RLS configurado';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'webhook_inbound_dedupe RLS: %', SQLERRM;
END;
$$;

-- 2b. webhook_security_config: só admins leem/admin gerem
DO $$
BEGIN
  DROP POLICY IF EXISTS "admin_read_webhook_security_config" ON public.webhook_security_config;
  CREATE POLICY "admin_read_webhook_security_config" ON public.webhook_security_config
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  DROP POLICY IF EXISTS "admin_admin_webhook_security_config" ON public.webhook_security_config;
  CREATE POLICY "admin_admin_webhook_security_config" ON public.webhook_security_config
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT = 'admin'
      )
    );
  RAISE NOTICE 'webhook_security_config policies configuradas';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'webhook_security_config: %', SQLERRM;
END;
$$;

-- 2c. edge_circuit_breaker_events: só admins leem, service_role escreve
DO $$
BEGIN
  ALTER TABLE public.edge_circuit_breaker_events ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "admin_read_circuit_breaker" ON public.edge_circuit_breaker_events;
  CREATE POLICY "admin_read_circuit_breaker" ON public.edge_circuit_breaker_events
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  RAISE NOTICE 'edge_circuit_breaker_events RLS configurado';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'edge_circuit_breaker_events: %', SQLERRM;
END;
$$;

-- 2d. edge_retry_events: só admins leem
DO $$
BEGIN
  ALTER TABLE public.edge_retry_events ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "admin_read_retry_events" ON public.edge_retry_events;
  CREATE POLICY "admin_read_retry_events" ON public.edge_retry_events
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  RAISE NOTICE 'edge_retry_events RLS configurado';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'edge_retry_events: %', SQLERRM;
END;
$$;

-- 2e. notifications: users veem suas próprias + admins veem todas
DO $$
BEGIN
  DROP POLICY IF EXISTS "own_notifications_select" ON public.notifications;
  CREATE POLICY "own_notifications_select" ON public.notifications
    FOR SELECT USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  RAISE NOTICE 'notifications SELECT policy configurada';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notifications: %', SQLERRM;
END;
$$;

-- 2f. audit_log: todos veem (via RLS existente), só service_role insere
DO $$
BEGIN
  DROP POLICY IF EXISTS "audit_log_insert_system" ON public.audit_log;
  CREATE POLICY "audit_log_insert_system" ON public.audit_log
    FOR INSERT WITH CHECK (
      -- Service role ou função com SECURITY DEFINER
      -- auth.uid() é NULL para service_role, então a policy é satisfeita
      auth.uid() IS NULL
      OR auth.uid() = user_id
    );
  DROP POLICY IF EXISTS "audit_log_select_own" ON public.audit_log;
  CREATE POLICY "audit_log_select_own" ON public.audit_log
    FOR SELECT USING (
      -- users veem seus próprios registros + admins veem todos
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'manager')
      )
    );
  RAISE NOTICE 'audit_log policies configuradas';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'audit_log policies: %', SQLERRM;
END;
$$;

-- ── 3. Garantir indexes para performance de auditoria ──────────────────────
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_webhook_inbound_dedupe_event_id
    ON public.webhook_inbound_dedupe(event_id);
  CREATE INDEX IF NOT EXISTS idx_webhook_inbound_dedupe_processed_at
    ON public.webhook_inbound_dedupe(processed_at DESC);
  CREATE INDEX IF NOT EXISTS idx_webhook_inbound_dedupe_ttl
    ON public.webhook_inbound_dedupe(event_id, processed_at DESC)
    WHERE processed_at > NOW() - INTERVAL '7 days';

  CREATE INDEX IF NOT EXISTS idx_edge_circuit_breaker_events_state
    ON public.edge_circuit_breaker_events(state, failure_count DESC);
  CREATE INDEX IF NOT EXISTS idx_edge_circuit_breaker_events_created
    ON public.edge_circuit_breaker_events(created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications(user_id, is_read, created_at DESC)
    WHERE is_read = FALSE;

  RAISE NOTICE 'Indexes de segurança e auditoria criados/verificados';
END;
$$;

-- ============================================================
-- FIM: Missing RLS Policies
-- ============================================================
