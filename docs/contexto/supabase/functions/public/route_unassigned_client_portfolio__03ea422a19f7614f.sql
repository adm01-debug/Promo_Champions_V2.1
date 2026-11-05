CREATE OR REPLACE FUNCTION public.route_unassigned_client_portfolio(p_client_id uuid, p_strategy text, p_salesperson_id uuid DEFAULT NULL::uuid, p_reason text DEFAULT NULL::text)
 RETURNS TABLE(portfolio_id uuid, assigned_to uuid, strategy_used text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
