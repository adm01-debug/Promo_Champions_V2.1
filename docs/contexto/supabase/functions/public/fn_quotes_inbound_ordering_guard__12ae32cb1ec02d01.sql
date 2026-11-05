CREATE OR REPLACE FUNCTION public.fn_quotes_inbound_ordering_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
-- fix_version=2026-07-10-ordering-guard-v3 ANTI-REGRESSÃO
-- v3: extrai event_at SEMPRE do raw_payload novo (upsert herda coluna antiga)
DECLARE
  _incoming timestamptz;
BEGIN
  _incoming := (NEW.raw_payload->>'event_at')::timestamptz;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.event_at IS NOT NULL AND _incoming IS NOT NULL AND _incoming < OLD.event_at THEN
      -- Evento OUT-OF-ORDER (mais antigo): preservar estado atual
      NEW.status      := OLD.status;
      NEW.last_event  := OLD.last_event;
      NEW.event_at    := OLD.event_at;
      NEW.raw_payload := OLD.raw_payload;
      RETURN NEW;
    END IF;
  END IF;

  -- Evento em ordem (ou primeiro): aplicar e gravar novo event_at
  NEW.event_at := COALESCE(_incoming, OLD.event_at);
  RETURN NEW;
END;
$function$
