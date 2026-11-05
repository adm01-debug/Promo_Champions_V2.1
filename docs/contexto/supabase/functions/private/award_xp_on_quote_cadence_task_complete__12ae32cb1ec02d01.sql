CREATE OR REPLACE FUNCTION private.award_xp_on_quote_cadence_task_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
  v_quote_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed') THEN
    SELECT pc.salesperson_id, pc.quote_id
      INTO v_salesperson_id, v_quote_id
      FROM public.prospect_cadences pc
     WHERE pc.id = NEW.prospect_cadence_id;

    IF v_quote_id IS NOT NULL AND v_salesperson_id IS NOT NULL THEN
      PERFORM private.add_salesperson_xp(v_salesperson_id, 15, 'quote_cadence_task');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
