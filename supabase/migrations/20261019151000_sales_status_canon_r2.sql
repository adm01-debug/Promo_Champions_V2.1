-- [STATUS-CANON-R2] Canonização residual de sales.status e fuso do mês de
-- negócio (America/Sao_Paulo).
--
-- Vocabulário canônico (migration 20261001220100 + _shared/sale-statuses.ts):
--   WON  = ('completed','won','closed')   -- 'completed' manual + aliases Bitrix
--   LOST = ('lost','cancelled')
--   aberto = todo o resto do CHECK sales_status_check (lead, prospecting,
--            qualified, proposal, negotiation, pending)
--
-- 1) win_rate_breakdown: 'won'/'closed' eram invisíveis — nem numerador nem
--    denominador os contavam.
-- 2) compute_pipeline_inspection e check_sla_violations: 'won'/'closed'
--    entravam como abertas (NOT IN só excluía completed/lost/cancelled).
-- 3) route_unassigned_client_portfolio (top_performer) e auto_assign_lead
--    (least_loaded + top_performer): 'closed' fora do conjunto de vitória;
--    boundary do mês em UTC.
-- 4) get_semantic_coverage: bucket 'deal' sem 'pending'/'completed'/'cancelled'
--    — cobertura contava só parte das vendas em estágio de deal.
-- 5) compute_salesperson_retention_cohort, get_client_purchase_heatmap,
--    get_purchase_intelligence_summary e client_purchase_seasonality:
--    status='won' ignorava o alias principal 'completed' (a métrica ficava
--    quase zerada — quase toda venda ganha é gravada como 'completed').
-- 6) broadcast_sale_completed: só disparava para status='completed'; vendas
--    'won'/'closed' nunca broadcastavam. Alinhado ao deal_status gerado
--    (mapeia WON → 'completed'), mesmo critério de tr_notify_sale_victory.
-- 7) revenue_forecast_view: incluía vendedores inativos — outer SELECT passa
--    a exigir salespeople.is_active (alinha com mv_competitive_ranking).
-- 8) Fuso do mês de negócio: boundary em UTC divergia das edge functions
--    (toBusinessMonthStart = America/Sao_Paulo) na virada de mês. Corrigidos:
--    route_unassigned_client_portfolio, auto_assign_lead,
--    compute_salesperson_retention_cohort, get_client_purchase_heatmap,
--    award_bonus_if_eligible (chave period_month) e notify_sale_completion
--    (dormante — trigger tr_notify_sale_completion foi dropada em
--    20260512213243; corpo canonizado para não reintroduzir o gap se religada).
-- 9) RPCs mortas (sem nenhum chamador em src/, supabase/functions/ ou
--    scripts/ — verificado no HEAD): get_revenue_forecast,
--    get_detailed_kpis e calculate_performance_pace (quebrada — chama
--    helpers inexistentes start_of_month/end_of_month). Removidas em vez de
--    canonizadas: manter RPC errada acessível via PostgREST é pior que nenhuma.
--    As entradas em src/integrations/supabase/types.ts são geradas e ficam
--    para a próxima regeneração do arquivo.

-- ════════════════════════════════════════════════════════════════════════
-- 1) win_rate_breakdown — WON completo no numerador e no denominador
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.win_rate_breakdown(_dimension text DEFAULT 'category', _days integer DEFAULT 180)
RETURNS TABLE(
  segment text,
  total_deals integer,
  won_deals integer,
  lost_deals integer,
  win_rate numeric,
  avg_deal_size numeric,
  total_revenue numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _col text;
BEGIN
  _col := CASE _dimension
    WHEN 'source' THEN 'source'
    WHEN 'product' THEN 'product_name'
    ELSE 'category'
  END;

  RETURN QUERY EXECUTE format($f$
    SELECT
      COALESCE(%I::text, 'unknown'),
      COUNT(*)::integer,
      -- WON canônico: completed + aliases won/closed
      COUNT(*) FILTER (WHERE status IN ('completed','won','closed'))::integer,
      COUNT(*) FILTER (WHERE status IN ('lost','cancelled'))::integer,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','won','closed','lost','cancelled')) > 0
        THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('completed','won','closed'))::numeric
          / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','won','closed','lost','cancelled')),0), 1)
        ELSE 0 END,
      COALESCE(AVG(amount) FILTER (WHERE status IN ('completed','won','closed')), 0)::numeric,
      COALESCE(SUM(amount) FILTER (WHERE status IN ('completed','won','closed')), 0)::numeric
    FROM public.sales
    WHERE created_at >= now() - ($1 || ' days')::interval
      AND (public.is_admin_or_manager(auth.uid()) OR salesperson_id = public.get_current_salesperson_id())
    GROUP BY %I
    ORDER BY 7 DESC
    LIMIT 50
  $f$, _col, _col) USING _days;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 2) compute_pipeline_inspection — won/closed não são pipeline aberto
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.compute_pipeline_inspection()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _r RECORD;
  _flags jsonb;
  _last_act timestamptz;
  _days_act integer;
  _days_stage integer;
  _count integer := 0;
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR _r IN
    SELECT id, status, updated_at, salesperson_id
    FROM public.sales
    -- aberto = fora de WON ('completed','won','closed') + LOST ('lost','cancelled')
    WHERE status NOT IN ('completed','won','closed','lost','cancelled')
  LOOP
    _flags := '[]'::jsonb;
    _days_stage := EXTRACT(epoch FROM (now() - _r.updated_at))::integer / 86400;

    SELECT MAX(created_at) INTO _last_act FROM public.activities WHERE sale_id = _r.id;
    _days_act := CASE WHEN _last_act IS NULL THEN NULL ELSE EXTRACT(epoch FROM (now() - _last_act))::integer / 86400 END;

    IF _days_stage > 14 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','stale_stage','severity','high','days',_days_stage)); END IF;
    IF _days_act IS NULL OR _days_act > 7 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_recent_activity','severity','medium','days',_days_act)); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.buying_committee_members WHERE sale_id = _r.id AND committee_role IN ('decision_maker','champion')) THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_decision_maker','severity','high'));
    END IF;
    IF (SELECT COUNT(*) FROM public.buying_committee_members WHERE sale_id = _r.id) <= 1 THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','single_threaded','severity','medium'));
    END IF;

    INSERT INTO public.pipeline_inspection_snapshots
      (sale_id, stage, days_in_stage, last_activity_at, days_since_activity, risk_flags)
    VALUES (_r.id, _r.status, _days_stage, _last_act, _days_act, _flags);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 3) check_sla_violations — won/closed não violam SLA de abertas
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_sla_violations()
RETURNS TABLE(processed INTEGER, new_warnings INTEGER, new_violations INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row RECORD;
  _hours NUMERIC;
  _new_status TEXT;
  _processed INT := 0;
  _warnings INT := 0;
  _violations INT := 0;
BEGIN
  FOR _row IN
    SELECT s.id AS sale_id, s.stage, s.updated_at, p.id AS policy_id, p.max_hours, p.warning_hours
    FROM public.sales s
    JOIN public.sla_policies p ON p.stage = s.stage AND p.is_active = true
    -- aberto = fora de WON + LOST (aliases 'won'/'closed' não são mais abertas)
    WHERE s.status NOT IN ('completed', 'won', 'closed', 'lost', 'cancelled')
  LOOP
    _processed := _processed + 1;
    _hours := EXTRACT(EPOCH FROM (now() - _row.updated_at)) / 3600.0;

    IF _hours >= _row.max_hours THEN
      _new_status := 'violated';
    ELSIF _hours >= _row.warning_hours THEN
      _new_status := 'warning';
    ELSE
      CONTINUE;
    END IF;

    INSERT INTO public.sla_violations (sale_id, policy_id, stage, hours_in_stage, status)
    VALUES (_row.sale_id, _row.policy_id, _row.stage, _hours, _new_status)
    ON CONFLICT DO NOTHING;

    IF _new_status = 'warning' THEN _warnings := _warnings + 1;
    ELSE _violations := _violations + 1; END IF;
  END LOOP;

  RETURN QUERY SELECT _processed, _warnings, _violations;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 4) route_unassigned_client_portfolio — top_performer com WON completo e
--    mês corrente no fuso de negócio
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.route_unassigned_client_portfolio(
  p_client_id uuid,
  p_strategy text,
  p_salesperson_id uuid DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS TABLE (
  portfolio_id uuid,
  assigned_to uuid,
  strategy_used text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.client_portfolio%ROWTYPE;
  v_target uuid;
  v_portfolio_id uuid;
  v_actor_salesperson_id uuid;
  v_strategy text := lower(trim(p_strategy));
  v_reason text;
BEGIN
  IF auth.role() <> 'service_role'
    AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'Apenas administradores e gestores podem rotear clientes'
      USING ERRCODE = '42501';
  END IF;

  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'client_id é obrigatório' USING ERRCODE = '22023';
  END IF;

  IF v_strategy NOT IN ('manual', 'round_robin', 'least_loaded', 'top_performer') THEN
    RAISE EXCEPTION 'Estratégia de roteamento inválida: %', p_strategy
      USING ERRCODE = '22023';
  END IF;

  IF v_strategy = 'manual' AND p_salesperson_id IS NULL THEN
    RAISE EXCEPTION 'salesperson_id é obrigatório para atribuição manual'
      USING ERRCODE = '22023';
  END IF;

  -- Serializa tentativas concorrentes para o mesmo cliente, inclusive quando
  -- ainda não existe uma linha de carteira para bloquear com FOR UPDATE.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'route_unassigned_client_portfolio:' || p_client_id::text,
    0
  ));

  PERFORM 1 FROM public.clients WHERE id = p_client_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente não encontrado' USING ERRCODE = 'P0002';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.client_portfolio
  WHERE client_id = p_client_id
  ORDER BY assigned_at DESC, created_at DESC, id DESC
  LIMIT 1;

  -- Repetições do mesmo pedido são idempotentes. Uma tentativa manual para
  -- outro vendedor falha de forma explícita em vez de criar dupla carteira.
  IF FOUND THEN
    IF v_strategy = 'manual'
      AND p_salesperson_id IS DISTINCT FROM v_existing.salesperson_id THEN
      RAISE EXCEPTION 'Cliente já possui uma carteira; use o fluxo explícito de transferência'
        USING ERRCODE = 'P0001';
    END IF;

    RETURN QUERY
      SELECT v_existing.id,
             v_existing.salesperson_id,
             COALESCE(v_existing.source, 'already_assigned');
    RETURN;
  END IF;

  -- As estratégias que dependem da carga global precisam ser serializadas
  -- entre clientes distintos; sem isto duas requisições podem escolher o mesmo
  -- vendedor a partir da mesma fotografia de carga.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'route_unassigned_client_portfolio:strategy:' || v_strategy,
    0
  ));

  IF v_strategy = 'manual' THEN
    v_target := p_salesperson_id;
  ELSIF v_strategy = 'round_robin' THEN
    SELECT s.id
    INTO v_target
    FROM public.salespeople AS s
    LEFT JOIN public.client_portfolio AS cp ON cp.salesperson_id = s.id
    WHERE s.is_active IS TRUE
      AND s.role IN ('closer', 'hybrid')
    GROUP BY s.id
    ORDER BY MAX(cp.assigned_at) NULLS FIRST, s.id
    LIMIT 1;
  ELSIF v_strategy = 'least_loaded' THEN
    SELECT s.id
    INTO v_target
    FROM public.salespeople AS s
    LEFT JOIN public.client_portfolio AS cp ON cp.salesperson_id = s.id
    WHERE s.is_active IS TRUE
      AND s.role IN ('closer', 'hybrid')
    GROUP BY s.id
    ORDER BY COUNT(cp.id) FILTER (WHERE cp.status = 'active') ASC, s.id
    LIMIT 1;
  ELSIF v_strategy = 'top_performer' THEN
    SELECT s.id
    INTO v_target
    FROM public.salespeople AS s
    LEFT JOIN public.sales AS sa
      ON sa.salesperson_id = s.id
      -- WON canônico ('won'/'completed'/'closed'); mês no fuso de negócio
      AND sa.status IN ('completed', 'won', 'closed')
      AND sa.created_at >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
    WHERE s.is_active IS TRUE
      AND s.role IN ('closer', 'hybrid')
    GROUP BY s.id
    ORDER BY COALESCE(SUM(sa.amount), 0) DESC, s.id
    LIMIT 1;
  END IF;

  IF v_target IS NULL THEN
    RAISE EXCEPTION 'Nenhum closer ou híbrido ativo está disponível para roteamento'
      USING ERRCODE = 'P0001';
  END IF;

  PERFORM 1
  FROM public.salespeople
  WHERE id = v_target
    AND is_active IS TRUE
    AND role IN ('closer', 'hybrid');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendedor de destino inválido ou inativo'
      USING ERRCODE = '22023';
  END IF;

  v_actor_salesperson_id := public.get_current_salesperson_id();
  v_reason := COALESCE(
    NULLIF(left(trim(COALESCE(p_reason, '')), 500), ''),
    'Atribuição de carteira: ' || v_strategy
  );

  INSERT INTO public.client_portfolio (
    client_id,
    salesperson_id,
    assigned_by,
    source,
    status
  ) VALUES (
    p_client_id,
    v_target,
    v_actor_salesperson_id,
    v_strategy,
    'active'
  )
  RETURNING id INTO v_portfolio_id;

  INSERT INTO public.lead_routing_log (
    client_id,
    to_salesperson_id,
    routing_reason
  ) VALUES (
    p_client_id,
    v_target,
    v_reason
  );

  RETURN QUERY SELECT v_portfolio_id, v_target, v_strategy;
END;
$$;

REVOKE ALL ON FUNCTION public.route_unassigned_client_portfolio(uuid, text, uuid, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.route_unassigned_client_portfolio(uuid, text, uuid, text)
  TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
-- 5) auto_assign_lead — least_loaded exclui WON+LOST; top_performer conta WON
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.auto_assign_lead(_sale_id uuid)
RETURNS TABLE(assigned_to uuid, strategy text, rule_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule public.lead_routing_rules%ROWTYPE;
  v_sale public.sales%ROWTYPE;
  v_existing public.lead_assignments%ROWTYPE;
  v_chosen uuid;
BEGIN
  IF auth.role() <> 'service_role'
    AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'Apenas administradores e gestores podem atribuir leads'
      USING ERRCODE = '42501';
  END IF;

  IF _sale_id IS NULL THEN
    RAISE EXCEPTION 'sale_id é obrigatório' USING ERRCODE = '22023';
  END IF;

  -- Evita que duas atribuições simultâneas escolham o mesmo vendedor a partir
  -- da mesma carga. O lock da venda garante idempotência da chamada repetida.
  PERFORM pg_advisory_xact_lock(hashtextextended('auto_assign_lead', 0));

  SELECT *
  INTO v_sale
  FROM public.sales
  WHERE id = _sale_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada' USING ERRCODE = 'P0002';
  END IF;

  IF v_sale.salesperson_id IS NOT NULL THEN
    SELECT *
    INTO v_existing
    FROM public.lead_assignments
    WHERE sale_id = _sale_id
    ORDER BY assigned_at DESC, id DESC
    LIMIT 1;

    RETURN QUERY
      SELECT v_sale.salesperson_id,
             COALESCE(v_existing.strategy_used, 'already_assigned'),
             v_existing.rule_id;
    RETURN;
  END IF;

  SELECT *
  INTO v_rule
  FROM public.lead_routing_rules
  WHERE is_active IS TRUE
    AND (filter_min_value IS NULL OR v_sale.amount >= filter_min_value)
    AND (filter_source IS NULL OR filter_source = v_sale.source)
  ORDER BY priority ASC, created_at ASC, id ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nenhuma regra ativa é compatível com a venda'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_rule.strategy = 'round_robin' THEN
    SELECT s.id
    INTO v_chosen
    FROM public.salespeople AS s
    LEFT JOIN public.lead_assignments AS la ON la.salesperson_id = s.id
    WHERE s.is_active IS TRUE
    GROUP BY s.id
    ORDER BY MAX(la.assigned_at) NULLS FIRST, s.id
    LIMIT 1;
  ELSIF v_rule.strategy = 'least_loaded' THEN
    SELECT s.id
    INTO v_chosen
    FROM public.salespeople AS s
    LEFT JOIN public.sales AS sa
      ON sa.salesperson_id = s.id
      -- carga = vendas abertas (fora de WON + LOST)
      AND sa.status NOT IN ('completed', 'won', 'closed', 'lost', 'cancelled')
    WHERE s.is_active IS TRUE
    GROUP BY s.id
    ORDER BY COUNT(sa.id) ASC, s.id
    LIMIT 1;
  ELSIF v_rule.strategy = 'top_performer' THEN
    SELECT s.id
    INTO v_chosen
    FROM public.salespeople AS s
    LEFT JOIN public.sales AS sa
      ON sa.salesperson_id = s.id
      -- WON canônico: completed + aliases won/closed
      AND sa.status IN ('completed', 'won', 'closed')
    WHERE s.is_active IS TRUE
    GROUP BY s.id
    ORDER BY COALESCE(SUM(sa.amount), 0) DESC, s.id
    LIMIT 1;
  ELSE
    RAISE EXCEPTION 'Estratégia de regra não suportada: %', v_rule.strategy
      USING ERRCODE = '22023';
  END IF;

  IF v_chosen IS NULL THEN
    RAISE EXCEPTION 'Nenhum vendedor ativo está disponível para atribuição'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales
  SET salesperson_id = v_chosen
  WHERE id = _sale_id
    AND salesperson_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'A venda já foi atribuída por outra operação'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.lead_assignments (
    sale_id,
    salesperson_id,
    rule_id,
    strategy_used
  ) VALUES (
    _sale_id,
    v_chosen,
    v_rule.id,
    v_rule.strategy
  );

  RETURN QUERY SELECT v_chosen, v_rule.strategy, v_rule.id;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_assign_lead(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auto_assign_lead(uuid) TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
-- 6) get_semantic_coverage — bucket 'deal' cobre todo o restante do funil
-- ════════════════════════════════════════════════════════════════════════
-- Decisão documentada: 'lead' = estágios iniciais (lead/prospecting/qualified);
-- 'deal' = proposal, negotiation e pending (deal aberto) + terminais
-- (completed/won/closed/lost/cancelled) — a cobertura mede vendas que já
-- viraram negócio, independentemente do desfecho.

CREATE OR REPLACE FUNCTION public.get_semantic_coverage()
RETURNS TABLE(
  entity_type text,
  total_rows bigint,
  indexed_rows bigint,
  coverage_pct numeric,
  last_indexed timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT 'client'::text AS et, (SELECT count(*) FROM public.clients) AS total
    UNION ALL SELECT 'lead', (SELECT count(*) FROM public.sales WHERE status IN ('lead','prospecting','qualified'))
    UNION ALL SELECT 'deal', (SELECT count(*) FROM public.sales WHERE status IN ('proposal','negotiation','pending','completed','won','closed','lost','cancelled'))
    UNION ALL SELECT 'activity', (SELECT count(*) FROM public.activities)
    UNION ALL SELECT 'call_recording', (SELECT count(*) FROM public.call_recordings)
  ),
  idx AS (
    SELECT entity_type AS et, count(*) AS indexed, max(updated_at) AS last_at
    FROM public.semantic_index
    GROUP BY entity_type
  )
  SELECT
    b.et,
    b.total,
    COALESCE(i.indexed, 0),
    CASE WHEN b.total = 0 THEN 100::numeric
         ELSE ROUND((COALESCE(i.indexed,0)::numeric / b.total::numeric) * 100, 1)
    END,
    i.last_at
  FROM base b
  LEFT JOIN idx i ON i.et = b.et
  ORDER BY b.et;
END;
$$;

REVOKE ALL ON FUNCTION public.get_semantic_coverage() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_semantic_coverage() TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 7) compute_salesperson_retention_cohort — WON completo + mês no fuso SP
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.compute_salesperson_retention_cohort(
  _months_back INT DEFAULT 12
)
RETURNS TABLE (
  cohort_month DATE,
  cohort_size INT,
  month_offset INT,
  retained INT,
  retention_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH first_won AS (
    SELECT
      s.salesperson_id,
      -- mês do cohort no fuso de negócio (America/Sao_Paulo)
      date_trunc('month', MIN(s.created_at) AT TIME ZONE 'America/Sao_Paulo')::date AS cohort_month
    FROM public.sales s
    -- WON canônico: completed + aliases won/closed
    WHERE s.status IN ('completed', 'won', 'closed') AND s.salesperson_id IS NOT NULL
    GROUP BY s.salesperson_id
  ),
  cohort_sizes AS (
    SELECT cohort_month, COUNT(*)::int AS cohort_size
    FROM first_won
    GROUP BY cohort_month
  ),
  activity AS (
    SELECT DISTINCT
      fw.cohort_month,
      fw.salesperson_id,
      (EXTRACT(YEAR FROM AGE(date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo'), fw.cohort_month))::int * 12 +
       EXTRACT(MONTH FROM AGE(date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo'), fw.cohort_month))::int) AS month_offset
    FROM first_won fw
    JOIN public.sales s
      ON s.salesperson_id = fw.salesperson_id
     AND s.status IN ('completed', 'won', 'closed')
     AND s.created_at >= fw.cohort_month
  ),
  retained_counts AS (
    SELECT cohort_month, month_offset, COUNT(*)::int AS retained
    FROM activity
    WHERE month_offset BETWEEN 0 AND 11
    GROUP BY cohort_month, month_offset
  )
  SELECT
    cs.cohort_month,
    cs.cohort_size,
    rc.month_offset,
    rc.retained,
    ROUND((rc.retained::numeric / NULLIF(cs.cohort_size, 0)) * 100, 1) AS retention_pct
  FROM cohort_sizes cs
  JOIN retained_counts rc USING (cohort_month)
  WHERE cs.cohort_month >= (date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') - (_months_back || ' months')::interval)::date
  ORDER BY cs.cohort_month DESC, rc.month_offset ASC;
$$;

REVOKE EXECUTE ON FUNCTION public.compute_salesperson_retention_cohort(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_salesperson_retention_cohort(INT) TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
-- 8) get_client_purchase_heatmap / get_purchase_intelligence_summary /
--    client_purchase_seasonality — WON completo + boundary no fuso SP
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_client_purchase_heatmap(
  _client_id uuid DEFAULT NULL,
  _months int DEFAULT 24
)
RETURNS TABLE (
  client_id uuid,
  client_name text,
  month_start date,
  salesperson_id uuid,
  salesperson_name text,
  is_current_user boolean,
  deal_count bigint,
  revenue numeric,
  won_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  -- janela inicial = 1º dia do mês corrente no fuso de negócio
  _start date := (date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') - (_months || ' months')::interval)::date;
BEGIN
  RETURN QUERY
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS month_start,
    s.salesperson_id,
    sp.name AS salesperson_name,
    (s.salesperson_id = _uid) AS is_current_user,
    COUNT(*)::bigint AS deal_count,
    COALESCE(SUM(s.amount), 0)::numeric AS revenue,
    -- WON canônico: completed + aliases won/closed
    COUNT(*) FILTER (WHERE s.status IN ('completed', 'won', 'closed'))::bigint AS won_count
  FROM public.sales s
  JOIN public.clients c ON c.name = s.client_name
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.created_at >= _start
    AND (_client_id IS NULL OR c.id = _client_id)
    AND (
      _is_privileged
      OR EXISTS (
        SELECT 1 FROM public.sales s2
        WHERE s2.client_name = c.name AND s2.salesperson_id = _uid
      )
    )
  GROUP BY c.id, c.name, date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo'), s.salesperson_id, sp.name
  ORDER BY month_start DESC, revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_purchase_intelligence_summary(
  _client_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  _client_name text;
  _result jsonb;
  _total_purchases int;
  _total_revenue numeric;
  _avg_ticket numeric;
  _last_date timestamptz;
  _avg_cycle numeric;
  _share_me numeric;
  _share_others numeric;
  _top_competitor jsonb;
  _predicted_next date;
BEGIN
  SELECT name INTO _client_name FROM public.clients WHERE id = _client_id;
  IF _client_name IS NULL THEN
    RETURN jsonb_build_object('error', 'client_not_found');
  END IF;

  -- access check
  IF NOT _is_privileged THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.sales WHERE client_name = _client_name AND salesperson_id = _uid
    ) THEN
      RETURN jsonb_build_object('error', 'forbidden');
    END IF;
  END IF;

  -- WON canônico: completed + aliases won/closed
  SELECT
    COUNT(*)::int,
    COALESCE(SUM(amount), 0)::numeric,
    COALESCE(AVG(amount), 0)::numeric,
    MAX(created_at)
  INTO _total_purchases, _total_revenue, _avg_ticket, _last_date
  FROM public.sales
  WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed');

  -- avg cycle (days between consecutive won purchases)
  WITH ordered AS (
    SELECT created_at,
           LAG(created_at) OVER (ORDER BY created_at) AS prev_dt
    FROM public.sales
    WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed')
  )
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - prev_dt)) / 86400.0), 0)
  INTO _avg_cycle
  FROM ordered
  WHERE prev_dt IS NOT NULL;

  -- shares
  SELECT
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id = _uid), 0) / _total_revenue * 100
    ELSE 0 END,
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id <> _uid OR salesperson_id IS NULL), 0) / _total_revenue * 100
    ELSE 0 END
  INTO _share_me, _share_others
  FROM public.sales
  WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed');

  -- top internal competitor (other salesperson with most revenue)
  SELECT jsonb_build_object(
    'salesperson_id', sp.id,
    'salesperson_name', sp.name,
    'revenue', SUM(s.amount)::numeric,
    'deal_count', COUNT(*)::int
  )
  INTO _top_competitor
  FROM public.sales s
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.client_name = _client_name
    AND s.status IN ('completed', 'won', 'closed')
    AND (s.salesperson_id IS DISTINCT FROM _uid)
  GROUP BY sp.id, sp.name
  ORDER BY SUM(s.amount) DESC NULLS LAST
  LIMIT 1;

  -- naive predicted next purchase = last + avg_cycle
  IF _last_date IS NOT NULL AND _avg_cycle > 0 THEN
    _predicted_next := (_last_date + (_avg_cycle || ' days')::interval)::date;
  END IF;

  _result := jsonb_build_object(
    'client_id', _client_id,
    'client_name', _client_name,
    'total_purchases', _total_purchases,
    'total_revenue', _total_revenue,
    'avg_ticket', _avg_ticket,
    'avg_cycle_days', ROUND(_avg_cycle, 1),
    'last_purchase_date', _last_date,
    'share_with_me_pct', ROUND(_share_me, 1),
    'share_with_others_pct', ROUND(_share_others, 1),
    'top_competitor_internal', _top_competitor,
    'predicted_next_purchase_date', _predicted_next,
    'days_since_last_purchase',
      CASE WHEN _last_date IS NOT NULL
        THEN EXTRACT(EPOCH FROM (now() - _last_date))::int / 86400
        ELSE NULL END,
    'computed_at', now()
  );

  RETURN _result;
END;
$$;

CREATE OR REPLACE VIEW public.client_purchase_seasonality
WITH (security_invoker = true)
AS
SELECT
  c.id AS client_id,
  c.name AS client_name,
  EXTRACT(MONTH FROM s.created_at)::int AS month_of_year,
  EXTRACT(DOW FROM s.created_at)::int AS day_of_week,
  COUNT(*)::int AS deal_count,
  COALESCE(AVG(s.amount), 0)::numeric AS avg_revenue,
  COALESCE(SUM(s.amount), 0)::numeric AS total_revenue
FROM public.sales s
JOIN public.clients c ON c.name = s.client_name
-- WON canônico: completed + aliases won/closed
WHERE s.status IN ('completed', 'won', 'closed')
GROUP BY c.id, c.name, EXTRACT(MONTH FROM s.created_at), EXTRACT(DOW FROM s.created_at);

GRANT EXECUTE ON FUNCTION public.get_client_purchase_heatmap(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchase_intelligence_summary(uuid) TO authenticated;
GRANT SELECT ON public.client_purchase_seasonality TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 9) broadcast_sale_completed — dispara para qualquer WON via deal_status
--    (coluna gerada já mapeia completed/won/closed → 'completed'; mesmo
--    critério de tr_notify_sale_victory)
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_payload jsonb;
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  -- deal_status (gerada) = 'completed' para todo o trio canônico WON —
  -- vendas 'won'/'closed' também broadcastam.
  IF NEW.deal_status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Dispara apenas na transição para 'completed' (INSERT ou UPDATE que muda
  -- o status). Se o enqueue falhar, a venda fica com broadcast_sent_at nulo e
  -- o erro em edge_call_failures — sem re-tentar a cada update posterior.
  IF TG_OP = 'UPDATE' AND OLD.deal_status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Evita rebroadcast da mesma venda já entregue.
  IF NEW.broadcast_sent_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- A edge function lê os dados da venda no banco; o corpo carrega só o id.
  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/broadcast-sale-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  -- Marca como enviada somente quando o enqueue foi aceito pelo pg_net.
  UPDATE public.sales
  SET broadcast_sent_at = now(), updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a inserção da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_sale_completed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
CREATE TRIGGER trg_broadcast_sale_completed
AFTER INSERT OR UPDATE OF status, deal_status ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.broadcast_sale_completed();

-- ════════════════════════════════════════════════════════════════════════
-- 10) revenue_forecast_view — exclui vendedores inativos no outer SELECT
--     (alinha com mv_competitive_ranking, que só ranqueia is_active)
-- ════════════════════════════════════════════════════════════════════════
-- Mesma definição de 20261018200000; única mudança = JOIN final em
-- salespeople com is_active = true (pipeline/metas de vendedores
-- desativados não entram mais no forecast).

CREATE OR REPLACE VIEW public.revenue_forecast_view
WITH (security_invoker = true)
AS
WITH open_deals AS (
  SELECT
    s.id,
    s.salesperson_id,
    s.amount,
    s.status,
    s.forecast_category,
    s.created_at,
    s.updated_at,
    sp.probability AS stage_probability
  FROM public.sales s
  JOIN public.stage_probabilities sp ON sp.stage = s.status
  -- Pipeline aberto = probabilidade estritamente entre 0 e 1 na SSOT
  -- (ganhos =1.00 e perdidos =0.00 ficam de fora, assim como status sem
  -- mapeamento — antes 'won'/'closed'/'cancelled' inflavam o pipeline).
  WHERE sp.probability > 0 AND sp.probability < 1
),
category_agg AS (
  SELECT
    salesperson_id,
    SUM(amount) FILTER (WHERE forecast_category = 'commit') as commit_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'best_case') as best_case_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'pipeline') as pipeline_amount
  FROM open_deals
  GROUP BY salesperson_id
),
closed_recent AS (
  SELECT
    salesperson_id,
    count(*) AS won_count,
    avg(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at)) / 86400.0) AS avg_cycle_days,
    sum(amount) AS won_amount_90d
  FROM public.sales
  WHERE status IN ('completed', 'won', 'closed')
    AND COALESCE(closed_at, updated_at) >= (now() - interval '90 days')
  GROUP BY salesperson_id
),
goals_current AS (
  -- Meta vigente = linha MAIS RECENTE de sales_goals com month ≤ mês
  -- corrente no fuso de negócio (fallback: cobre vendedor sem meta lançada
  -- no mês corrente — antes o match exato zerava monthly_goal).
  SELECT DISTINCT ON (salesperson_id)
    salesperson_id,
    goal_amount
  FROM sales_goals
  WHERE month <= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY salesperson_id, month DESC
)
SELECT
  COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
  COALESCE(SUM(od.amount), 0) AS total_open_pipeline,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS weighted_forecast,
  count(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
  COALESCE(MAX(cr.avg_cycle_days), 45) AS avg_cycle_days,
  COALESCE(MAX(cr.won_amount_90d), 0) AS won_amount_90d,
  COALESCE(MAX(cr.won_count), 0) AS won_count_90d,
  COALESCE(MAX(gc.goal_amount), 0) AS monthly_goal,
  COALESCE(MAX(ca.commit_amount), 0) as commit_amount,
  COALESCE(MAX(ca.best_case_amount), 0) as best_case_amount,
  COALESCE(MAX(ca.pipeline_amount), 0) as pipeline_amount,
  -- Cenários: COALESCE por categoria — sem best_case/pipeline o cenário não
  -- zera mais, só desconsidera o componente ausente.
  COALESCE(MAX(COALESCE(ca.commit_amount, 0)), 0) AS pessimistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) * 0.5), 0) AS realistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) + COALESCE(ca.pipeline_amount, 0) * 0.3), 0) AS optimistic_30d
FROM open_deals od
FULL JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
FULL JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
LEFT JOIN category_agg ca ON ca.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
-- Só vendedores ativos entram no forecast (mesmo filtro de mv_competitive_ranking)
JOIN public.salespeople sp_active
  ON sp_active.id = COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id)
 AND sp_active.is_active = true
GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

-- ════════════════════════════════════════════════════════════════════════
-- 11) award_bonus_if_eligible — chave period_month no fuso de negócio
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.award_bonus_if_eligible(
  _bonus_id uuid,
  _computed_amount numeric,
  _bonus_kind text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sp_id uuid;
  _bonus record;
  -- mês corrente no fuso de negócio (era UTC — divergia na virada de mês)
  _period date := date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date;
  _existing uuid;
  _new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _computed_amount IS NULL OR _computed_amount <= 0 THEN
    RETURN NULL;
  END IF;

  IF _bonus_kind NOT IN ('fixed','percentage') THEN
    RAISE EXCEPTION 'invalid bonus_kind';
  END IF;

  -- Deriva salesperson_id do usuário autenticado (impossível forjar)
  SELECT id INTO _sp_id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1;
  IF _sp_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Valida bônus ativo e elegibilidade de escopo (individual/global)
  SELECT * INTO _bonus FROM public.commission_bonuses WHERE id = _bonus_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Se o bônus tem alvo individual, precisa ser o próprio vendedor
  IF _bonus.salesperson_id IS NOT NULL AND _bonus.salesperson_id <> _sp_id THEN
    RETURN NULL;
  END IF;

  -- Idempotência: já registrado no mês?
  SELECT id INTO _existing
  FROM public.commission_bonus_awards
  WHERE bonus_id = _bonus_id
    AND salesperson_id = _sp_id
    AND period_month = _period
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    RETURN _existing;
  END IF;

  INSERT INTO public.commission_bonus_awards (
    bonus_id, salesperson_id, period_month, computed_amount, bonus_kind, status
  ) VALUES (
    _bonus_id, _sp_id, _period, _computed_amount, _bonus_kind, 'pending'
  )
  ON CONFLICT (bonus_id, salesperson_id, period_month) DO NOTHING
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 12) notify_sale_completion — mês do ranking no fuso de negócio.
--     Função dormante: tr_notify_sale_completion foi dropada em
--     20260512213243; o corpo fica canonizado para não reintroduzir o gap
--     de UTC caso o trigger volte a ser criado.
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_sale_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_name TEXT;
    v_sale_amount NUMERIC;
    v_seller_rank INT;
    v_recipient RECORD;
    v_recipient_rank INT;
    v_seller_id UUID;
    v_formatted_amount TEXT;
BEGIN
    -- Detect closure event (deal_status = 'completed' — coluna gerada já
    -- mapeia o trio canônico WON: completed/won/closed)
    IF (TG_OP = 'UPDATE' AND NEW.deal_status = 'completed'::deal_status AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed'::deal_status))
       OR (TG_OP = 'INSERT' AND NEW.deal_status = 'completed'::deal_status) THEN

        v_seller_id := NEW.salesperson_id;
        v_sale_amount := NEW.amount;
        v_formatted_amount := 'R$ ' || to_char(v_sale_amount, 'FM999G999G990D00');

        -- Get seller details
        SELECT name INTO v_seller_name FROM public.salespeople WHERE id = v_seller_id;

        -- Calculate seller rank at this exact moment (mês no fuso de negócio)
        SELECT pos INTO v_seller_rank
        FROM (
            SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
            FROM public.sales
            WHERE deal_status = 'completed'::deal_status
              AND created_at >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
            GROUP BY salesperson_id
        ) snap WHERE salesperson_id = v_seller_id;

        IF v_seller_rank IS NULL THEN v_seller_rank := 1; END IF;

        -- Notify ALL other active salespeople
        FOR v_recipient IN
            SELECT sp.id, sp.auth_user_id, sp.name, COALESCE(r.pos, 0) as recipient_rank
            FROM public.salespeople sp
            LEFT JOIN (
                SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
                FROM public.sales
                WHERE deal_status = 'completed'::deal_status
                  AND created_at >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
                GROUP BY salesperson_id
            ) r ON r.salesperson_id = sp.id
            WHERE sp.is_active = true
              AND sp.id != v_seller_id
              AND sp.auth_user_id IS NOT NULL
        LOOP
            v_recipient_rank := v_recipient.recipient_rank;

            -- 1. Insert individual notification
            INSERT INTO public.notifications (
                user_id,
                type,
                category,
                priority,
                title,
                message,
                icon,
                metadata
            ) VALUES (
                v_recipient.auth_user_id,
                'sale_alert',
                'gamification',
                'high',
                '🚀 ' || v_seller_name || ' vendeu!',
                'Fechou ' || v_formatted_amount || '! Rank dele: #' || v_seller_rank ||
                '. Seu rank: ' || CASE WHEN v_recipient_rank = 0 THEN 'S/R' ELSE '#' || v_recipient_rank END ||
                '. Vamos buscar!',
                'Zap',
                jsonb_build_object(
                    'sale_id', NEW.id,
                    'seller_id', v_seller_id,
                    'seller_name', v_seller_name,
                    'amount', v_sale_amount,
                    'seller_rank', v_seller_rank,
                    'recipient_rank', v_recipient_rank,
                    'is_competition_alert', true
                )
            );

            -- 2. Log audit history
            INSERT INTO public.sale_notifications_audit (
                sale_id,
                seller_id,
                seller_name,
                sale_amount,
                seller_rank_at_time,
                recipient_id,
                recipient_rank_at_time,
                notification_type
            ) VALUES (
                NEW.id,
                v_seller_id,
                v_seller_name,
                v_sale_amount,
                v_seller_rank,
                v_recipient.id,
                v_recipient_rank,
                'in-app'
            );
        END LOOP;

        -- Competitive Chat Post
        INSERT INTO public.competitive_chat_messages (
            salesperson_id,
            message,
            message_type
        ) VALUES (
            v_seller_id,
            'Acabei de fechar ' || v_formatted_amount || '! A meta tá logo ali! 🔥',
            'chat'
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO public;

-- ════════════════════════════════════════════════════════════════════════
-- 13) RPCs mortas — sem chamador no repo (verificado no HEAD): drop com
--     comentário em vez de canonizar código que nunca executa.
-- ════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.get_revenue_forecast(integer);
DROP FUNCTION IF EXISTS public.get_detailed_kpis();
DROP FUNCTION IF EXISTS public.calculate_performance_pace(uuid);
