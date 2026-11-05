CREATE OR REPLACE FUNCTION public.auto_assign_lead(_sale_id uuid)
 RETURNS TABLE(assigned_to uuid, strategy text, rule_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
