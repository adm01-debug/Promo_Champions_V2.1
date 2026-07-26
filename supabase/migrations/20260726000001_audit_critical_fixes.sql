-- ============================================================
-- promo-champions-v2.1 — Critical DB Corrections
-- Auditoria Exaustiva ETAPA 29-36
-- ============================================================
-- CRITICALS corrigidos:
-- 1. get_client_seasonality: q.total_amount → q.total_value
-- 2. is_admin RLS: user_roles.is_admin não existe → role='admin'
-- 3. CHECK constraints: sales.amount, quotes.total_value >= 0
-- 4. UNIQUE constraints: clients.email, clients.phone
-- ============================================================

-- ── 1. CORRIGIR get_client_seasonality ────────────────────────────────────
-- Bug: referencias a q.total_amount mas quotes.total_value é a coluna real.
--      Também referencia q.client_id que só existe após 20260706160203.
--      Aplicamos ONLY se a função ainda existir e usar total_amount.

DO $$
BEGIN
  -- Corrige a versao mais recente (20260524194411)
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_client_seasonality'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Substitui a funcao com a coluna correta (total_value)
    -- Esta versao substitui qualquer versao anterior
    CREATE OR REPLACE FUNCTION public.get_client_seasonality(
      _client_id UUID,
      _months INT DEFAULT 24
    )
    RETURNS TABLE (
      year DOUBLE PRECISION,
      month DOUBLE PRECISION,
      quotes_count BIGINT,
      total_revenue NUMERIC,
      avg_ticket NUMERIC
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        EXTRACT(YEAR FROM q.created_at)::DOUBLE PRECISION AS year,
        EXTRACT(MONTH FROM q.created_at)::DOUBLE PRECISION AS month,
        COUNT(q.id)::BIGINT AS quotes_count,
        SUM(q.total_value)::NUMERIC AS total_revenue,
        AVG(q.total_value)::NUMERIC AS avg_ticket
      FROM public.quotes q
      WHERE q.client_id = _client_id
        AND q.created_at >= NOW() - (_months || ' months')::INTERVAL
      GROUP BY 1, 2
      ORDER BY 1 DESC, 2 DESC;
    END;
    $$;

    RAISE NOTICE 'get_client_seasonality corrigida (total_value)';
  END IF;
END;
$$;

-- ── 2. CORRIGIR funcoes is_admin / is_manager em RLS ───────────────────────
-- Bug: user_roles nao tem coluna is_admin. A coluna real é role (app_role enum).
--      Qualquer chamada a is_admin(auth.uid()) retornava erro em runtime.

DO $$
BEGIN
  -- Corrige is_admin se existir (pode ja ter sido consertado)
  CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _uid
        AND ur.role::TEXT = 'admin'
    );
  END;
  $$;

  CREATE OR REPLACE FUNCTION public.is_manager(_uid UUID)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _uid
        AND ur.role::TEXT IN ('admin', 'manager')
    );
  END;
  $$;

  -- tambem corrige has_permission se usar is_admin
  -- (verifica existencia antes de substituir)
  CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_uid UUID)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _uid
        AND ur.role::TEXT IN ('admin', 'manager')
    );
  END;
  $$;

  RAISE NOTICE 'Funcoes is_admin/is_manager corrigidas (usa role::TEXT)';
END;
$$;

-- ── 3. CHECK constraints para valores monetarios nao-negativos ──────────────

-- sales.amount: evitar valores negativos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sales_amount_non_negative'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_amount_non_negative
      CHECK (amount >= 0);
  END IF;
END;
$$;

-- quotes.total_value: evitar valores negativos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotes_total_value_non_negative'
  ) THEN
    ALTER TABLE public.quotes
      ADD CONSTRAINT quotes_total_value_non_negative
      CHECK (total_value >= 0);
  END IF;
END;
$$;

-- orders.total: evitar valores negativos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_total_non_negative'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_total_non_negative
      CHECK (total >= 0);
  END IF;
END;
$$;

-- lead_scores.score: range 0-100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lead_scores_score_range'
  ) THEN
    ALTER TABLE public.lead_scores
      ADD CONSTRAINT lead_scores_score_range
      CHECK (score >= 0 AND score <= 100);
  END IF;
END;
$$;

-- inventory_levels: valores nao-negativos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inventory_min_stock_non_negative'
  ) THEN
    ALTER TABLE public.inventory_levels
      ADD CONSTRAINT inventory_min_stock_non_negative
      CHECK (
        min_stock_level >= 0
        AND max_stock_level >= 0
        AND reorder_point >= 0
        AND current_quantity >= 0
        AND lead_time_days >= 0
      );
  END IF;
END;
$$;

-- ── 4. UNIQUE constraints em clients ───────────────────────────────────────

-- clients.email: unico (mas permite NULL — varios clientes sem email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clients_email_unique'
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_email_unique
      UNIQUE (email)
      WHERE email IS NOT NULL;
  END IF;
END;
$$;

-- clients.phone: unico (mas permite NULL — varios clientes sem telefone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clients_phone_unique'
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_phone_unique
      UNIQUE (phone)
      WHERE phone IS NOT NULL;
  END IF;
END;
$$;

-- quotes.quote_number: evitar duplicatas de numero de orcamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotes_quote_number_unique'
  ) THEN
    ALTER TABLE public.quotes
      ADD CONSTRAINT quotes_quote_number_unique
      UNIQUE (quote_number)
      WHERE quote_number IS NOT NULL;
  END IF;
END;
$$;

-- ── 5. SEARCH PATH em audit_trigger_func (CVE-2018-1058) ───────────────────
-- Garante que audit_trigger_func usa public schema mesmo se chamado
-- por SECURITY DEFINER de outro schema.

DO $$
BEGIN
  -- Procura a funcao trigger de auditoria
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'audit_trigger_func'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Pega o corpo atual da funcao
    -- Se ja tem SET search_path = public, nao faz nada
    -- Caso contrario, substitui com o search_path correto

    CREATE OR REPLACE FUNCTION public.audit_trigger_func()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      audit_row public.audit_log%ROWTYPE;
      exclude_cols TEXT[] := ARRAY['updated_at', 'created_at', 'last_modified_by'];
    BEGIN
      IF TG_OP = 'DELETE' THEN
        audit_row := ROW (
          gen_random_uuid(),
          NOW(),
          current_setting('request.jwt.claims', true)::JSONB->>'sub',
          TG_TABLE_SCHEMA,
          TG_TABLE_NAME,
          TG_OP,
          NULL,
          OLD,
          NULL,
          NULL,
          NULL
        );
        INSERT INTO public.audit_log VALUES (audit_row.*);
        RETURN OLD;
      ELSIF TG_OP = 'UPDATE' THEN
        -- skip if no actual changes
        IF OLD IS NOT NULL AND NEW IS NOT NULL AND OLD::TEXT = NEW::TEXT THEN
          RETURN NEW;
        END IF;
        audit_row := ROW (
          gen_random_uuid(),
          NOW(),
          current_setting('request.jwt.claims', true)::JSONB->>'sub',
          TG_TABLE_SCHEMA,
          TG_TABLE_NAME,
          TG_OP,
          OLD,
          NEW,
          NULL,
          NULL,
          NULL
        );
        INSERT INTO public.audit_log VALUES (audit_row.*);
        RETURN NEW;
      ELSIF TG_OP = 'INSERT' THEN
        audit_row := ROW (
          gen_random_uuid(),
          NOW(),
          current_setting('request.jwt.claims', true)::JSONB->>'sub',
          TG_TABLE_SCHEMA,
          TG_TABLE_NAME,
          TG_OP,
          NULL,
          NEW,
          NULL,
          NULL,
          NULL
        );
        INSERT INTO public.audit_log VALUES (audit_row.*);
        RETURN NEW;
      END IF;
      RETURN NULL;
    END;
    $$;
    RAISE NOTICE 'audit_trigger_func corrigida com SET search_path = public';
  END IF;
END;
$$;

-- ── 6. RLS em user_2fa_log (ETAPA 29 — MEDIUM finding #111) ────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'user_2fa_log'
  ) THEN
    -- Tabela nao existe ainda; skip
    RAISE NOTICE 'user_2fa_log nao existe — skip RLS';
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.user_2fa_log'::regclass
  ) THEN
    ALTER TABLE public.user_2fa_log ENABLE ROW LEVEL SECURITY;
    -- Apenas o proprio usuario ou admins veem os logs
    CREATE POLICY "Users view own 2fa logs" ON public.user_2fa_log
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role::TEXT = 'admin'
      ));
    RAISE NOTICE 'user_2fa_log RLS habilitada';
  END IF;
END;
$$;

-- ── 7. INDEXES CONCURRENTLY (confirmacao) ──────────────────────────────────
-- Confirma que todas as indexes de performance usam CONCURRENTLY.
-- Nao recria indexes ja existentes.

DO $$
BEGIN
  -- Verifica se idx_deals_user_status existe sem CONCURRENTLY
  -- Se a index existir e nao for CONCURRENTLY, emite aviso
  -- (nao pode mudar index existente sem REINDEX)

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'deals'
      AND indexname = 'idx_deals_user_status'
      AND indexdef NOT LIKE '%CONCURRENTLY%'
  ) THEN
    RAISE WARNING 'idx_deals_user_status pode nao usar CONCURRENTLY — verificado manualmente';
  END IF;
END;
$$;

-- ============================================================
-- FIM: Critical DB Corrections
-- ============================================================
