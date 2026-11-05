CREATE OR REPLACE FUNCTION private.award_xp_on_quote_approved_via_cadence()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved') THEN
    SELECT pc.salesperson_id
      INTO v_salesperson_id
      FROM public.prospect_cadences pc
     WHERE pc.quote_id = NEW.id
     ORDER BY pc.started_at DESC
     LIMIT 1;

    IF v_salesperson_id IS NOT NULL THEN
      PERFORM private.add_salesperson_xp(v_salesperson_id, 50, 'quote_approved_via_cadence');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
