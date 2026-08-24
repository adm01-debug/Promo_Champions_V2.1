-- Materialized Views for Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  user_id,
  COUNT(*) as total_deals,
  SUM(value) as total_value,
  AVG(value) as avg_value
FROM deals
WHERE status = 'won'
GROUP BY DATE_TRUNC('day', created_at), user_id;

CREATE INDEX ON mv_sales_summary(date, user_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_metrics AS
SELECT
  c.id,
  c.user_id,
  COUNT(DISTINCT d.id) as total_deals,
  SUM(CASE WHEN d.status = 'won' THEN d.value ELSE 0 END) as total_revenue,
  COUNT(DISTINCT a.id) as total_activities,
  MAX(a.created_at) as last_activity
FROM clients c
LEFT JOIN deals d ON d.client_id = c.id
LEFT JOIN activities a ON a.client_id = c.id
GROUP BY c.id, c.user_id;

CREATE INDEX ON mv_client_metrics(user_id);

-- Function to refresh views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_metrics;
END;
$$ LANGUAGE plpgsql;
