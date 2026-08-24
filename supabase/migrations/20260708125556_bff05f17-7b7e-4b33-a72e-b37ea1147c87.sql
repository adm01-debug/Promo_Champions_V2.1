
CREATE OR REPLACE FUNCTION public.fn_convert_quote_to_sale(_quote_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote        public.quotes%ROWTYPE;
  v_sale_id      uuid;
  v_caller       uuid := auth.uid();
  v_is_admin     boolean;
  v_caller_sp    uuid;
  v_item_count   int;
  v_product_desc text;
BEGIN
  -- 1) Autenticação obrigatória
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  -- 2) Lock pessimista do orçamento para evitar corrida
  SELECT * INTO v_quote
  FROM public.quotes
  WHERE id = _quote_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'quote_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- 3) Idempotência: já convertido → devolve a venda existente
  IF v_quote.sale_id IS NOT NULL THEN
    RETURN v_quote.sale_id;
  END IF;

  -- 4) Autorização: admin OU dono do orçamento (via salespeople.user_id)
  SELECT public.has_role(v_caller, 'admin'::public.app_role) INTO v_is_admin;

  IF NOT v_is_admin THEN
    SELECT id INTO v_caller_sp
    FROM public.salespeople
    WHERE user_id = v_caller
    LIMIT 1;

    IF v_caller_sp IS NULL OR v_caller_sp IS DISTINCT FROM v_quote.created_by THEN
      RAISE EXCEPTION 'forbidden_not_quote_owner' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 5) Validação de status
  IF v_quote.status NOT IN ('accepted','approved','won') THEN
    RAISE EXCEPTION 'invalid_status_for_conversion: %', v_quote.status
      USING ERRCODE = '22023';
  END IF;

  -- 6) Validação de valor
  IF v_quote.total_value IS NULL OR v_quote.total_value < 0 THEN
    RAISE EXCEPTION 'invalid_total_value' USING ERRCODE = '22023';
  END IF;

  -- 7) Monta descrição do produto a partir dos itens
  SELECT COUNT(*),
         COALESCE(
           string_agg(product_name || ' x' || quantity, ' | ' ORDER BY created_at),
           v_quote.title
         )
    INTO v_item_count, v_product_desc
  FROM public.quote_items
  WHERE quote_id = _quote_id;

  IF v_item_count = 0 THEN
    v_product_desc := v_quote.title;
  END IF;

  -- Trunca para caber num campo text razoável
  IF length(v_product_desc) > 500 THEN
    v_product_desc := substring(v_product_desc, 1, 497) || '...';
  END IF;

  -- 8) Cria a venda
  INSERT INTO public.sales (
    client_name,
    product_name,
    amount,
    status,
    category,
    source,
    salesperson_id,
    client_id
  ) VALUES (
    v_quote.client_name,
    v_product_desc,
    v_quote.total_value,
    'won',
    'other',
    'quote_conversion',
    v_quote.created_by,
    v_quote.client_id
  )
  RETURNING id INTO v_sale_id;

  -- 9) Atualiza o orçamento
  UPDATE public.quotes
     SET sale_id    = v_sale_id,
         status     = 'converted',
         approved_at = COALESCE(approved_at, now()),
         updated_at = now()
   WHERE id = _quote_id;

  -- 10) Audit log (best-effort)
  BEGIN
    INSERT INTO public.audit_logs (action, resource_type, resource_id, user_id, metadata)
    VALUES (
      'convert_quote_to_sale',
      'quote',
      _quote_id,
      v_caller,
      jsonb_build_object(
        'quote_id', _quote_id,
        'sale_id', v_sale_id,
        'total_value', v_quote.total_value,
        'item_count', v_item_count
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- não bloqueia conversão se audit_logs mudar de schema
    NULL;
  END;

  RETURN v_sale_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_convert_quote_to_sale(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_convert_quote_to_sale(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_convert_quote_to_sale(uuid) TO service_role;
