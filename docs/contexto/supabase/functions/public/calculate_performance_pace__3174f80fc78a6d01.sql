CREATE OR REPLACE FUNCTION public.calculate_performance_pace(_salesperson_id uuid)
 RETURNS TABLE(current_pct numeric, predicted_pct numeric, status text)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_goal DECIMAL;
    v_actual DECIMAL;
    v_days_elapsed INTEGER;
    v_total_days INTEGER;
BEGIN
    -- Obter meta e realizado do mês atual
    SELECT goal_amount INTO v_goal FROM sales_goals WHERE salesperson_id = _salesperson_id LIMIT 1;
    SELECT SUM(amount) INTO v_actual FROM sales WHERE salesperson_id = _salesperson_id AND status = 'completed' AND created_at >= start_of_month(now());
    
    v_days_elapsed := EXTRACT(DAY FROM now());
    v_total_days := EXTRACT(DAY FROM (end_of_month(now())));
    
    IF v_goal > 0 THEN
        current_pct := (v_actual / v_goal) * 100;
        predicted_pct := (v_actual / v_days_elapsed) * v_total_days / v_goal * 100;
        
        IF predicted_pct >= 100 THEN status := 'ahead';
        ELSIF predicted_pct >= 90 THEN status := 'on_track';
        ELSE status := 'behind';
        END IF;
    ELSE
        current_pct := 0; predicted_pct := 0; status := 'no_goal';
    END IF;
    
    RETURN NEXT;
END;
$function$
