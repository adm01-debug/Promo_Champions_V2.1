CREATE OR REPLACE FUNCTION public.trg_recording_generate_coaching()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _secret text;
  _base_url text;
  _has_transcript boolean;
BEGIN
  _has_transcript := (
    (TG_OP = 'INSERT' AND NEW.transcript IS NOT NULL AND length(NEW.transcript) > 40)
    OR
    (TG_OP = 'UPDATE' AND NEW.transcript IS NOT NULL AND length(NEW.transcript) > 40
      AND (OLD.transcript IS NULL OR OLD.transcript IS DISTINCT FROM NEW.transcript))
  );
  IF NOT _has_transcript THEN
    RETURN NEW;
  END IF;

  SELECT value INTO _secret   FROM public._internal_secrets WHERE key = 'coaching_cron_secret';
  SELECT value INTO _base_url FROM public._internal_secrets WHERE key = 'functions_base_url';

  IF _secret IS NULL THEN
    RAISE WARNING 'coaching_cron_secret not set — skipping AI coaching dispatch for recording %', NEW.id;
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _base_url || '/generate-coaching-actions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', _secret
    ),
    body := jsonb_build_object('recording_id', NEW.id)
  );
  RETURN NEW;
END;
$function$
