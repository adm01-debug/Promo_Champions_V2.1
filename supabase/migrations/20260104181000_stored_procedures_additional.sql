-- Additional Stored Procedures

-- Calculate Team Performance
CREATE OR REPLACE FUNCTION calculate_team_performance(
  p_team_id UUID,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  deals_count INTEGER,
  revenue DECIMAL,
  win_rate DECIMAL,
  avg_deal_size DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COUNT(DISTINCT d.id)::INTEGER,
    COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0)::DECIMAL,
    CASE 
      WHEN COUNT(d.id) > 0 
      THEN (COUNT(d.id) FILTER (WHERE d.status = 'won')::DECIMAL / COUNT(d.id) * 100)
      ELSE 0 
    END::DECIMAL,
    COALESCE(AVG(d.value) FILTER (WHERE d.status = 'won'), 0)::DECIMAL
  FROM users u
  LEFT JOIN team_members tm ON tm.user_id = u.id
  LEFT JOIN deals d ON d.owner_id = u.id 
    AND d.created_at BETWEEN p_start_date AND p_end_date
  WHERE tm.team_id = p_team_id
  GROUP BY u.id, u.email
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Bulk Update Deal Stages
CREATE OR REPLACE FUNCTION bulk_update_deal_stages(
  p_deal_ids UUID[],
  p_new_stage TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE deals
  SET stage = p_new_stage, updated_at = NOW()
  WHERE id = ANY(p_deal_ids);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Archive Old Activities
CREATE OR REPLACE FUNCTION archive_old_activities(
  p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  v_archived_count INTEGER;
BEGIN
  WITH archived AS (
    DELETE FROM activities
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    RETURNING *
  )
  INSERT INTO activities_archive
  SELECT * FROM archived;
  
  GET DIAGNOSTICS v_archived_count = ROW_COUNT;
  
  RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;

-- Calculate Deal Health Score
CREATE OR REPLACE FUNCTION calculate_deal_health_score(p_deal_id UUID)
RETURNS DECIMAL AS $$
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
$$ LANGUAGE plpgsql;

-- Generate Sales Forecast
CREATE OR REPLACE FUNCTION generate_sales_forecast(
  p_user_id UUID DEFAULT NULL,
  p_periods INTEGER DEFAULT 3
)
RETURNS TABLE (
  period_start DATE,
  period_end DATE,
  forecasted_revenue DECIMAL,
  confidence_level TEXT
) AS $$
DECLARE
  v_avg_monthly DECIMAL;
  v_growth_rate DECIMAL;
BEGIN
  -- Calculate average and growth
  SELECT 
    AVG(monthly_revenue),
    CASE 
      WHEN COUNT(*) > 1 
      THEN (MAX(monthly_revenue) - MIN(monthly_revenue)) / NULLIF(MIN(monthly_revenue), 0)
      ELSE 0 
    END
  INTO v_avg_monthly, v_growth_rate
  FROM (
    SELECT 
      DATE_TRUNC('month', closed_at) as month,
      SUM(value) as monthly_revenue
    FROM deals
    WHERE status = 'won' 
      AND (p_user_id IS NULL OR owner_id = p_user_id)
      AND closed_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', closed_at)
  ) recent_months;
  
  -- Generate forecast
  FOR i IN 1..p_periods LOOP
    RETURN QUERY
    SELECT 
      DATE_TRUNC('month', NOW() + (i || ' months')::INTERVAL)::DATE,
      (DATE_TRUNC('month', NOW() + (i || ' months')::INTERVAL) + INTERVAL '1 month - 1 day')::DATE,
      (v_avg_monthly * (1 + v_growth_rate * i / p_periods))::DECIMAL,
      CASE 
        WHEN i = 1 THEN 'High'
        WHEN i = 2 THEN 'Medium'
        ELSE 'Low'
      END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
