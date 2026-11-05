CREATE OR REPLACE FUNCTION public.reassign_inactive_client_portfolio(p_portfolio_id uuid, p_expected_salesperson_id uuid, p_expected_updated_at timestamp with time zone, p_to_salesperson_id uuid, p_inactivity_threshold_days integer, p_strategy text)
 RETURNS TABLE(portfolio_id uuid, client_id uuid, previous_salesperson_id uuid, assigned_to uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
