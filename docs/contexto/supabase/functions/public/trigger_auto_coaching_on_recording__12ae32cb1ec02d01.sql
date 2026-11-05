CREATE OR REPLACE FUNCTION public.trigger_auto_coaching_on_recording()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_anon_key text;
  v_base_url text;
  v_request_id bigint;
BEGIN
  IF NEW.summarized_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.summarized_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF (NEW.transcript IS NULL OR length(trim(NEW.transcript)) < 40)
     AND (NEW.summary IS NULL OR length(trim(NEW.summary)) < 40) THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_secret   FROM public._internal_secrets WHERE key = 'coaching_cron_secret';
  SELECT value INTO v_anon_key FROM public._internal_secrets WHERE key = 'anon_key';
  SELECT value INTO v_base_url FROM public._internal_secrets WHERE key = 'functions_base_url';

  IF v_secret IS NULL THEN
    RAISE WARNING 'auto_coaching: coaching_cron_secret ausente';
    RETURN NEW;
  END IF;

  SELECT net.http_post(
    url := v_base_url || '/generate-coaching-actions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'X-Cron-Secret', v_secret
    ),
    body := jsonb_build_object('recording_id', NEW.id::text),
    timeout_milliseconds := 30000
  ) INTO v_request_id;

  BEGIN
    INSERT INTO public.activity_audit_logs (event_type, entity_type, entity_id, metadata)
    VALUES (
      'auto_coaching_triggered',
      'call_recording',
      NEW.id,
      jsonb_build_object('request_id', v_request_id, 'salesperson_id', NEW.salesperson_id)
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$function$
