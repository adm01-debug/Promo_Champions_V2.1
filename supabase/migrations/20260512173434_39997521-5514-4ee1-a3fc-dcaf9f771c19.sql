CREATE OR REPLACE FUNCTION public.get_monthly_sales_benchmark(months_back INT DEFAULT 13)
RETURNS TABLE (
    month TEXT,
    revenue NUMERIC,
    deals INT,
    won_deals INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status = 'completed' THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status = 'completed' THEN 1 END)::INT as won_deals
    FROM public.sales
    WHERE created_at >= (CURRENT_DATE - (months_back || ' month')::INTERVAL)
    GROUP BY month
    ORDER BY month;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;
