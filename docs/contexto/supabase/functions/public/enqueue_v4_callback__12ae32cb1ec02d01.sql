CREATE OR REPLACE FUNCTION public.enqueue_v4_callback()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.external_quote_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('approved', 'rejected', 'expired', 'sent') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.v4_callback_dead_letters (
    external_quote_id, quote_id, event_type, payload, next_retry_at
  )
  VALUES (
    NEW.external_quote_id,
    NEW.id,
    'quote_status_changed',
    jsonb_build_object(
      'external_quote_id', NEW.external_quote_id,
      'quote_id', NEW.id,
      'new_status', NEW.status,
      'quote_number', NEW.quote_number,
      'total', NEW.total_value,
      'updated_at', NEW.updated_at
    ),
    now()
  );

  RETURN NEW;
END;
$function$
