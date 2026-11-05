CREATE OR REPLACE FUNCTION public.compute_forecast_rollup(_horizon_days integer DEFAULT 90)
 RETURNS TABLE(category forecast_category, deal_count integer, total_amount numeric, weighted_amount numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH weights AS (
    SELECT * FROM (VALUES
      ('commit'::forecast_category, 0.90),
      ('best_case'::forecast_category, 0.60),
      ('pipeline'::forecast_category, 0.25),
      ('omitted'::forecast_category, 0.0),
      ('closed'::forecast_category, 1.0)
    ) AS t(c, w)
  )
  SELECT
    s.forecast_category,
    COUNT(*)::integer,
    COALESCE(SUM(s.amount), 0)::numeric,
    COALESCE(SUM(s.amount * w.w), 0)::numeric
  FROM public.sales s
  LEFT JOIN weights w ON w.c = s.forecast_category
  WHERE s.created_at >= now() - (_horizon_days || ' days')::interval
    AND s.forecast_category IS NOT NULL
    AND (is_admin_or_manager(auth.uid()) OR s.salesperson_id = get_current_salesperson_id())
  GROUP BY s.forecast_category
  ORDER BY s.forecast_category;
END;
$function$
