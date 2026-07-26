-- ============================================================
-- promo-champions-v2.1 — Remaining CHECK Constraints & Safe Defaults
-- Auditoria ETAPA 29-36 — Business Logic Validation
--
-- SIMULAÇÃO DE CENÁRIOS:
-- C1: UPDATE deals SET probability = 200 → violaria CHECK
--     → Constraint protege integridade do pipeline
-- C2: UPDATE quotes SET discount_pct = -10 → violaria CHECK
--     → Constraint protege margem do vendedor
-- C3: UPDATE lead_scores SET recency_score = 500 → violaria CHECK
--     → Constraint protege scoring engine
-- C4: ALTER TABLE ADD CONSTRAINT IF NOT EXISTS → safe to run twice
-- C5: Existing invalid data: constraint adicionada → migration FAILS
--     → Usar NOT VALID + VALIDATE depois (não bloqueia inserts)
-- ============================================================

DO $$
DECLARE
  _sql TEXT;
  _check_exists BOOLEAN;
  _has_invalid_data BOOLEAN;
  _cols TEXT[] := ARRAY[
    -- Tabela, Coluna, Constraint Name, Expressão CHECK, Tipo
    -- Deals
    ['deals', 'probability', 'deals_probability_range', 'probability >= 0 AND probability <= 100', 'validate'],
    ['deals', 'estimated_value', 'deals_estimated_value_non_negative', 'estimated_value >= 0', 'validate'],
    ['deals', 'weighted_value', 'deals_weighted_value_non_negative', 'weighted_value >= 0', 'validate'],

    -- Quotes
    ['quotes', 'discount_pct', 'quotes_discount_pct_range', 'discount_pct >= 0 AND discount_pct <= 100', 'validate'],
    ['quotes', 'subtotal', 'quotes_subtotal_non_negative', 'subtotal >= 0', 'validate'],
    ['quotes', 'tax_amount', 'quotes_tax_non_negative', 'tax_amount >= 0', 'validate'],
    ['quotes', 'shipping_amount', 'quotes_shipping_non_negative', 'shipping_amount >= 0', 'validate'],

    -- Orders
    ['orders', 'discount_amount', 'orders_discount_non_negative', 'discount_amount >= 0', 'validate'],
    ['orders', 'shipping_cost', 'orders_shipping_cost_non_negative', 'shipping_cost >= 0', 'validate'],

    -- Products
    ['products', 'min_order_qty', 'products_min_qty_positive', 'min_order_qty >= 1', 'validate'],
    ['products', 'reorder_point', 'products_reorder_point_non_negative', 'reorder_point >= 0', 'validate'],
    ['products', 'max_stock', 'products_max_stock_non_negative', 'max_stock >= 0', 'validate'],

    -- Lead Scores
    ['lead_scores', 'recency_score', 'lead_scores_recency_range', 'recency_score >= 0 AND recency_score <= 100', 'validate'],
    ['lead_scores', 'frequency_score', 'lead_scores_frequency_range', 'frequency_score >= 0 AND frequency_score <= 100', 'validate'],
    ['lead_scores', 'monetary_score', 'lead_scores_monetary_range', 'monetary_score >= 0 AND monetary_score <= 100', 'validate'],
    ['lead_scores', 'total_score', 'lead_scores_total_range', 'total_score >= 0 AND total_score <= 100', 'validate'],

    -- Activities
    ['activities', 'duration_minutes', 'activities_duration_positive', 'duration_minutes > 0', 'validate'],
    ['activities', 'contact_count', 'activities_contact_non_negative', 'contact_count >= 0', 'validate'],

    -- Cadences
    ['cadences', 'step_count', 'cadences_step_count_positive', 'step_count >= 1', 'validate'],

    -- Pipeline
    ['pipeline_stages', 'stage_order', 'pipeline_stage_order_positive', 'stage_order >= 0', 'validate'],
    ['pipeline_stages', 'probability_default', 'pipeline_prob_default_range', 'probability_default >= 0 AND probability_default <= 100', 'validate'],

    -- Race Gamification
    ['race_seasons', 'gold_per_win', 'race_gold_per_win_positive', 'gold_per_win >= 0', 'validate'],
    ['race_seasons', 'xp_per_win', 'race_xp_per_win_positive', 'xp_per_win >= 0', 'validate'],
    ['race_seasons', 'max_daily_gold', 'race_max_daily_gold_positive', 'max_daily_gold >= 0', 'validate'],

    -- Commissions
    ['commission_configs', 'rate_pct', 'commission_rate_range', 'rate_pct >= 0 AND rate_pct <= 100', 'validate'],
    ['commission_configs', 'min_threshold', 'commission_min_threshold_non_negative', 'min_threshold >= 0', 'validate'],

    -- Lead Routing
    ['lead_routing_rules', 'min_interval_hours', 'lead_routing_interval_positive', 'min_interval_hours >= 0', 'validate'],

    -- Coaching
    ['coaching_sessions', 'score', 'coaching_score_range', '(score IS NULL) OR (score >= 0 AND score <= 100)', 'validate'],

    -- Inventory
    ['inventory_levels', 'quantity', 'inventory_quantity_non_negative', 'quantity >= 0', 'validate'],
    ['inventory_levels', 'reserved_quantity', 'inventory_reserved_non_negative', 'reserved_quantity >= 0', 'validate'],
    ['inventory_levels', 'reorder_level', 'inventory_reorder_non_negative', 'reorder_level >= 0', 'validate'],

    -- Webhooks
    ['webhook_subscriptions', 'retry_attempts', 'webhook_retry_attempts_positive', 'retry_attempts >= 0', 'validate'],
    ['webhook_logs', 'attempt_count', 'webhook_log_attempts_positive', 'attempt_count >= 0', 'validate']
  ];
  _row RECORD;
BEGIN
  FOREACH _row IN ARRAY _cols
  LOOP
    -- Verificar se tabela existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = _row[1]
        AND column_name = _row[2]
    ) THEN
      RAISE NOTICE 'Tabela/Coluna nao existe: %.% — SKIP', _row[1], _row[2];
      CONTINUE;
    END IF;

    -- Verificar se constraint já existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.table_name = _row[1]
        AND tc.constraint_name = _row[3]
    ) INTO _check_exists;

    IF _check_exists THEN
      RAISE NOTICE 'Constraint % ja existe — SKIP', _row[3];
      CONTINUE;
    END IF;

    -- Verificar se há dados inválidos antes de adicionar constraint
    _has_invalid_data := FALSE;
    IF _row[5] = 'validate' THEN
      BEGIN
        EXECUTE format(
          'SELECT EXISTS (SELECT 1 FROM public.%I WHERE NOT (%s))',
          _row[1], _row[4]
        ) INTO _has_invalid_data;
      EXCEPTION WHEN OTHERS THEN
        -- Se a expressão falhar (e.g. col é NULL + expressão), pular
        RAISE NOTICE 'Nao foi possivel validar dados em %.% — SKIP', _row[1], _row[2];
        CONTINUE;
      END;
    END IF;

    IF _has_invalid_data THEN
      -- Adicionar como NOT VALID (não bloqueia novos dados, apenas marca)
      -- Depois validar em background
      BEGIN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%s) NOT VALID',
          _row[1], _row[3], _row[4]
        );
        RAISE NOTICE 'Constraint % adicionada como NOT VALID (dados invalidos existem)', _row[3];
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint % nao pode ser adicionada: %', _row[3], SQLERRM;
      END;
    ELSE
      -- Adicionar constraint normalmente
      BEGIN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%s)',
          _row[1], _row[3], _row[4]
        );
        RAISE NOTICE 'Constraint % adicionada em %.%', _row[3], _row[1];
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint % nao pode ser adicionada: %', _row[3], SQLERRM;
      END;
    END IF;
  END LOOP;

  RAISE NOTICE 'CHECK constraints business logic aplicados.';
END;
$$;

-- ── 2. Validar constraints NOT VALID em background (chunked) ──────────────
DO $$
DECLARE
  _constraint RECORD;
  _invalid_count INTEGER;
BEGIN
  FOR _constraint IN
    SELECT tc.table_name, tc.constraint_name, cc.consrc
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
      ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'CHECK'
      AND tc.constraint_name LIKE '%_range' OR tc.constraint_name LIKE '%_non_negative' OR tc.constraint_name LIKE '%_positive'
      -- Constraints pendentes de validação
  LOOP
    BEGIN
      -- Validar constraint
      EXECUTE format(
        'ALTER TABLE public.%I VALIDATE CONSTRAINT %I',
        _constraint.table_name, _constraint.constraint_name
      );
      RAISE NOTICE 'Constraint % validada', _constraint.constraint_name;
    EXCEPTION WHEN OTHERS THEN
      -- Count invalid rows for reporting
      BEGIN
        EXECUTE format(
          'SELECT count(*) FROM public.%I WHERE NOT (%s)',
          _constraint.table_name, _constraint.consrc
        ) INTO _invalid_count;
        RAISE NOTICE 'Constraint % tem % linhas invalidas — nao validada',
          _constraint.constraint_name, _invalid_count;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Nao foi possivel validar constraint %', _constraint.constraint_name;
      END;
    END;
  END LOOP;
END;
$$;

-- ============================================================
-- FIM: Remaining CHECK Constraints
-- ============================================================
