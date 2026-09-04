-- Corrige broadcast_sale_completed(): substitui URL hardcoded do projeto antigo
-- (rapjswienfhkobhlamxb) e chave anon embutida por leitura de _internal_secrets.
--
-- Contexto: migration 20260903000002 foi um no-op — o UPDATE em cron.job não
-- tocou o corpo PL/pgSQL desta função (URL vive em prosrc, não em command).
-- Esta migration é a correção real.
--
-- Padrão: idêntico a trigger_campaign_health_alert() em 20260831130003.
CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_seller_name text;
  v_payload     jsonb;
  v_base_url    text;
  v_anon_key    text;
BEGIN
  -- 1. Apenas vendas concluídas
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- 2. Deduplicação: não rebroadcast se já enviado
  IF NEW.broadcast_sent_at IS NOT NULL
     AND TG_OP = 'UPDATE'
     AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- 3. Dados do vendedor
  SELECT name INTO v_seller_name
  FROM public.salespeople
  WHERE id = NEW.salesperson_id;

  v_payload := jsonb_build_object(
    'sale_id',          NEW.id,
    'salesperson_id',   NEW.salesperson_id,
    'salesperson_name', COALESCE(v_seller_name, 'Vendedor'),
    'client_name',      COALESCE(NEW.client_name, 'Cliente'),
    'amount',           NEW.amount
  );

  -- 4. Configuração via secrets internos (sem URL ou chave hardcoded)
  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key')
  INTO v_base_url, v_anon_key
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL THEN
    RAISE WARNING 'broadcast_sale_completed: _internal_secrets incompleto — broadcast suprimido para sale_id=%', NEW.id;
    RETURN NEW;
  END IF;

  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE WARNING 'broadcast_sale_completed: functions_base_url inválida — broadcast suprimido para sale_id=%', NEW.id;
    RETURN NEW;
  END IF;

  -- 5. Chamada assíncrona via pg_net
  PERFORM net.http_post(
    url     := rtrim(v_base_url, '/') || '/broadcast-sale-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'apikey',        v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body    := v_payload
  );

  -- 6. Marca como processado
  UPDATE public.sales
  SET broadcast_sent_at = now(),
      updated_at        = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'broadcast_sale_completed falha crítica: % (sale_id=%)', SQLERRM, NEW.id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_sale_completed()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_sale_completed()
  TO service_role;
