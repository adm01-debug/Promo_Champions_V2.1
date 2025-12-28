-- Melhorias 97-98 - Materialized Views

-- 97: Dashboard KPIs View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_kpis AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'won') as deals_won,
  COUNT(*) FILTER (WHERE status = 'lost') as deals_lost,
  SUM(value) FILTER (WHERE status = 'won') as total_revenue,
  AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400) as avg_closing_days,
  COUNT(DISTINCT client_id) as unique_clients
FROM deals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

CREATE UNIQUE INDEX ON mv_dashboard_kpis(user_id);

-- 98: Sales Leaderboard View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_leaderboard AS
SELECT 
  u.id as user_id,
  u.name,
  COUNT(d.id) as deals_count,
  SUM(d.value) as total_revenue,
  RANK() OVER (ORDER BY SUM(d.value) DESC) as revenue_rank,
  RANK() OVER (ORDER BY COUNT(d.id) DESC) as deals_rank
FROM auth.users u
LEFT JOIN deals d ON d.assigned_to = u.id AND d.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name;

CREATE UNIQUE INDEX ON mv_sales_leaderboard(user_id);

-- Refresh automatically every hour
SELECT cron.schedule(
  'refresh-dashboard-kpis',
  '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_kpis'
);

SELECT cron.schedule(
  'refresh-sales-leaderboard',
  '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_leaderboard'
);
