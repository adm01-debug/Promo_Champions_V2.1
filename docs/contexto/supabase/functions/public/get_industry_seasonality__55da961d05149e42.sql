CREATE OR REPLACE FUNCTION public.get_industry_seasonality(_company_ids uuid[], _months integer DEFAULT 24)
 RETURNS TABLE(year double precision, month double precision, avg_quotes_per_company numeric, avg_revenue_per_company numeric, companies_active bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            EXTRACT(YEAR FROM q.created_at) as yr,
            EXTRACT(MONTH FROM q.created_at) as mon,
            q.client_id,
            COUNT(q.id) as q_count,
            SUM(q.total_amount) as total_rev
        FROM public.quotes q
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (_months || ' months')::INTERVAL
        GROUP BY 1, 2, 3
    )
    SELECT 
        yr as year,
        mon as month,
        AVG(q_count)::NUMERIC as avg_quotes_per_company,
        AVG(total_rev)::NUMERIC as avg_revenue_per_company,
        COUNT(DISTINCT client_id)::BIGINT as companies_active
    FROM monthly_stats
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC;
END;
$function$
