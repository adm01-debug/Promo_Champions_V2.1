CREATE OR REPLACE FUNCTION public.get_detailed_kpis()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
