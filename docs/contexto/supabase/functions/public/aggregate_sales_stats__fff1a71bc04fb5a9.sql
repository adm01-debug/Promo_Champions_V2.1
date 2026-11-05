CREATE OR REPLACE FUNCTION public.aggregate_sales_stats(user_id uuid, start_date date, end_date date)
 RETURNS TABLE(total_deals integer, total_value numeric, won_deals integer, won_value numeric, win_rate numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
