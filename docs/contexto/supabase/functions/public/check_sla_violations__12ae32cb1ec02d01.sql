CREATE OR REPLACE FUNCTION public.check_sla_violations()
 RETURNS TABLE(processed integer, new_warnings integer, new_violations integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _row RECORD;
  _hours NUMERIC;
  _new_status TEXT;
  _processed INT := 0;
  _warnings INT := 0;
  _violations INT := 0;
BEGIN
  FOR _row IN
    SELECT s.id AS sale_id, s.stage, s.updated_at, p.id AS policy_id, p.max_hours, p.warning_hours
    FROM public.sales s
    JOIN public.sla_policies p ON p.stage = s.stage AND p.is_active = true
    WHERE s.status NOT IN ('completed', 'lost', 'cancelled')
  LOOP
    _processed := _processed + 1;
    _hours := EXTRACT(EPOCH FROM (now() - _row.updated_at)) / 3600.0;
    
    IF _hours >= _row.max_hours THEN
      _new_status := 'violated';
    ELSIF _hours >= _row.warning_hours THEN
      _new_status := 'warning';
    ELSE
      CONTINUE;
    END IF;

    INSERT INTO public.sla_violations (sale_id, policy_id, stage, hours_in_stage, status)
    VALUES (_row.sale_id, _row.policy_id, _row.stage, _hours, _new_status)
    ON CONFLICT DO NOTHING;

    IF _new_status = 'warning' THEN _warnings := _warnings + 1;
    ELSE _violations := _violations + 1; END IF;
  END LOOP;

  RETURN QUERY SELECT _processed, _warnings, _violations;
END;
$function$
