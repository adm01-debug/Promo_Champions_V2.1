CREATE OR REPLACE FUNCTION public.tg_supply_enqueue_from_order_item()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order public.orders%ROWTYPE;
  v_email text;
  v_cliente text;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = NEW.order_id;
  IF v_order.id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_order.credit_status = 'aguardando_credito' THEN
    RETURN NEW;
  END IF;

  SELECT s.email INTO v_email
    FROM public.salespeople s
   WHERE s.id = v_order.salesperson_id;

  v_cliente := NULLIF(btrim(COALESCE(v_order.metadata ->> 'client_name', '')), '');

  INSERT INTO public.supply_outbox (order_id, order_item_id, event, payload)
  VALUES (
    v_order.id,
    NEW.id,
    'pedido.criado',
    jsonb_build_object(
      'os_id', NEW.id,
      'os_number', v_order.order_number,
      'produto', NEW.product_name,
      'quantidade', GREATEST(COALESCE(NEW.quantity, 1), 1),
      'empresa', v_cliente,
      'observacoes', 'Pedido ' || v_order.order_number || ' aprovado no Promo Champions.',
      'source', 'promo_champions',
      'solicitante_email', v_email
    )
  )
  ON CONFLICT (order_item_id, event) DO NOTHING;

  RETURN NEW;
END;
$function$
