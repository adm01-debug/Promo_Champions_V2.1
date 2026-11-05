CREATE OR REPLACE FUNCTION public.calculate_asset_efficiency(_asset_id uuid)
 RETURNS TABLE(total_views bigint, deals_influenced bigint, win_rate_influenced numeric, total_revenue_influenced numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::BIGINT as total_views,
        COUNT(DISTINCT s.id)::BIGINT as deals_influenced,
        CASE 
            WHEN COUNT(DISTINCT l.deal_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END)::DECIMAL / COUNT(DISTINCT l.deal_id) * 100)
            ELSE 0 
        END as win_rate_influenced,
        COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.amount END), 0) as total_revenue_influenced
    FROM public.asset_usage_logs l
    LEFT JOIN public.sales s ON l.deal_id = s.id
    WHERE l.asset_id = _asset_id;
END;
$function$
