-- Pacote auditoria DB/integridade — [SOFTDELETE]
-- Objetivo: tornar o soft delete efetivo nas entidades de negócio.
--
-- 1) Garante colunas deleted_at/deleted_by/delete_reason em TODAS as tabelas
--    de negócio (idempotente — clients, deals, activities, products, suppliers
--    e teams já as têm desde 20251228_add_soft_delete.sql; tasks só tem
--    deleted_at; quotes, sales e client_portfolio não tinham nenhuma).
-- 2) Índices parciais para varredura de registros excluídos (purge/auditoria).
--    ATENÇÃO: CREATE INDEX simples — CONCURRENTLY falha no gateway transacional.
-- 3) Remove TODAS as policies FOR DELETE permissivas das tabelas de negócio e
--    recria uma única policy restrita a admin/manager. O delete do usuário comum
--    passa a ser o UPDATE de deleted_at (soft delete), não DELETE físico.
--    O purge real continua possível via RPC SECURITY DEFINER (hard_delete_record).
-- 4) View sales_with_markup passa a ocultar vendas soft-deletadas para todos
--    os consumidores (dashboards, BI, relatórios).
--
-- Idempotente: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- DROP POLICY IF EXISTS + guards to_regclass. Segura para reexecutar.

-- ============================================================================
-- 1) COLUNAS deleted_* NAS TABELAS DE NEGÓCIO
-- ============================================================================

DO $$
DECLARE
  t TEXT;
  business_tables TEXT[] := ARRAY[
    'clients',
    'suppliers',
    'deals',
    'quotes',
    'activities',
    'sales',
    'tasks',
    'products',
    'teams',
    'client_portfolio'
  ];
BEGIN
  FOREACH t IN ARRAY business_tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabela % inexistente — colunas deleted_* ignoradas', t;
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
         ADD COLUMN IF NOT EXISTS deleted_by UUID,
         ADD COLUMN IF NOT EXISTS delete_reason TEXT',
      t
    );
    EXECUTE format(
      'COMMENT ON COLUMN public.%I.deleted_at IS ''Soft delete: preenchido marca o registro como excluído sem remoção física.''',
      t
    );

    -- Índice parcial: acelera purge (cleanup_deleted_records) e consultas admin
    -- de "lixeira". Consultas de registros ativos usam PK/filtros próprios.
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_%I_deleted_at ON public.%I (deleted_at) WHERE deleted_at IS NOT NULL',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================================
-- 2) POLICIES FOR DELETE RESTRITAS A ADMIN/MANAGER
-- ============================================================================
-- Apaga dinamicamente qualquer policy FOR DELETE existente (ex.: as
-- "Allow public delete to ..." de 20251214 e as policies antigas por papel)
-- e recria uma única policy admin/manager por tabela.

DO $$
DECLARE
  t TEXT;
  pol RECORD;
  business_tables TEXT[] := ARRAY[
    'clients',
    'suppliers',
    'deals',
    'quotes',
    'activities',
    'sales',
    'tasks',
    'products',
    'teams',
    'client_portfolio'
  ];
BEGIN
  FOREACH t IN ARRAY business_tables LOOP
    -- Tabela pode não existir neste banco (ex.: deals/payouts ausentes)
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabela % inexistente — policies ignoradas', t;
      CONTINUE;
    END IF;

    FOR pol IN
      SELECT policyname
        FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = t
         AND cmd = 'DELETE'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin_or_manager(auth.uid()))',
      'admin_delete_' || t,
      t
    );
  END LOOP;
END $$;

-- ============================================================================
-- 3) VIEW sales_with_markup OCULTA SOFT-DELETADOS
-- ============================================================================
-- Mesma definição de 20260723172148 (security_invoker + mascaramento de custos
-- para não-admin/manager), acrescentando apenas o filtro deleted_at IS NULL.

CREATE OR REPLACE VIEW public.sales_with_markup
WITH (security_invoker = true) AS
SELECT
  s.id,
  s.client_id,
  s.client_name,
  s.product_id,
  s.product_name,
  s.sku,
  s.amount,
  s.status,
  s.salesperson_id,
  s.sdr_id,
  s.closer_id,
  s.created_at,
  s.updated_at,
  s.markup_pct,
  s.cost_source,
  s.cost_synced_at,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.unit_cost
    ELSE NULL
  END AS unit_cost,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.total_cost
    ELSE NULL
  END AS total_cost,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.margin_amount
    ELSE NULL
  END AS margin_amount
FROM public.sales s
WHERE s.deleted_at IS NULL;

GRANT SELECT ON public.sales_with_markup TO authenticated;
GRANT SELECT ON public.sales_with_markup TO service_role;

COMMENT ON VIEW public.sales_with_markup IS 'Visão de vendas com markup; mascara custos absolutos para vendedores e oculta vendas soft-deletadas.';
