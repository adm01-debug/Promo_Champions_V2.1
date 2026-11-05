CREATE OR REPLACE FUNCTION public.sync_performance_bets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_salesperson_id UUID;
BEGIN
    v_salesperson_id := COALESCE(NEW.salesperson_id, OLD.salesperson_id);

    -- Update active bets for this salesperson
    UPDATE public.performance_bets b
    SET current_value = (
        CASE 
            WHEN b.bet_type = 'deals' THEN (
                SELECT COUNT(*) FROM public.sales 
                WHERE salesperson_id = v_salesperson_id AND deal_status = 'completed' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'revenue' THEN (
                SELECT COALESCE(SUM(amount), 0) FROM public.sales 
                WHERE salesperson_id = v_salesperson_id AND deal_status = 'completed' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'calls' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND activity_type = 'call' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'meetings' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND activity_type = 'meeting' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'activities' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            ELSE b.current_value
        END
    )
    WHERE b.status = 'active' AND b.salesperson_id = v_salesperson_id;

    RETURN NEW;
END;
$function$
