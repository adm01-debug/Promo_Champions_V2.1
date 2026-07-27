-- ============================================================
-- promo-champions-v2.1 — Observability Tables RLS
-- Auditoria ETAPA 9 — edge_retry_events + edge_circuit_breaker_events
--
-- SIMULAÇÃO DE CENÁRIOS:
-- C1: Qualquer usuário faz SELECT em edge_retry_events → vê dados de outros
--     → RLS admin-only resolve
-- C2: Usuário anônimo tenta INSERT → rejeitado
--     → RLS authenticated resolve
-- C3: Tabela vazia na primeira migração → sem dados para migrar
--     → IF NOT EXISTS + SKIP é idempotente
-- ============================================================

-- ── edge_retry_events ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'edge_retry_events'
  ) THEN
    RAISE NOTICE 'edge_retry_events nao existe — SKIP';
  ELSE
    -- Habilitar RLS
    ALTER TABLE public.edge_retry_events ENABLE ROW LEVEL SECURITY;

    -- Drop policies antigas (se existirem)
    DROP POLICY IF EXISTS "edge_retry_events_select_all" ON public.edge_retry_events;
    DROP POLICY IF EXISTS "edge_retry_events_insert_all" ON public.edge_retry_events;

    -- SELECT: admin + manager veem tudo; service role insere
    CREATE POLICY "edge_retry_events_admin_select"
      ON public.edge_retry_events
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role::TEXT IN ('admin', 'manager')
        )
      );

    -- INSERT: service role (edge functions) + admin
    CREATE POLICY "edge_retry_events_service_insert"
      ON public.edge_retry_events
      FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role::TEXT IN ('admin', 'service_role')
        )
      );

    RAISE NOTICE 'edge_retry_events RLS habilitado';
  END IF;
END;
$$;

-- ── edge_circuit_breaker_events ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'edge_circuit_breaker_events'
  ) THEN
    RAISE NOTICE 'edge_circuit_breaker_events nao existe — SKIP';
  ELSE
    ALTER TABLE public.edge_circuit_breaker_events ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "edge_circuit_breaker_select_all" ON public.edge_circuit_breaker_events;
    DROP POLICY IF EXISTS "edge_circuit_breaker_insert_all" ON public.edge_circuit_breaker_events;

    CREATE POLICY "edge_circuit_breaker_admin_select"
      ON public.edge_circuit_breaker_events
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role::TEXT IN ('admin', 'manager')
        )
      );

    CREATE POLICY "edge_circuit_breaker_service_insert"
      ON public.edge_circuit_breaker_events
      FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role::TEXT IN ('admin', 'service_role')
        )
      );

    RAISE NOTICE 'edge_circuit_breaker_events RLS habilitado';
  END IF;
END;
$$;

-- ── Garantir indexes para performance em event tables ────────────────────────
DO $$
BEGIN
  -- edge_retry_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_retry_events') THEN
    CREATE INDEX IF NOT EXISTS idx_edge_retry_events_created
      ON public.edge_retry_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_edge_retry_events_function_name
      ON public.edge_retry_events(function_name)
      WHERE function_name IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_edge_retry_events_status
      ON public.edge_retry_events(status)
      WHERE status IS NOT NULL;
  END IF;

  -- edge_circuit_breaker_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_circuit_breaker_events') THEN
    CREATE INDEX IF NOT EXISTS idx_edge_circuit_breaker_created
      ON public.edge_circuit_breaker_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_edge_circuit_breaker_function
      ON public.edge_circuit_breaker_events(function_name)
      WHERE function_name IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_edge_circuit_breaker_state
      ON public.edge_circuit_breaker_events(state)
      WHERE state IS NOT NULL;
  END IF;

  RAISE NOTICE 'Indexes de observabilidade verificados';
END;
$$;

-- ============================================================
-- FIM: Observability Tables RLS
-- ============================================================
