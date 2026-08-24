-- Function to update battle scores automatically
CREATE OR REPLACE FUNCTION public.sync_battle_score()
RETURNS TRIGGER AS $$
DECLARE
    v_battle_id UUID;
    v_metric TEXT;
    v_score NUMERIC;
BEGIN
    -- Only process for active battles
    FOR v_battle_id, v_metric IN 
        SELECT b.id, b.metric 
        FROM public.sales_battles b
        JOIN public.battle_participants p ON p.battle_id = b.id
        WHERE b.status = 'active' 
        AND p.salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND (b.starts_at <= NOW() AND b.ends_at >= NOW())
    LOOP
        -- Calculate score based on metric
        IF v_metric = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND deal_status = 'won'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'deals' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND deal_status = 'won'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'calls' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'call'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'meetings' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'meeting'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
        END IF;

        -- Update participant score
        UPDATE public.battle_participants
        SET current_score = v_score,
            updated_at = NOW()
        WHERE battle_id = v_battle_id 
        AND salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id);
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for battle scoring
DROP TRIGGER IF EXISTS tr_sync_battle_score_sales ON public.sales;
CREATE TRIGGER tr_sync_battle_score_sales
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.sync_battle_score();

DROP TRIGGER IF EXISTS tr_sync_battle_score_activities ON public.activities;
CREATE TRIGGER tr_sync_battle_score_activities
AFTER INSERT OR UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.sync_battle_score();

-- Automated Victory Feed Posts
CREATE OR REPLACE FUNCTION public.auto_victory_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Big Sale Victory (> 5000)
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'won' AND NEW.amount >= 5000 THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, value, event_type)
        VALUES (
            NEW.salesperson_id,
            'Fechamento Épico! 🚀',
            'Selou um deal de ' || NEW.product_name || ' para ' || NEW.client_name,
            NEW.amount,
            'sale'
        );
        
        -- Award a Prize Wheel spin for big sales
        UPDATE public.salespeople
        SET available_spins = available_spins + 1
        WHERE id = NEW.salesperson_id;
    END IF;

    -- Battle Victory
    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND NEW.winner_id IS NOT NULL THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, event_type)
        VALUES (
            NEW.winner_id,
            'Campeão da Arena! 🏆',
            'Venceu a batalha: ' || NEW.title,
            'achievement'
        );
        
        -- Award XP and Spin
        UPDATE public.salespeople
        SET xp = xp + NEW.xp_reward,
            available_spins = available_spins + 2
        WHERE id = NEW.winner_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for Victory Feed
DROP TRIGGER IF EXISTS tr_victory_sale ON public.sales;
CREATE TRIGGER tr_victory_sale
AFTER UPDATE ON public.sales
FOR EACH ROW WHEN (OLD.deal_status IS DISTINCT FROM NEW.deal_status)
EXECUTE FUNCTION public.auto_victory_post();

DROP TRIGGER IF EXISTS tr_victory_battle ON public.sales_battles;
CREATE TRIGGER tr_victory_battle
AFTER UPDATE ON public.sales_battles
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.auto_victory_post();

-- Daily Streak Maintenance Logic
CREATE OR REPLACE FUNCTION public.maintain_sales_streaks()
RETURNS TRIGGER AS $$
DECLARE
    v_last_activity TIMESTAMP;
    v_current_streak INTEGER;
BEGIN
    -- Get last activity date
    SELECT last_activity_at, current_streak INTO v_last_activity, v_current_streak
    FROM public.sales_streaks
    WHERE salesperson_id = NEW.salesperson_id;

    IF NOT FOUND THEN
        INSERT INTO public.sales_streaks (salesperson_id, current_streak, last_activity_at)
        VALUES (NEW.salesperson_id, 1, NOW());
    ELSE
        -- If last activity was yesterday, increment
        IF v_last_activity::date = (NOW() - INTERVAL '1 day')::date THEN
            UPDATE public.sales_streaks
            SET current_streak = current_streak + 1,
                last_activity_at = NOW(),
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE salesperson_id = NEW.salesperson_id;
            
            -- Reward for 7 day streak
            IF (v_current_streak + 1) % 7 = 0 THEN
                UPDATE public.salespeople
                SET available_spins = available_spins + 1
                WHERE id = NEW.salesperson_id;
            END IF;
        -- If last activity was today, just update timestamp
        ELSIF v_last_activity::date = NOW()::date THEN
            UPDATE public.sales_streaks
            SET last_activity_at = NOW()
            WHERE salesperson_id = NEW.salesperson_id;
        -- If missed days, reset
        ELSE
            UPDATE public.sales_streaks
            SET current_streak = 1,
                last_activity_at = NOW()
            WHERE salesperson_id = NEW.salesperson_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Streaks
DROP TRIGGER IF EXISTS tr_maintain_streaks ON public.activities;
CREATE TRIGGER tr_maintain_streaks
AFTER INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.maintain_sales_streaks();

-- Enable Realtime for all gamification tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.victory_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prize_wheel_spins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
