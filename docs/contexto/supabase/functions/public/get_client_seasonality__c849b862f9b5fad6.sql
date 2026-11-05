CREATE OR REPLACE FUNCTION public.get_client_seasonality(_client_id uuid, _months integer DEFAULT 24)
 RETURNS TABLE(year double precision, month double precision, quotes_count bigint, total_revenue numeric, avg_ticket numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM q.created_at) as year,
        EXTRACT(MONTH FROM q.created_at) as month,
        COUNT(q.id)::BIGINT as quotes_count,
        SUM(q.total_amount)::NUMERIC as total_revenue,
        AVG(q.total_amount)::NUMERIC as avg_ticket
    FROM public.quotes q
    WHERE q.client_id = _client_id
    AND q.created_at >= NOW() - (_months || ' months')::INTERVAL
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC;
END;
$function$
