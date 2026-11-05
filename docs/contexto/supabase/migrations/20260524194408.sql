-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_client_top_products(uuid, integer);
DROP FUNCTION IF EXISTS public.get_industry_top_products(text, integer, integer);
DROP FUNCTION IF EXISTS public.get_client_seasonality(uuid, integer);
DROP FUNCTION IF EXISTS public.get_industry_seasonality(text, integer);

-- Recreate with correct signatures
-- get_client_top_products(_client_id, _limit)
CREATE OR REPLACE FUNCTION public.get_client_top_products(_client_id UUID, _limit INT DEFAULT 5)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_quantity BIGINT,
    total_revenue NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- get_industry_top_products(_company_ids, _days, _limit)
CREATE OR REPLACE FUNCTION public.get_industry_top_products(_company_ids UUID[], _days INT DEFAULT 90, _limit INT DEFAULT 5)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_sales BIGINT,
    growth_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qi.product_id,
        p.name as product_name,
        COUNT(qi.id)::BIGINT as total_sales,
        15.5::NUMERIC as growth_rate -- Placeholder
    FROM public.quotes q
    JOIN public.quote_items qi ON q.id = qi.quote_id
    JOIN public.products p ON qi.product_id = p.id
    WHERE q.client_id = ANY(_company_ids)
    AND q.created_at >= NOW() - (_days || ' days')::INTERVAL
    AND q.status = 'approved'
    GROUP BY qi.product_id, p.name
    ORDER BY total_sales DESC
    LIMIT _limit;
END;
$$;

-- get_industry_benchmark_stats(_company_ids, _days)
CREATE OR REPLACE FUNCTION public.get_industry_benchmark_stats(_company_ids UUID[], _days INT DEFAULT 180)
RETURNS TABLE (
    metric_name TEXT,
    industry_avg NUMERIC,
    unit TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT 'Volume'::TEXT, 75.0::NUMERIC, 'un'::TEXT
    UNION ALL
    SELECT 'Conversão'::TEXT, 10.5::NUMERIC, '%'::TEXT
    UNION ALL
    SELECT 'Frequência'::TEXT, 3.8::NUMERIC, 'ped/mês'::TEXT
    UNION ALL
    SELECT 'Satisfação'::TEXT, 85.0::NUMERIC, 'pts'::TEXT;
END;
$$;

-- get_client_seasonality(_client_id, _months DEFAULT 24)
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

-- get_industry_seasonality(_company_ids, _months DEFAULT 24)
CREATE OR REPLACE FUNCTION public.get_industry_seasonality(_company_ids UUID[], _months INT DEFAULT 24)
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
$$;
