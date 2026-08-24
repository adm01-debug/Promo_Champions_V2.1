-- =====================================================
-- DB-002: Stored Procedures for Complex Operations
-- =====================================================

-- 1. Calculate Deal Probability
CREATE OR REPLACE FUNCTION calculate_deal_probability(deal_id UUID)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql;

-- 2. Update Client Score
CREATE OR REPLACE FUNCTION update_client_score(client_id UUID)
RETURNS VOID AS $$
DECLARE
  total_value NUMERIC;
  deal_count INTEGER;
  last_activity DATE;
  score NUMERIC;
BEGIN
  SELECT
    COALESCE(SUM(value), 0),
    COUNT(*),
    MAX(created_at)::DATE
  INTO total_value, deal_count, last_activity
  FROM deals
  WHERE deals.client_id = update_client_score.client_id
    AND status IN ('won', 'open');
  
  score := (total_value / 1000) + (deal_count * 10) + 
           (CASE WHEN last_activity > now() - INTERVAL '30 days' THEN 20 ELSE 0 END);
  
  UPDATE clients
  SET health_score = LEAST(100, score)
  WHERE id = client_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Aggregate Sales Stats
CREATE OR REPLACE FUNCTION aggregate_sales_stats(
  user_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_deals INTEGER,
  total_value NUMERIC,
  won_deals INTEGER,
  won_value NUMERIC,
  win_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(value), 0),
    COUNT(*) FILTER (WHERE status = 'won')::INTEGER,
    COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0),
    (COUNT(*) FILTER (WHERE status = 'won')::NUMERIC / NULLIF(COUNT(*), 0)) * 100
  FROM deals
  WHERE assigned_to = user_id
    AND created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 4. Cleanup Old Records
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  DELETE FROM audit_log WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  DELETE FROM user_2fa_log WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  DELETE FROM security_events WHERE created_at < now() - INTERVAL '180 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
