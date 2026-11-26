CREATE OR REPLACE FUNCTION public.tg_credit_enqueue_from_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_client public.clients%ROWTYPE;
  v_email text;
BEGIN
  IF NEW.credit_status <> 'aguardando_credito' THEN
    RETURN NEW;
  END IF;

  IF NEW.client_id IS NOT NULL THEN
    SELECT * INTO v_client FROM public.clients WHERE id = NEW.client_id;
  END IF;
  SELECT s.email INTO v_email FROM public.salespeople s WHERE s.id = NEW.salesperson_id;

  INSERT INTO public.credit_outbox (order_id, event, payload)
  VALUES (
    NEW.id,
    'credito.solicitado',
    jsonb_build_object(
      'pedido_id', NEW.id,
      'pedido_numero', NEW.order_number,
      'valor_total', NEW.total,
      'cliente', jsonb_build_object(
        'id', v_client.id,
        'nome', v_client.name,
        'empresa', COALESCE(v_client.company, NEW.metadata ->> 'client_name'),
        'email', COALESCE(v_client.email, NEW.metadata ->> 'client_email'),
        'telefone', COALESCE(v_client.phone, NEW.metadata ->> 'client_phone'),
        'cnpj', v_client.cnpj
      ),
      'vendedor_email', v_email,
      'origem', 'promo_champions',
      'solicitado_em', now()
    )
  )
  ON CONFLICT (order_id, event) DO NOTHING;

  RETURN NEW;
END;
$function$
