CREATE OR REPLACE FUNCTION public.get_monthly_sales_benchmark(months_back integer DEFAULT 13)
 RETURNS TABLE(month text, revenue numeric, deals integer, won_deals integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.month,
        s.revenue,
        s.deals,
        s.won_deals
    FROM public.monthly_sales_summary s
    WHERE s.month >= to_char(CURRENT_DATE - (months_back || ' month')::INTERVAL, 'YYYY-MM')
    ORDER BY s.month;
END;
$function$
