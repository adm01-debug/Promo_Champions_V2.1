CREATE OR REPLACE FUNCTION public.aplicar_decisao_credito(p_order_id uuid, p_decisao text, p_limite numeric DEFAULT NULL::numeric, p_parcelas integer DEFAULT NULL::integer, p_parecer text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order public.orders%ROWTYPE;
  v_email text;
  v_cliente text;
  v_itens integer := 0;
BEGIN
  IF p_decisao NOT IN ('aprovado', 'reprovado') THEN
    RAISE EXCEPTION 'decisao_invalida';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('status', 'pedido_nao_encontrado');
  END IF;

  IF v_order.credit_status <> 'aguardando_credito' THEN
    RETURN jsonb_build_object('status', 'ja_decidido', 'credit_status', v_order.credit_status);
  END IF;

  UPDATE public.orders
     SET credit_status = p_decisao,
         credit_limit_approved = p_limite,
         credit_max_installments = p_parcelas,
         credit_notes = left(p_parecer, 2000),
         credit_decided_at = now(),
         updated_at = now()
   WHERE id = p_order_id;

  INSERT INTO public.order_status_events (order_id, status, description)
  VALUES (
    p_order_id,
    'credito_' || p_decisao,
    CASE
      WHEN p_decisao = 'aprovado' THEN
        'Credito aprovado pelo Financeiro'
        || COALESCE(' - limite R$ ' || to_char(p_limite, 'FM999G999G990D00'), '')
        || COALESCE(' - ate ' || p_parcelas || 'x', '')
      ELSE 'Credito reprovado pelo Financeiro' || COALESCE(': ' || left(p_parecer, 300), '')
    END
  );

  IF p_decisao = 'aprovado' THEN
    SELECT s.email INTO v_email FROM public.salespeople s WHERE s.id = v_order.salesperson_id;
    v_cliente := NULLIF(btrim(COALESCE(v_order.metadata ->> 'client_name', '')), '');

    INSERT INTO public.supply_outbox (order_id, order_item_id, event, payload)
    SELECT
      v_order.id,
      i.id,
      'pedido.criado',
      jsonb_build_object(
        'os_id', i.id,
        'os_number', v_order.order_number,
        'produto', i.product_name,
        'quantidade', GREATEST(COALESCE(i.quantity, 1), 1),
        'empresa', v_cliente,
        'observacoes', 'Pedido ' || v_order.order_number || ' aprovado no Promo Champions.',
        'source', 'promo_champions',
        'solicitante_email', v_email
      )
    FROM public.order_items i
    WHERE i.order_id = v_order.id
    ON CONFLICT (order_item_id, event) DO NOTHING;

    GET DIAGNOSTICS v_itens = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object('status', 'aplicado', 'credit_status', p_decisao, 'itens_supply', v_itens);
END;
$function$
