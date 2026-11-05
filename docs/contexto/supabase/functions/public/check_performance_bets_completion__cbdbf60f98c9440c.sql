CREATE OR REPLACE FUNCTION public.check_performance_bets_completion(p_salesperson_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    bet_record RECORD;
    xp_to_award INTEGER;
BEGIN
    FOR bet_record IN 
        SELECT * FROM public.performance_bets 
        WHERE salesperson_id = p_salesperson_id 
        AND status = 'active'
    LOOP
        -- Check if WON
        IF bet_record.current_value >= bet_record.target_value THEN
            UPDATE public.performance_bets 
            SET status = 'won', resolved_at = now()
            WHERE id = bet_record.id;
            
            -- Award XP (Wager * Multiplier)
            xp_to_award := (bet_record.xp_wagered * bet_record.xp_multiplier)::INTEGER;
            
            -- We call the existing add_xp logic if it was a function, 
            -- but since it's likely handled by app or another trigger, 
            -- we insert directly into xp_history to trigger its own flow
            INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
            VALUES (
                p_salesperson_id, 
                xp_to_award, 
                'performance_bet', 
                bet_record.id, 
                'Ganhou aposta de performance: ' || bet_record.description
            );
            
        -- Check if LOST (expired)
        ELSIF bet_record.ends_at < now() THEN
            UPDATE public.performance_bets 
            SET status = 'lost', resolved_at = now()
            WHERE id = bet_record.id;
            
            -- No XP awarded, wager was already "spent" or just lost
            -- Optionally log a negative XP or just end the streak
        END IF;
    END LOOP;
END;
$function$
