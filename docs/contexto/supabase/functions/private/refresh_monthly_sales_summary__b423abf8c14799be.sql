CREATE OR REPLACE FUNCTION private.refresh_monthly_sales_summary(p_month text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, updated_at)
    SELECT 
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN 1 END)::INT as won_deals,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE 
    SET revenue = EXCLUDED.revenue,
        deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals,
        updated_at = EXCLUDED.updated_at;
END;
$function$
