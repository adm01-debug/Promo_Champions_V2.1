CREATE OR REPLACE FUNCTION public.fn_convert_quote_to_sale(_quote_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_quote        public.quotes%ROWTYPE;
  v_sale_id      uuid;
  v_order_id     uuid;
  v_caller       uuid := auth.uid();
  v_is_admin     boolean;
  v_caller_sp    uuid;
  v_item_count   int;
  v_items_total  numeric(15,2);
  v_product_desc text;
  v_order_number text;
  v_attempts     int := 0;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] Sessão inválida ou expirada' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_quote FROM public.quotes WHERE id = _quote_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '[QUOTE_NOT_FOUND] Orçamento não encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF v_quote.sale_id IS NOT NULL THEN
    SELECT id INTO v_order_id FROM public.orders WHERE quote_id = _quote_id LIMIT 1;
    RETURN jsonb_build_object('sale_id', v_quote.sale_id, 'order_id', v_order_id, 'idempotent', true);
  END IF;

  SELECT public.has_role(v_caller, 'admin'::public.app_role) INTO v_is_admin;
  IF NOT v_is_admin THEN
    SELECT id INTO v_caller_sp FROM public.salespeople
     WHERE auth_user_id = v_caller AND is_active = true LIMIT 1;
    IF v_caller_sp IS NULL OR v_caller_sp IS DISTINCT FROM v_quote.created_by THEN
      RAISE EXCEPTION '[FORBIDDEN] Você não tem permissão para converter este orçamento' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF v_quote.status NOT IN ('accepted','approved','won') THEN
    RAISE EXCEPTION '[INVALID_STATUS] Orçamento precisa estar aprovado/aceito. Status atual: %', v_quote.status USING ERRCODE = '22023';
  END IF;

  IF v_quote.total_value IS NULL OR v_quote.total_value < 0 THEN
    RAISE EXCEPTION '[INVALID_TOTAL] Valor total do orçamento inválido' USING ERRCODE = '22023';
  END IF;

  SELECT COUNT(*), COALESCE(SUM(total_price), 0)::numeric(15,2)
    INTO v_item_count, v_items_total FROM public.quote_items WHERE quote_id = _quote_id;

  IF v_item_count = 0 THEN
    RAISE EXCEPTION '[EMPTY_ITEMS] Orçamento sem itens não pode virar venda' USING ERRCODE = '22023';
  END IF;

  IF ABS(v_items_total - v_quote.total_value) > 0.02 THEN
    RAISE EXCEPTION '[TOTAL_MISMATCH] Total do orçamento (%) não bate com a soma dos itens (%)',
      v_quote.total_value, v_items_total USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(string_agg(product_name || ' x' || quantity, ', ' ORDER BY created_at), v_quote.title)
    INTO v_product_desc FROM public.quote_items WHERE quote_id = _quote_id;

  INSERT INTO public.sales (client_name, product_name, amount, salesperson_id, status, source, client_id)
  VALUES (v_quote.client_name, LEFT(COALESCE(v_product_desc, v_quote.title), 500),
          v_quote.total_value, v_quote.created_by, 'won', 'quote_conversion', v_quote.client_id)
  RETURNING id INTO v_sale_id;

  LOOP
    v_attempts := v_attempts + 1;
    v_order_number := 'ORC-' || to_char(now(), 'YYYYMMDD') || '-'
                      || lpad(nextval('public.orders_conversion_seq')::text, 8, '0');
    BEGIN
      INSERT INTO public.orders (order_number, status, subtotal, shipping, total,
        quote_id, client_id, salesperson_id, user_id, notes, metadata)
      VALUES (v_order_number, 'confirmed',
        COALESCE(v_quote.subtotal, v_quote.total_value), 0, v_quote.total_value,
        _quote_id, v_quote.client_id, v_quote.created_by, v_caller, v_quote.notes,
        jsonb_build_object('source','quote_conversion','sale_id',v_sale_id,
          'quote_number',v_quote.quote_number,'converted_by',v_caller,'converted_at',now()))
      RETURNING id INTO v_order_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= 5 THEN RAISE; END IF; CONTINUE;
    END;
  END LOOP;

  INSERT INTO public.order_items (order_id, product_name, quantity, unit_price)
  SELECT v_order_id, product_name, quantity, unit_price FROM public.quote_items WHERE quote_id = _quote_id;

  UPDATE public.quotes
     SET sale_id = v_sale_id, status = 'converted',
         approved_at = COALESCE(approved_at, now()), updated_at = now()
   WHERE id = _quote_id;

  BEGIN
    INSERT INTO public.audit_logs (action, resource_type, resource_id, user_id, metadata)
    VALUES ('convert_quote_to_sale','quote',_quote_id,v_caller,
      jsonb_build_object('quote_id',_quote_id,'sale_id',v_sale_id,'order_id',v_order_id,
        'order_number',v_order_number,'total_value',v_quote.total_value,'item_count',v_item_count));
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN jsonb_build_object('sale_id', v_sale_id, 'order_id', v_order_id,
    'order_number', v_order_number, 'items_count', v_item_count, 'idempotent', false);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.fn_convert_quote_to_sale(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_convert_quote_to_sale(uuid) TO authenticated, service_role;