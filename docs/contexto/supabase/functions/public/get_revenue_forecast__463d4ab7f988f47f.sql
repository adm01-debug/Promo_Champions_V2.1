CREATE OR REPLACE FUNCTION public.get_revenue_forecast(_days integer DEFAULT 90)
 RETURNS TABLE(period text, weighted_revenue numeric, raw_pipeline numeric, deal_count integer, avg_health integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH stage_weights AS (
    SELECT * FROM (VALUES
      ('lead', 0.05),
      ('prospecting', 0.15),
      ('qualified', 0.30),
      ('proposal', 0.55),
      ('negotiation', 0.75),
      ('closed', 0.95)
    ) AS t(stage, weight)
  ),
  windows AS (
    SELECT * FROM (VALUES ('30d', 30), ('60d', 60), ('90d', 90)) AS w(label, days)
    WHERE days <= _days
  ),
  deals AS (
    SELECT s.id, s.amount, s.stage, s.updated_at
    FROM public.sales s
    WHERE s.status NOT IN ('completed','lost','cancelled')
      AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ),
  latest_health AS (
    SELECT DISTINCT ON (sale_id) sale_id, health_score
    FROM public.deal_health_scores
    ORDER BY sale_id, computed_at DESC
  )
  SELECT
    w.label,
    COALESCE(SUM(d.amount * sw.weight), 0)::NUMERIC,
    COALESCE(SUM(d.amount), 0)::NUMERIC,
    COUNT(d.id)::INTEGER,
    COALESCE(AVG(lh.health_score)::INTEGER, 50)
  FROM windows w
  LEFT JOIN deals d ON d.updated_at >= now() - (w.days || ' days')::INTERVAL
  LEFT JOIN stage_weights sw ON sw.stage = d.stage
  LEFT JOIN latest_health lh ON lh.sale_id = d.id
  GROUP BY w.label, w.days
  ORDER BY w.days;
END;
$function$
