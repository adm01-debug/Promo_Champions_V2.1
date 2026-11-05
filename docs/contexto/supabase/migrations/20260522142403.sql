-- 1. SECURITY: Revoke global execute and grant specifically
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant execute back to authenticated users for necessary functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure specific sensitive functions are NOT executable by anon
REVOKE EXECUTE ON FUNCTION public.get_current_salesperson_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_sale_commissions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_sdr_id_on_insert() FROM anon;

-- 2. PERFORMANCE: Database-side KPI aggregation
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date date, end_date date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH period_sales AS (
        SELECT amount, is_first_sale
        FROM sales
        WHERE created_at >= start_date::timestamp AT TIME ZONE 'UTC'
          AND created_at < (end_date + interval '1 day')::timestamp AT TIME ZONE 'UTC'
          AND status = 'completed'
    ),
    period_metrics AS (
        SELECT new_clients, conversion_rate
        FROM daily_metrics
        WHERE date >= start_date 
          AND date <= end_date
    )
    SELECT jsonb_build_object(
        'totalRevenue', COALESCE(SUM(amount), 0),
        'totalSales', COUNT(*),
        'firstSaleRevenue', COALESCE(SUM(CASE WHEN is_first_sale THEN amount ELSE 0 END), 0),
        'recurringRevenue', COALESCE(SUM(CASE WHEN NOT is_first_sale THEN amount ELSE 0 END), 0),
        'newClients', (SELECT COALESCE(SUM(new_clients), 0) FROM period_metrics),
        'conversionRate', (SELECT COALESCE(AVG(conversion_rate), 0) FROM period_metrics),
        'avgTicket', CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(amount), 0) / COUNT(*) ELSE 0 END
    ) INTO result
    FROM period_sales;

    RETURN result;
END;
$$;

-- 3. PERFORMANCE: Detailed KPIs aggregation
CREATE OR REPLACE FUNCTION public.get_detailed_kpis()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    now_date date := current_date;
    current_start date := date_trunc('month', now_date)::date;
    current_end date := (date_trunc('month', now_date) + interval '1 month - 1 day')::date;
    prev_start date := (date_trunc('month', now_date) - interval '1 month')::date;
    prev_end date := (date_trunc('month', now_date) - interval '1 day')::date;
    sixty_days_ago timestamptz := now() - interval '60 days';
BEGIN
    RETURN (
        WITH current_metrics AS (
            SELECT AVG(avg_ticket) as avg_ticket, AVG(conversion_rate) as conversion_rate
            FROM daily_metrics
            WHERE date >= current_start AND date <= current_end
        ),
        prev_metrics AS (
            SELECT AVG(avg_ticket) as avg_ticket, AVG(conversion_rate) as conversion_rate
            FROM daily_metrics
            WHERE date >= prev_start AND date <= prev_end
        ),
        closing_time AS (
            SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(exited_at, now()) - entered_at)) / 86400) as avg_days
            FROM deal_stage_history
            WHERE (stage = 'completed' OR stage = 'Fechado')
              AND entered_at >= sixty_days_ago
        ),
        return_metrics AS (
            SELECT 
                COUNT(*) as total_sales,
                COUNT(DISTINCT client_name) as unique_clients
            FROM sales
            WHERE status = 'completed' AND created_at >= sixty_days_ago
        )
        SELECT jsonb_build_object(
            'current_avg_ticket', COALESCE((SELECT avg_ticket FROM current_metrics), 0),
            'prev_avg_ticket', COALESCE((SELECT avg_ticket FROM prev_metrics), 0),
            'current_conversion', COALESCE((SELECT conversion_rate FROM current_metrics), 0),
            'prev_conversion', COALESCE((SELECT conversion_rate FROM prev_metrics), 0),
            'avg_closing_days', COALESCE((SELECT avg_days FROM closing_time), 0),
            'return_rate', CASE 
                WHEN (SELECT total_sales FROM return_metrics) > 0 
                THEN ((SELECT total_sales FROM return_metrics) - (SELECT unique_clients FROM return_metrics))::float / (SELECT total_sales FROM return_metrics) * 100
                ELSE 0 
            END
        )
    );
END;
$$;

-- 4. PERFORMANCE: Missing indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales (created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status_is_first_sale ON public.sales (status, is_first_sale);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics (date);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_entered_at ON public.deal_stage_history (entered_at) WHERE stage IN ('completed', 'Fechado');
