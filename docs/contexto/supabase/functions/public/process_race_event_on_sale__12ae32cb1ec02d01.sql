CREATE OR REPLACE FUNCTION public.process_race_event_on_sale()
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
  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/process-race-event',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a escrita da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'process_race_event_on_sale failed: %', SQLERRM;
  RETURN NEW;
END;
$function$
