CREATE OR REPLACE FUNCTION private.settle_performance_bets()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_bet RECORD;
    v_xp_change INTEGER;
BEGIN
    FOR v_bet IN 
        SELECT * FROM public.performance_bets 
        WHERE status = 'active' AND (current_value >= target_value OR ends_at < NOW())
    LOOP
        IF v_bet.current_value >= v_bet.target_value THEN
            -- Bet Won
            v_xp_change := ROUND(v_bet.xp_wagered * (v_bet.xp_multiplier - 1));
            
            UPDATE public.performance_bets 
            SET status = 'won', resolved_at = NOW() 
            WHERE id = v_bet.id;

            -- Award XP (using existing XP system if available, else direct insert)
            INSERT INTO public.xp_transactions (salesperson_id, amount, source, source_id, description)
            VALUES (v_bet.salesperson_id, v_xp_change, 'bet', v_bet.id, 'Vitória em Aposta de Performance: ' || v_bet.bet_type);
            
        ELSIF v_bet.ends_at < NOW() THEN
            -- Bet Lost
            v_xp_change := -v_bet.xp_wagered;

            UPDATE public.performance_bets 
            SET status = 'lost', resolved_at = NOW() 
            WHERE id = v_bet.id;

            -- Deduct XP
            INSERT INTO public.xp_transactions (salesperson_id, amount, source, source_id, description)
            VALUES (v_bet.salesperson_id, v_xp_change, 'bet', v_bet.id, 'Falha em Aposta de Performance: ' || v_bet.bet_type);
        END IF;
    END LOOP;
END;
$function$
