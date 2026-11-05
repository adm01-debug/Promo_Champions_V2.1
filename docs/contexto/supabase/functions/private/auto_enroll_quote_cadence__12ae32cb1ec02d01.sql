CREATE OR REPLACE FUNCTION private.auto_enroll_quote_cadence()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cadence_id uuid;
  v_existing uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'sent')
     OR (TG_OP = 'INSERT' AND NEW.status = 'sent') THEN

    SELECT id INTO v_existing FROM public.prospect_cadences
    WHERE quote_id = NEW.id AND status IN ('active','paused') LIMIT 1;

    IF v_existing IS NOT NULL THEN RETURN NEW; END IF;

    SELECT id INTO v_cadence_id FROM public.cadences
    WHERE cadence_type = 'quote_followup' AND is_active = true
    ORDER BY created_at ASC LIMIT 1;

    IF v_cadence_id IS NOT NULL THEN
      PERFORM public.enroll_quote_in_cadence(NEW.id, v_cadence_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
