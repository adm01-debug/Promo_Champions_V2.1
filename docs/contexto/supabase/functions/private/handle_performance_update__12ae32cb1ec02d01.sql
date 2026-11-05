CREATE OR REPLACE FUNCTION private.handle_performance_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_bet RECORD;
    v_xp_change INTEGER;
BEGIN
    -- Only process active bets for the salesperson involved
    FOR v_bet IN 
        SELECT * FROM public.performance_bets 
        WHERE status = 'active' 
        AND salesperson_id = NEW.salesperson_id
    LOOP
        -- Calculate current progress for this specific bet
        IF v_bet.bet_type = 'deals' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.sales 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF v_bet.bet_type = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_bet.current_value 
            FROM public.sales 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF v_bet.bet_type = 'calls' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND activity_type = 'call';
              
        ELSIF v_bet.bet_type = 'meetings' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND activity_type = 'meeting';
              
        ELSIF v_bet.bet_type = 'activities' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at;
        END IF;

        -- Update the current value and check status
        IF v_bet.current_value >= v_bet.target_value THEN
            -- Bet Won
            v_xp_change := (v_bet.xp_wagered * v_bet.xp_multiplier)::INTEGER;
            
            UPDATE public.performance_bets 
            SET current_value = v_bet.current_value,
                status = 'won', 
                resolved_at = now(),
                updated_at = now()
            WHERE id = v_bet.id;
            
            -- Award XP
            INSERT INTO public.xp_transactions (salesperson_id, amount, source, source_id, description)
            VALUES (v_bet.salesperson_id, v_xp_change, 'bet', v_bet.id, 'Vitória em Aposta: ' || v_bet.description);
        ELSE
            UPDATE public.performance_bets 
            SET current_value = v_bet.current_value,
                updated_at = now()
            WHERE id = v_bet.id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$function$
