-- Function to update bet progress based on new activities/sales
CREATE OR REPLACE FUNCTION public.process_performance_bet_event()
RETURNS TRIGGER AS $$
DECLARE
    bet_record RECORD;
    val_to_add NUMERIC := 0;
BEGIN
    -- This trigger should run after activities or sales inserts
    
    -- If it's a sale, we might be tracking 'deals' or 'revenue'
    IF TG_TABLE_NAME = 'sales' THEN
        -- Loop through active bets for this salesperson
        FOR bet_record IN 
            SELECT * FROM public.performance_bets 
            WHERE salesperson_id = NEW.salesperson_id 
            AND status = 'active'
            AND ends_at > now()
        LOOP
            IF bet_record.bet_type = 'deals' THEN
                UPDATE public.performance_bets 
                SET current_value = current_value + 1
                WHERE id = bet_record.id;
            ELSIF bet_record.bet_type = 'revenue' THEN
                UPDATE public.performance_bets 
                SET current_value = current_value + COALESCE(NEW.value, 0)
                WHERE id = bet_record.id;
            END IF;
        END LOOP;
        
    -- If it's an activity, we might be tracking 'calls', 'meetings' or 'activities'
    ELSIF TG_TABLE_NAME = 'activities' THEN
        FOR bet_record IN 
            SELECT * FROM public.performance_bets 
            WHERE salesperson_id = NEW.salesperson_id 
            AND status = 'active'
            AND ends_at > now()
        LOOP
            IF bet_record.bet_type = 'activities' THEN
                UPDATE public.performance_bets SET current_value = current_value + 1 WHERE id = bet_record.id;
            ELSIF bet_record.bet_type = 'calls' AND NEW.activity_type = 'call' THEN
                UPDATE public.performance_bets SET current_value = current_value + 1 WHERE id = bet_record.id;
            ELSIF bet_record.bet_type = 'meetings' AND NEW.activity_type = 'meeting' THEN
                UPDATE public.performance_bets SET current_value = current_value + 1 WHERE id = bet_record.id;
            END IF;
        END LOOP;
    END IF;

    -- Trigger a check for completion after update
    PERFORM public.check_performance_bets_completion(NEW.salesperson_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check and resolve completed bets
CREATE OR REPLACE FUNCTION public.check_performance_bets_completion(p_salesperson_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Create Triggers
DROP TRIGGER IF EXISTS tr_update_bets_on_sale ON public.sales;
CREATE TRIGGER tr_update_bets_on_sale
AFTER INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.process_performance_bet_event();

DROP TRIGGER IF EXISTS tr_update_bets_on_activity ON public.activities;
CREATE TRIGGER tr_update_bets_on_activity
AFTER INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.process_performance_bet_event();
