CREATE OR REPLACE FUNCTION public.generate_sales_forecast(p_user_id uuid DEFAULT NULL::uuid, p_periods integer DEFAULT 3)
 RETURNS TABLE(period_start date, period_end date, forecasted_revenue numeric, confidence_level text)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
