CREATE OR REPLACE FUNCTION public.win_rate_breakdown(_dimension text DEFAULT 'category'::text, _days integer DEFAULT 180)
 RETURNS TABLE(segment text, total_deals integer, won_deals integer, lost_deals integer, win_rate numeric, avg_deal_size numeric, total_revenue numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _col text;
BEGIN
  _col := CASE _dimension
    WHEN 'source' THEN 'source'
    WHEN 'product' THEN 'product_name'
    ELSE 'category'
  END;

  RETURN QUERY EXECUTE format($f$
    SELECT
      COALESCE(%I::text, 'unknown'),
      COUNT(*)::integer,
      COUNT(*) FILTER (WHERE status = 'completed')::integer,
      COUNT(*) FILTER (WHERE status IN ('lost','cancelled'))::integer,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','lost','cancelled')) > 0
        THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status='completed')::numeric
          / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','lost','cancelled')),0), 1)
        ELSE 0 END,
      COALESCE(AVG(amount) FILTER (WHERE status='completed'), 0)::numeric,
      COALESCE(SUM(amount) FILTER (WHERE status='completed'), 0)::numeric
    FROM public.sales
    WHERE created_at >= now() - ($1 || ' days')::interval
      AND (public.is_admin_or_manager(auth.uid()) OR salesperson_id = public.get_current_salesperson_id())
    GROUP BY %I
    ORDER BY 7 DESC
    LIMIT 50
  $f$, _col, _col) USING _days;
END;
$function$
