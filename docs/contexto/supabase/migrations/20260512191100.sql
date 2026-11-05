-- Trigger function to update performance bet progress
CREATE OR REPLACE FUNCTION public.handle_performance_update()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Sales
DROP TRIGGER IF EXISTS tr_performance_update_sales ON public.sales;
CREATE TRIGGER tr_performance_update_sales
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.handle_performance_update();

-- Trigger for Activities
DROP TRIGGER IF EXISTS tr_performance_update_activities ON public.activities;
CREATE TRIGGER tr_performance_update_activities
AFTER INSERT OR UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.handle_performance_update();

-- Territory Conquest Logic
CREATE OR REPLACE FUNCTION public.handle_territory_conquest()
RETURNS TRIGGER AS $$
DECLARE
    v_territory_id UUID;
    v_top_salesperson_id UUID;
    v_current_owner_id UUID;
BEGIN
    -- We assume the sale has a territory_id field (if not, we'd look it up via customer or region)
    -- For now, let's check if the sale has a territory context
    IF NEW.territory_id IS NULL THEN
        RETURN NEW;
    END IF;

    v_territory_id := NEW.territory_id;

    -- Update territory stats
    UPDATE public.territories 
    SET total_revenue = total_revenue + NEW.amount,
        total_deals = total_deals + 1,
        updated_at = now()
    WHERE id = v_territory_id
    RETURNING current_owner_id INTO v_current_owner_id;

    -- Find the salesperson with the highest total revenue in this territory
    SELECT salesperson_id INTO v_top_salesperson_id
    FROM (
        SELECT salesperson_id, SUM(amount) as revenue
        FROM public.sales
        WHERE territory_id = v_territory_id
          AND (status = 'won' OR status = 'completed')
        GROUP BY salesperson_id
        ORDER BY revenue DESC
        LIMIT 1
    ) sub;

    -- If a new owner is found
    IF v_top_salesperson_id IS NOT NULL AND (v_current_owner_id IS NULL OR v_top_salesperson_id != v_current_owner_id) THEN
        UPDATE public.territories 
        SET current_owner_id = v_top_salesperson_id,
            conquered_at = now()
        WHERE id = v_territory_id;

        -- Log history
        INSERT INTO public.territory_history (territory_id, salesperson_id, event_type, description)
        VALUES (v_territory_id, v_top_salesperson_id, 'conquest', 'Território conquistado por volume de vendas (Líder de Receita)');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Territory
-- (Note: Ensure 'territory_id' exists on 'sales' table)
-- ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES public.territories(id);

DROP TRIGGER IF EXISTS tr_territory_conquest ON public.sales;
CREATE TRIGGER tr_territory_conquest
AFTER INSERT ON public.sales
FOR EACH ROW WHEN (NEW.status = 'won' OR NEW.status = 'completed')
EXECUTE FUNCTION public.handle_territory_conquest();
