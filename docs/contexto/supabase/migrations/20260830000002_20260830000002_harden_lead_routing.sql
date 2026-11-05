-- ONDA 0 — Roteamento de leads e carteira com consistência transacional.
--
-- Esta migration não remove nem consolida dados existentes. Em especial, a
-- tabela client_portfolio historicamente permite mais de uma linha por cliente
-- (a restrição atual é client_id + salesperson_id); a reconciliação de linhas
-- legadas exige validação explícita dos dados de produção antes de qualquer
-- alteração estrutural.

-- Atribui um cliente que ainda não possui carteira. A exclusividade é
-- garantida entre chamadas que usam o fluxo oficial, sem reinterpretar dados
-- históricos já gravados.
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
      AND sa.status IN ('won', 'completed')
      AND sa.created_at >= date_trunc('month', now())
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

-- A política legada permitia que qualquer vendedor inserisse uma carteira em
-- seu próprio nome diretamente pelo PostgREST, contornando a idempotência e
-- a auditoria acima. Os únicos escritores identificados no repositório usam
-- agora esta RPC ou service_role; não se alteram linhas históricas.
DROP POLICY IF EXISTS "Users can insert own client_portfolio" ON public.client_portfolio;

-- Reatribui uma carteira inativa com comparação otimista e auditoria no mesmo
-- commit. É destinada exclusivamente ao job interno auto-reassign-inactive.
CREATE OR REPLACE FUNCTION public.reassign_inactive_client_portfolio(
  p_portfolio_id uuid,
  p_expected_salesperson_id uuid,
  p_expected_updated_at timestamptz,
  p_to_salesperson_id uuid,
  p_inactivity_threshold_days integer,
  p_strategy text
)
RETURNS TABLE (
  portfolio_id uuid,
  client_id uuid,
  previous_salesperson_id uuid,
  assigned_to uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_portfolio public.client_portfolio%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Esta operação é exclusiva do serviço interno'
      USING ERRCODE = '42501';
  END IF;

  IF p_inactivity_threshold_days IS NULL
    OR p_inactivity_threshold_days < 1
    OR p_inactivity_threshold_days > 3650 THEN
    RAISE EXCEPTION 'Limite de inatividade inválido'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_portfolio
  FROM public.client_portfolio
  WHERE id = p_portfolio_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada' USING ERRCODE = 'P0002';
  END IF;

  IF v_portfolio.status <> 'inactive'
    OR v_portfolio.salesperson_id IS DISTINCT FROM p_expected_salesperson_id
    OR v_portfolio.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'Carteira foi alterada desde a seleção do job'
      USING ERRCODE = 'P0001';
  END IF;

  -- A seleção do job é apenas uma fotografia. Revalida a inatividade sob o
  -- mesmo lock para que uma compra recente não seja reatribuída por uma
  -- chamada service_role atrasada ou incorreta.
  IF v_portfolio.last_purchase_date IS NOT NULL
    AND v_portfolio.last_purchase_date >= current_date - p_inactivity_threshold_days THEN
    RAISE EXCEPTION 'Carteira não atingiu o limite de inatividade observado'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_to_salesperson_id IS NULL
    OR p_to_salesperson_id = v_portfolio.salesperson_id THEN
    RAISE EXCEPTION 'Vendedor de destino inválido'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.salespeople
  WHERE id = p_to_salesperson_id
    AND is_active IS TRUE
    AND role IN ('closer', 'hybrid');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendedor de destino inválido ou inativo'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.client_portfolio
  SET salesperson_id = p_to_salesperson_id,
      assigned_at = now(),
      updated_at = now()
  WHERE id = v_portfolio.id;

  INSERT INTO public.lead_routing_log (
    client_id,
    from_salesperson_id,
    to_salesperson_id,
    routing_reason,
    notes
  ) VALUES (
    v_portfolio.client_id,
    v_portfolio.salesperson_id,
    p_to_salesperson_id,
    'auto_reassign_inactive',
    format(
      'Reatribuição automática por inatividade (%s dias). Estratégia: %s',
      p_inactivity_threshold_days,
      left(trim(COALESCE(p_strategy, 'desconhecida')), 100)
    )
  );

  RETURN QUERY
    SELECT v_portfolio.id,
           v_portfolio.client_id,
           v_portfolio.salesperson_id,
           p_to_salesperson_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reassign_inactive_client_portfolio(uuid, uuid, timestamptz, uuid, integer, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reassign_inactive_client_portfolio(uuid, uuid, timestamptz, uuid, integer, text)
  TO service_role;

-- A atribuição de deals passa a ser autorizada no servidor, idempotente por
-- sale_id e serializada para manter as estratégias globais consistentes.
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
      AND sa.status NOT IN ('completed', 'lost', 'cancelled')
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
      AND sa.status IN ('won', 'completed')
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
