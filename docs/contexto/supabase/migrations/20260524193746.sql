-- Function to get top products for a specific client
CREATE OR REPLACE FUNCTION public.get_client_top_products(_client_id UUID, _limit INT DEFAULT 5)
RETURNS TABLE (
    product_name TEXT,
    total_quantity BIGINT,
    total_revenue NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name as product_name,
        SUM(qi.quantity)::BIGINT as total_quantity,
        SUM(qi.unit_price * qi.quantity)::NUMERIC as total_revenue
    FROM public.quotes q
    JOIN public.quote_items qi ON q.id = qi.quote_id
    JOIN public.products p ON qi.product_id = p.id
    WHERE q.client_id = _client_id
    AND q.status = 'approved'
    GROUP BY p.name
    ORDER BY total_revenue DESC
    LIMIT _limit;
END;
$$;

-- Function to get top products in an industry
CREATE OR REPLACE FUNCTION public.get_industry_top_products(_ramo_atividade TEXT, _days INT DEFAULT 90, _limit INT DEFAULT 5)
RETURNS TABLE (
    product_name TEXT,
    total_sales BIGINT,
    growth_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name as product_name,
        COUNT(qi.id)::BIGINT as total_sales,
        15.5::NUMERIC as growth_rate -- Placeholder for actual growth calculation logic
    FROM public.quotes q
    JOIN public.clients c ON q.client_id = c.id
    JOIN public.quote_items qi ON q.id = qi.quote_id
    JOIN public.products p ON qi.product_id = p.id
    WHERE (c.ramo_atividade ILIKE _ramo_atividade OR _ramo_atividade IS NULL)
    AND q.created_at >= NOW() - (_days || ' days')::INTERVAL
    AND q.status = 'approved'
    GROUP BY p.name
    ORDER BY total_sales DESC
    LIMIT _limit;
END;
$$;

-- Function for Client Seasonality (Zona 5)
CREATE OR REPLACE FUNCTION public.get_client_seasonality(_client_id UUID, _months INT DEFAULT 24)
RETURNS TABLE (
    year DOUBLE PRECISION,
    month DOUBLE PRECISION,
    quotes_count BIGINT,
    total_revenue NUMERIC,
    avg_ticket NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Function for Industry Seasonality (Zona 5)
CREATE OR REPLACE FUNCTION public.get_industry_seasonality(_ramo_atividade TEXT, _months INT DEFAULT 24)
RETURNS TABLE (
    year DOUBLE PRECISION,
    month DOUBLE PRECISION,
    avg_quotes_per_company NUMERIC,
    avg_revenue_per_company NUMERIC,
    companies_active BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
        JOIN public.clients c ON q.client_id = c.id
        WHERE c.ramo_atividade ILIKE _ramo_atividade
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
$$;
