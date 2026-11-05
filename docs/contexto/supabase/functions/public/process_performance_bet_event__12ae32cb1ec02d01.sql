CREATE OR REPLACE FUNCTION public.process_performance_bet_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
