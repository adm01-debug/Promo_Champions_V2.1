CREATE OR REPLACE FUNCTION public.calculate_deal_probability(deal_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  stage_weight NUMERIC;
  age_days INTEGER;
  activity_count INTEGER;
  probability NUMERIC;
BEGIN
  SELECT 
    CASE stage
      WHEN 'prospecting' THEN 0.1
      WHEN 'qualification' THEN 0.25
      WHEN 'proposal' THEN 0.50
      WHEN 'negotiation' THEN 0.75
      WHEN 'closing' THEN 0.90
      ELSE 0.05
    END,
    EXTRACT(DAY FROM now() - created_at),
    (SELECT COUNT(*) FROM activities WHERE activities.deal_id = deals.id)
  INTO stage_weight, age_days, activity_count
  FROM deals
  WHERE id = deal_id;
  
  probability := stage_weight * (1 - (age_days::NUMERIC / 365)) * (1 + (activity_count::NUMERIC / 100));
  
  RETURN GREATEST(0, LEAST(1, probability));
END;
$function$
