CREATE OR REPLACE FUNCTION public.get_client_top_products(_client_id uuid, _limit integer DEFAULT 5)
 RETURNS TABLE(product_id uuid, product_name text, total_quantity bigint, total_revenue numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        qi.product_id,
        p.name as product_name,
        SUM(qi.quantity)::BIGINT as total_quantity,
        SUM(qi.unit_price * qi.quantity)::NUMERIC as total_revenue
    FROM public.quotes q
    JOIN public.quote_items qi ON q.id = qi.quote_id
    JOIN public.products p ON qi.product_id = p.id
    WHERE q.client_id = _client_id
    AND q.status = 'approved'
    GROUP BY qi.product_id, p.name
    ORDER BY total_revenue DESC
    LIMIT _limit;
END;
$function$
