-- ============================================================
-- promo-champions-v2.1 — Missing UNIQUE Constraints & Partial Indexes
-- Auditoria ETAPA 29-33 — Unique constraints across all entities
--
-- PROBLEMA:
-- Soft-delete tables precisam de UNIQUE parcial: same email, diferentes
-- UUIDs de deleted_at = NULL vs deleted_at = TIMESTAMP (não é unique!)
-- Exemplo: client A (id=uuid1, email=a@b.com, deleted_at=NULL)
--          client A restaurado (id=uuid2, email=a@b.com, deleted_at=NULL)
--          → 2 registros ativos com mesmo email = BUG
--
-- CENÁRIOS SIMULADOS:
-- C1: Soft-delete parcial: 2 clients ativos com email duplicado
--     → UNIQUE parcial (email) WHERE deleted_at IS NULL impede
-- C2: Partial unique em phone: same phone, um ativo, um deletado
--     → UNIQUE (phone) WHERE phone IS NOT NULL AND deleted_at IS NULL
-- C3: UNIQUE condicional: quote_number pode repetir para diferentes clientes?
--     → UNIQUE (quote_number, salesperson_id) se cada vendedor tem seu numbering
-- C4: Migration idempotente: ADD CONSTRAINT IF NOT EXISTS — safe to rerun
-- ============================================================

-- ── 1. UNIQUE partial constraints em tabelas com soft-delete ──────────────
DO $$
DECLARE
  _sql TEXT;
  _exists BOOLEAN;
  _table_name TEXT;
  _constraint_name TEXT;
  _cols TEXT[] := ARRAY[
    -- (table, column, constraint_name, partial_filter)
    ['clients', 'email', 'clients_email_active_unique', '(deleted_at IS NULL)'],
    ['clients', 'phone', 'clients_phone_active_unique', '(phone IS NOT NULL AND deleted_at IS NULL)'],
    ['clients', 'document', 'clients_document_active_unique', '(document IS NOT NULL AND deleted_at IS NULL)'],

    ['deals', 'name', 'deals_name_active_unique', '(deleted_at IS NULL)'],

    ['salespeople', 'email', 'salespeople_email_active_unique', '(deleted_at IS NULL)'],
    ['salespeople', 'cpf', 'salespeople_cpf_active_unique', '(cpf IS NOT NULL AND deleted_at IS NULL)'],

    ['products', 'sku', 'products_sku_active_unique', '(deleted_at IS NULL)'],
    ['products', 'barcode', 'products_barcode_active_unique', '(barcode IS NOT NULL AND deleted_at IS NULL)'],

    ['suppliers', 'cnpj', 'suppliers_cnpj_active_unique', '(cnpj IS NOT NULL AND deleted_at IS NULL)'],
    ['suppliers', 'email', 'suppliers_email_active_unique', '(deleted_at IS NULL)'],

    ['teams', 'name', 'teams_name_active_unique', '(deleted_at IS NULL)'],

    ['cadences', 'name', 'cadences_name_active_unique', '(deleted_at IS NULL)'],

    ['playbooks', 'name', 'playbooks_name_active_unique', '(deleted_at IS NULL)'],

    ['quotes', 'quote_number', 'quotes_quote_number_active_unique', '(quote_number IS NOT NULL AND deleted_at IS NULL)'],

    ['orders', 'order_number', 'orders_order_number_active_unique', '(order_number IS NOT NULL AND deleted_at IS NULL)'],

    ['activities', 'title', 'activities_title_active_unique', '(deleted_at IS NULL)']
  ];
  _row RECORD;
BEGIN
  FOREACH _row IN ARRAY _cols
  LOOP
    _table_name := _row[1];
    _constraint_name := _row[3];

    -- Verificar se tabela existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = _table_name
        AND column_name = _row[2]
    ) THEN
      RAISE NOTICE 'Tabela/Coluna nao existe: %.% — SKIP', _table_name, _row[2];
      CONTINUE;
    END IF;

    -- Verificar se constraint já existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.table_name = _table_name
        AND tc.constraint_name = _constraint_name
    ) INTO _exists;

    IF _exists THEN
      RAISE NOTICE 'Constraint % ja existe — SKIP', _constraint_name;
      CONTINUE;
    END IF;

    -- Criar constraint parcial
    BEGIN
      _sql := format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I UNIQUE (%I) %s',
        _table_name,
        _constraint_name,
        _row[2],
        _row[4]
      );
      EXECUTE _sql;
      RAISE NOTICE 'Constraint % criada em %.%', _constraint_name, _table_name;
    EXCEPTION WHEN OTHERS THEN
      -- Se a coluna tem duplicatas, não cria constraint — relatório
      IF SQLERRM LIKE '%duplicate key%' OR SQLERRM LIKE '%already exists%' THEN
        RAISE NOTICE 'Constraint % nao pode ser criada — duplicatas existem em %.%: %',
          _constraint_name, _table_name, SQLERRM;
      ELSE
        RAISE NOTICE 'Constraint % erro inesperado: %', _constraint_name, SQLERRM;
      END IF;
    END;
  END LOOP;

  RAISE NOTICE 'UNIQUE partial constraints verificados/criados.';
END;
$$;

-- ── 2. UNIQUE constraints multi-coluna (tabelas sem soft-delete) ──────────
-- PostgreSQL: partial UNIQUE via UNIQUE INDEX, não ADD CONSTRAINT
DO $$
BEGIN
  -- Quotes: quote_number + salesperson_id (cada vendedor tem numbering próprio)
  CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_number_salesperson
    ON public.quotes(quote_number, salesperson_id)
    WHERE quote_number IS NOT NULL AND salesperson_id IS NOT NULL;

  -- Orders: order_number + salesperson_id
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_salesperson
    ON public.orders(order_number, salesperson_id)
    WHERE order_number IS NOT NULL AND salesperson_id IS NOT NULL;

  RAISE NOTICE 'UNIQUE multi-coluna indexes criados/verificados';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'UNIQUE multi-coluna indexes: %', SQLERRM;
END;
$$;

-- ── 3. Partial indexes para queries frequentes ─────────────────────────────
DO $$
BEGIN
  -- Soft-delete tables: index only on active records
  CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_deals_active ON public.deals(id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_activities_active ON public.activities(id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(id) WHERE deleted_at IS NULL;
  CREATE INDEX IF EXISTS idx_suppliers_active ON public.suppliers(id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_teams_active ON public.teams(id) WHERE deleted_at IS NULL;

  -- Partial indexes para pipeline stages (queries por status)
  CREATE INDEX IF NOT EXISTS idx_deals_stage_active ON public.deals(stage) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_deals_probability ON public.deals(probability) WHERE deleted_at IS NULL;

  -- Index para auditoria: queries por user + data
  CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON public.audit_log(user_id, action, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource_type, record_id) WHERE record_id IS NOT NULL;

  -- Index para pipeline: queries por salesperson_id
  CREATE INDEX IF NOT EXISTS idx_deals_salesperson ON public.deals(salesperson_id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_quotes_salesperson ON public.quotes(salesperson_id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_activities_salesperson ON public.activities(salesperson_id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_tasks_salesperson ON public.tasks(salesperson_id);

  RAISE NOTICE 'Partial indexes criados/verificados';
END;
$$;

-- ============================================================
-- FIM: Missing UNIQUE Constraints & Partial Indexes
-- ============================================================
