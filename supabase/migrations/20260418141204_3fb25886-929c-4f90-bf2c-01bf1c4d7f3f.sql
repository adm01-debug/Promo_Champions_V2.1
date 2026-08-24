CREATE OR REPLACE VIEW public.revenue_forecast_view AS
WITH open_deals AS (
  SELECT
    s.id,
    s.salesperson_id,
    s.amount,
    s.status,
    s.created_at,
    s.updated_at,
    CASE s.status
      WHEN 'lead' THEN 0.10
      WHEN 'qualified' THEN 0.30
      WHEN 'proposal' THEN 0.55
      WHEN 'negotiation' THEN 0.75
      WHEN 'pending' THEN 0.85
      ELSE 0.20
    END AS stage_probability
  FROM public.sales s
  WHERE s.status NOT IN ('completed', 'lost')
),
closed_recent AS (
  SELECT
    salesperson_id,
    COUNT(*) AS won_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0) AS avg_cycle_days,
    SUM(amount) AS won_amount_90d
  FROM public.sales
  WHERE status = 'completed'
    AND updated_at >= now() - interval '90 days'
  GROUP BY salesperson_id
),
goals_current AS (
  SELECT salesperson_id, goal_amount
  FROM public.sales_goals
  WHERE month = date_trunc('month', now())::date
)
SELECT
  COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
  COALESCE(SUM(od.amount), 0) AS total_open_pipeline,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS weighted_forecast,
  COUNT(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
  COALESCE(MAX(cr.avg_cycle_days), 45) AS avg_cycle_days,
  COALESCE(MAX(cr.won_amount_90d), 0) AS won_amount_90d,
  COALESCE(MAX(cr.won_count), 0) AS won_count_90d,
  COALESCE(MAX(gc.goal_amount), 0) AS monthly_goal,
  COALESCE(SUM(od.amount * od.stage_probability), 0) * 0.70 AS pessimistic_30d,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS realistic_30d,
  COALESCE(SUM(od.amount * od.stage_probability), 0) * 1.25 AS optimistic_30d
FROM open_deals od
FULL OUTER JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
FULL OUTER JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

GRANT SELECT ON public.revenue_forecast_view TO authenticated;