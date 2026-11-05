CREATE OR REPLACE FUNCTION public.find_matching_cadence_rule(_sale_id uuid)
 RETURNS TABLE(rule_id uuid, cadence_id uuid, rule_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _sale RECORD;
BEGIN
  SELECT s.id, s.stage, s.category, s.source, s.amount
  INTO _sale
  FROM public.sales s
  WHERE s.id = _sale_id;

  IF _sale.id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.id, r.cadence_id, r.name
  FROM public.cadence_enrollment_rules r
  WHERE r.is_active = true
    AND (r.trigger_stage IS NULL OR r.trigger_stage = _sale.stage)
    AND (r.trigger_category IS NULL OR r.trigger_category = _sale.category)
    AND (r.trigger_source IS NULL OR r.trigger_source = _sale.source)
    AND (r.min_amount IS NULL OR _sale.amount >= r.min_amount)
    AND (r.max_amount IS NULL OR _sale.amount <= r.max_amount)
    -- Não re-inscrever se já existe cadência ativa com a mesma cadence_id
    AND NOT EXISTS (
      SELECT 1 FROM public.prospect_cadences pc
      WHERE pc.sale_id = _sale_id
        AND pc.cadence_id = r.cadence_id
        AND pc.status IN ('active', 'paused')
    )
  ORDER BY r.priority ASC
  LIMIT 1;
END;
$function$
