CREATE OR REPLACE FUNCTION private.update_performance_bet_progress()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    bet_record RECORD;
    progress_val NUMERIC;
    xp_change INTEGER;
BEGIN
    FOR bet_record IN 
        SELECT * FROM public.performance_bets 
        WHERE status = 'active'
    LOOP
        progress_val := 0;
        
        -- Calculate progress based on bet type
        IF bet_record.bet_type = 'deals' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.sales 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF bet_record.bet_type = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO progress_val 
            FROM public.sales 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF bet_record.bet_type = 'calls' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND activity_type = 'call';
              
        ELSIF bet_record.bet_type = 'meetings' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND activity_type = 'meeting';
              
        ELSIF bet_record.bet_type = 'activities' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at;
        END IF;

        -- Update the current value
        UPDATE public.performance_bets 
        SET current_value = progress_val,
            updated_at = now()
        WHERE id = bet_record.id;
        
        -- Check if target reached (WON)
        IF progress_val >= bet_record.target_value THEN
            UPDATE public.performance_bets 
            SET status = 'won', resolved_at = now() 
            WHERE id = bet_record.id;
            
            xp_change := (bet_record.xp_wagered * bet_record.xp_multiplier)::INTEGER;
            
            -- Award XP
            UPDATE public.salesperson_xp 
            SET total_xp = total_xp + xp_change,
                updated_at = now()
            WHERE salesperson_id = bet_record.salesperson_id;
            
            -- Log history
            INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
            VALUES (bet_record.salesperson_id, xp_change, 'bet_won', bet_record.id, 'Ganhou aposta: ' || bet_record.description);
            
        -- Check if expired (LOST)
        ELSIF now() > bet_record.ends_at THEN
            UPDATE public.performance_bets 
            SET status = 'lost', resolved_at = now() 
            WHERE id = bet_record.id;
            
            UPDATE public.salesperson_xp 
            SET total_xp = GREATEST(0, total_xp - bet_record.xp_wagered),
                updated_at = now()
            WHERE salesperson_id = bet_record.salesperson_id;
        END IF;
    END LOOP;
END;
$function$
