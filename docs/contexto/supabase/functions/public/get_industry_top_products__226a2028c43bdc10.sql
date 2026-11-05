CREATE OR REPLACE FUNCTION public.get_industry_top_products(_company_ids uuid[], _days integer DEFAULT 90, _limit integer DEFAULT 5)
 RETURNS TABLE(product_id uuid, product_name text, total_sales bigint, growth_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH cur AS (
        SELECT qi.product_id, COUNT(qi.id)::BIGINT AS sales_now
        FROM public.quotes q
        JOIN public.quote_items qi ON q.id = qi.quote_id
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (_days || ' days')::INTERVAL
        AND q.status = 'approved'
        GROUP BY qi.product_id
    ),
    prev AS (
        SELECT qi.product_id, COUNT(qi.id)::BIGINT AS sales_prev
        FROM public.quotes q
        JOIN public.quote_items qi ON q.id = qi.quote_id
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (2 * _days || ' days')::INTERVAL
        AND q.created_at <  NOW() - (_days || ' days')::INTERVAL
        AND q.status = 'approved'
        GROUP BY qi.product_id
    )
    SELECT
        c.product_id,
        p.name as product_name,
        c.sales_now as total_sales,
        CASE
            WHEN COALESCE(pr.sales_prev, 0) > 0
            THEN ROUND(((c.sales_now - pr.sales_prev)::NUMERIC / pr.sales_prev) * 100, 1)
            ELSE 0::NUMERIC
        END as growth_rate
    FROM cur c
    JOIN public.products p ON c.product_id = p.id
    LEFT JOIN prev pr ON pr.product_id = c.product_id
    ORDER BY total_sales DESC
    LIMIT _limit;
END;
$function$
