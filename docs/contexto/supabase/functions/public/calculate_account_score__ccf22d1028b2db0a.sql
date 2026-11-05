CREATE OR REPLACE FUNCTION public.calculate_account_score(p_account_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_score INTEGER := 0;
  v_contacts INTEGER;
  v_decision_makers INTEGER;
  v_champions INTEGER;
  v_recent_activities INTEGER;
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier FROM accounts WHERE id = p_account_id;

  -- Tier base
  v_score := v_score + CASE v_tier
    WHEN 'strategic' THEN 30
    WHEN 'enterprise' THEN 22
    WHEN 'mid_market' THEN 15
    ELSE 8
  END;

  -- Contacts coverage
  SELECT COUNT(*) INTO v_contacts FROM account_contacts WHERE account_id = p_account_id;
  v_score := v_score + LEAST(v_contacts * 3, 20);

  -- Buying committee strength
  SELECT
    COUNT(*) FILTER (WHERE buying_role = 'decision_maker'),
    COUNT(*) FILTER (WHERE buying_role = 'champion')
  INTO v_decision_makers, v_champions
  FROM account_contacts WHERE account_id = p_account_id;

  v_score := v_score + LEAST(v_decision_makers * 8, 16);
  v_score := v_score + LEAST(v_champions * 5, 10);

  -- Engagement (last 30 days)
  SELECT COUNT(*) INTO v_recent_activities
  FROM account_activities
  WHERE account_id = p_account_id
    AND occurred_at >= now() - INTERVAL '30 days';

  v_score := v_score + LEAST(v_recent_activities * 2, 24);

  v_score := LEAST(v_score, 100);

  UPDATE accounts SET
    account_score = v_score,
    health_status = CASE
      WHEN v_score >= 75 THEN 'healthy'
      WHEN v_score >= 45 THEN 'at_risk'
      WHEN v_score > 0 THEN 'critical'
      ELSE 'unknown'
    END,
    updated_at = now()
  WHERE id = p_account_id;

  RETURN v_score;
END;
$function$
