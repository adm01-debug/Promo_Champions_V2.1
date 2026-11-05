CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_payload jsonb;
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Dispara apenas na transição para 'completed' (INSERT ou UPDATE que muda
  -- o status). Se o enqueue falhar, a venda fica com broadcast_sent_at nulo e
  -- o erro em edge_call_failures — sem re-tentar a cada update posterior.
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Evita rebroadcast da mesma venda já entregue.
  IF NEW.broadcast_sent_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- A edge function lê os dados da venda no banco; o corpo carrega só o id.
  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/broadcast-sale-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  -- Marca como enviada somente quando o enqueue foi aceito pelo pg_net.
  UPDATE public.sales
  SET broadcast_sent_at = now(), updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a inserção da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$function$
