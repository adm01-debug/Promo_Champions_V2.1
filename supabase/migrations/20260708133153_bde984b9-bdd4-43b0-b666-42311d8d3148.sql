CREATE OR REPLACE FUNCTION private.auto_enroll_in_cadence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  matching_rule RECORD;
BEGIN
  SELECT r.id, r.cadence_id INTO matching_rule
  FROM public.cadence_enrollment_rules r
  WHERE r.is_active = true
    AND (r.trigger_stage IS NULL OR r.trigger_stage = NEW.status)
    AND (r.trigger_category IS NULL OR r.trigger_category = NEW.category)
    AND (r.trigger_source IS NULL OR r.trigger_source = NEW.source)
    AND (r.min_amount IS NULL OR NEW.amount >= r.min_amount)
    AND (r.max_amount IS NULL OR NEW.amount <= r.max_amount)
    AND NOT EXISTS (
      SELECT 1 FROM public.prospect_cadences pc
      WHERE pc.sale_id = NEW.id AND pc.cadence_id = r.cadence_id
        AND pc.status IN ('active','paused')
    )
  ORDER BY r.priority ASC LIMIT 1;

  IF matching_rule.id IS NOT NULL THEN
    INSERT INTO public.prospect_cadences (sale_id, cadence_id, salesperson_id, status, next_action_date)
    VALUES (NEW.id, matching_rule.cadence_id, NEW.salesperson_id, 'active', CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$function$;