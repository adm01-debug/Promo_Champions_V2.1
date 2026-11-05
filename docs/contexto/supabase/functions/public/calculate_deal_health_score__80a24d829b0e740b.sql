CREATE OR REPLACE FUNCTION public.calculate_deal_health_score(p_deal_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_score DECIMAL := 0;
  v_age_days INTEGER;
  v_activity_count INTEGER;
  v_last_activity_days INTEGER;
BEGIN
  -- Get deal age
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 INTO v_age_days
  FROM deals WHERE id = p_deal_id;
  
  -- Get activity count
  SELECT COUNT(*) INTO v_activity_count
  FROM activities WHERE deal_id = p_deal_id;
  
  -- Get days since last activity
  SELECT COALESCE(EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 86400, 999) 
  INTO v_last_activity_days
  FROM activities WHERE deal_id = p_deal_id;
  
  -- Calculate score (0-100)
  v_score := 100;
  
  -- Penalty for age
  IF v_age_days > 90 THEN v_score := v_score - 20; END IF;
  IF v_age_days > 180 THEN v_score := v_score - 20; END IF;
  
  -- Penalty for inactivity
  IF v_last_activity_days > 14 THEN v_score := v_score - 20; END IF;
  IF v_last_activity_days > 30 THEN v_score := v_score - 20; END IF;
  
  -- Bonus for high activity
  IF v_activity_count > 10 THEN v_score := v_score + 10; END IF;
  IF v_activity_count > 20 THEN v_score := v_score + 10; END IF;
  
  RETURN GREATEST(0, LEAST(100, v_score));
END;
$function$
