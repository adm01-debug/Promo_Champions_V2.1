CREATE OR REPLACE FUNCTION public.enforce_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Escopo: writes feitos por usuários do app via PostgREST. service_role,
  -- postgres e demais conexões internas são writers de sistema (sync, crons,
  -- migrations) e não são bloqueados — usam as RPCs quando aplicável.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NULL OR NEW.status IS NULL OR OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_valid_status_transition(TG_TABLE_NAME, OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Transição de status inválida em %: % → %',
      TG_TABLE_NAME, OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$
