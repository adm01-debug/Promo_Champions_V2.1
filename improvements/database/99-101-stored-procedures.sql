-- Melhorias 99-101 - Stored Procedures

-- 99: Calculate Deal Metrics
CREATE OR REPLACE FUNCTION calculate_deal_metrics(p_deal_id UUID)
RETURNS TABLE (
  win_probability NUMERIC,
  days_in_stage NUMERIC,
  velocity_score NUMERIC,
  next_best_action TEXT
) AS $$
DECLARE
  v_stage TEXT;
  v_days_in_stage NUMERIC;
  v_activity_count INT;
BEGIN
  SELECT stage_id, EXTRACT(EPOCH FROM (NOW() - updated_at))/86400, 
         (SELECT COUNT(*) FROM activities WHERE deal_id = p_deal_id)
  INTO v_stage, v_days_in_stage, v_activity_count
  FROM deals WHERE id = p_deal_id;

  -- Calculate probability based on stage
  win_probability := CASE v_stage
    WHEN 'qualification' THEN 0.10
    WHEN 'proposal' THEN 0.30
    WHEN 'negotiation' THEN 0.60
    WHEN 'closing' THEN 0.85
    ELSE 0.05
  END;

  -- Adjust for time in stage
  IF v_days_in_stage > 30 THEN
    win_probability := win_probability * 0.7;
  END IF;

  -- Calculate velocity
  velocity_score := CASE
    WHEN v_days_in_stage < 7 THEN 100
    WHEN v_days_in_stage < 14 THEN 75
    WHEN v_days_in_stage < 30 THEN 50
    ELSE 25
  END;

  -- Determine next action
  next_best_action := CASE
    WHEN v_activity_count = 0 THEN 'Schedule initial call'
    WHEN v_days_in_stage > 14 THEN 'Follow up urgently'
    WHEN v_stage = 'proposal' THEN 'Send proposal reminder'
    ELSE 'Continue nurturing'
  END;

  RETURN QUERY SELECT win_probability, v_days_in_stage, velocity_score, next_best_action;
END;
$$ LANGUAGE plpgsql;

-- 100: Route Lead
CREATE OR REPLACE FUNCTION route_lead(p_lead_score INT, p_region TEXT)
RETURNS UUID AS $$
DECLARE
  v_salesperson_id UUID;
BEGIN
  -- Find best match salesperson
  SELECT id INTO v_salesperson_id
  FROM salespeople
  WHERE region = p_region
    AND active = true
    AND (SELECT COUNT(*) FROM deals WHERE assigned_to = salespeople.id AND status IN ('open', 'qualification')) < 10
  ORDER BY 
    CASE WHEN p_lead_score >= 80 THEN level = 'senior' ELSE level = 'junior' END DESC,
    RANDOM()
  LIMIT 1;

  RETURN v_salesperson_id;
END;
$$ LANGUAGE plpgsql;

-- 101: Predict Churn
CREATE OR REPLACE FUNCTION predict_churn(p_client_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_last_purchase_days INT;
  v_activity_count INT;
  v_churn_probability NUMERIC;
BEGIN
  -- Days since last purchase
  SELECT EXTRACT(EPOCH FROM (NOW() - MAX(created_at)))/86400
  INTO v_last_purchase_days
  FROM deals WHERE client_id = p_client_id AND status = 'won';

  -- Activity count in last 90 days
  SELECT COUNT(*)
  INTO v_activity_count
  FROM activities 
  WHERE client_id = p_client_id 
    AND created_at >= NOW() - INTERVAL '90 days';

  -- Calculate probability
  v_churn_probability := 0;
  
  IF v_last_purchase_days > 180 THEN v_churn_probability := v_churn_probability + 0.4; END IF;
  IF v_last_purchase_days > 365 THEN v_churn_probability := v_churn_probability + 0.3; END IF;
  IF v_activity_count = 0 THEN v_churn_probability := v_churn_probability + 0.3; END IF;

  RETURN LEAST(v_churn_probability, 1.0);
END;
$$ LANGUAGE plpgsql;
