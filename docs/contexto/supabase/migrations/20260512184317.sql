-- Add optimized indexes for temporal queries
CREATE INDEX IF NOT EXISTS idx_sales_created_at_won ON public.sales (created_at) WHERE (status = 'won');

-- Function for High-Performance YoY Benchmark
CREATE OR REPLACE FUNCTION public.get_historical_benchmark(
    p_salesperson_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB AS $$
DECLARE
    current_period_revenue NUMERIC;
    previous_period_revenue NUMERIC;
    current_period_deals INTEGER;
    previous_period_deals INTEGER;
    days_diff INTEGER;
    p_prev_start TIMESTAMP WITH TIME ZONE;
    p_prev_end TIMESTAMP WITH TIME ZONE;
BEGIN
    days_diff := (p_end_date::date - p_start_date::date);
    p_prev_start := p_start_date - (days_diff || ' days')::INTERVAL;
    p_prev_end := p_start_date - INTERVAL '1 second';

    -- Current Period
    SELECT COALESCE(SUM(amount), 0), COUNT(*)
    INTO current_period_revenue, current_period_deals
    FROM public.sales
    WHERE (p_salesperson_id IS NULL OR salesperson_id = p_salesperson_id)
    AND created_at BETWEEN p_start_date AND p_end_date
    AND status = 'won';

    -- Previous Period
    SELECT COALESCE(SUM(amount), 0), COUNT(*)
    INTO previous_period_revenue, previous_period_deals
    FROM public.sales
    WHERE (p_salesperson_id IS NULL OR salesperson_id = p_salesperson_id)
    AND created_at BETWEEN p_prev_start AND p_prev_end
    AND status = 'won';

    RETURN jsonb_build_object(
        'current', jsonb_build_object('revenue', current_period_revenue, 'deals', current_period_deals),
        'previous', jsonb_build_object('revenue', previous_period_revenue, 'deals', previous_period_deals),
        'growth', jsonb_build_object(
            'revenue_pct', CASE WHEN previous_period_revenue = 0 THEN 100 ELSE ((current_period_revenue - previous_period_revenue) / previous_period_revenue * 100) END,
            'deals_pct', CASE WHEN previous_period_deals = 0 THEN 100 ELSE ((current_period_deals - previous_period_deals)::NUMERIC / previous_period_deals * 100) END
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;
