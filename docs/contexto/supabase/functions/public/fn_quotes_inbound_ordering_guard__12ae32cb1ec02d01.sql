CREATE OR REPLACE FUNCTION public.fn_quotes_inbound_ordering_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _incoming timestamptz;
BEGIN
  _incoming := (NEW.raw_payload->>'event_at')::timestamptz;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.event_at IS NOT NULL AND _incoming IS NOT NULL AND _incoming < OLD.event_at THEN
      NEW.status      := OLD.status;
      NEW.last_event  := OLD.last_event;
      NEW.event_at    := OLD.event_at;
      NEW.raw_payload := OLD.raw_payload;
      RETURN NEW;
    END IF;
  END IF;

  NEW.event_at := COALESCE(_incoming, OLD.event_at);
  RETURN NEW;
END;
$function$
