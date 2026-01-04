-- Enhanced Materialized Views for Analytics

-- Sales Performance by User
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_performance AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won') as deals_won,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'lost') as deals_lost,
  COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0) as total_revenue,
  COALESCE(AVG(d.value) FILTER (WHERE d.status = 'won'), 0) as avg_deal_size,
  CASE 
    WHEN COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('won', 'lost')) > 0
    THEN ROUND((COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won')::DECIMAL / 
                COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('won', 'lost'))) * 100, 2)
    ELSE 0
  END as win_rate,
  DATE_TRUNC('month', CURRENT_DATE) as period
FROM auth.users u
LEFT JOIN deals d ON d.owner_id = u.id
WHERE d.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.email;

CREATE UNIQUE INDEX ON mv_sales_performance (user_id, period);

-- Monthly Revenue Trend
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_revenue AS
SELECT 
  DATE_TRUNC('month', closed_at) as month,
  COUNT(*) as deals_count,
  SUM(value) as total_revenue,
  AVG(value) as avg_deal_size,
  MAX(value) as largest_deal
FROM deals
WHERE status = 'won' AND closed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', closed_at)
ORDER BY month DESC;

CREATE UNIQUE INDEX ON mv_monthly_revenue (month);

-- Product Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_performance AS
SELECT 
  p.id as product_id,
  p.name,
  COUNT(DISTINCT dp.deal_id) as deals_count,
  SUM(dp.quantity) as total_quantity_sold,
  SUM(dp.quantity * dp.unit_price) as total_revenue,
  AVG(dp.unit_price) as avg_price
FROM products p
LEFT JOIN deal_products dp ON dp.product_id = p.id
LEFT JOIN deals d ON d.id = dp.deal_id AND d.status = 'won'
GROUP BY p.id, p.name;

CREATE UNIQUE INDEX ON mv_product_performance (product_id);

-- Client Lifetime Value
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_ltv AS
SELECT 
  c.id as client_id,
  c.name,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won') as total_deals,
  COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0) as lifetime_value,
  MIN(d.created_at) as first_deal_date,
  MAX(d.closed_at) FILTER (WHERE d.status = 'won') as last_purchase_date,
  EXTRACT(EPOCH FROM (MAX(d.closed_at) - MIN(d.created_at))) / 86400 as customer_age_days
FROM clients c
LEFT JOIN deals d ON d.client_id = c.id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX ON mv_client_ltv (client_id);

-- Pipeline Health
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pipeline_health AS
SELECT 
  stage,
  COUNT(*) as deals_count,
  SUM(value) as total_value,
  AVG(value) as avg_deal_size,
  AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400) as avg_age_days
FROM deals
WHERE status = 'open'
GROUP BY stage;

CREATE UNIQUE INDEX ON mv_pipeline_health (stage);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_revenue;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_ltv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_health;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (example using pg_cron if available)
-- SELECT cron.schedule('refresh-views', '0 */6 * * *', 'SELECT refresh_materialized_views()');
