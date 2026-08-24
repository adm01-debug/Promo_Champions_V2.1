-- Function to sync current values of performance bets
CREATE OR REPLACE FUNCTION public.sync_performance_bets()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers to sync bets
DROP TRIGGER IF EXISTS tr_sync_bets_sales ON public.sales;
CREATE TRIGGER tr_sync_bets_sales
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.sync_performance_bets();

DROP TRIGGER IF EXISTS tr_sync_bets_activities ON public.activities;
CREATE TRIGGER tr_sync_bets_activities
AFTER INSERT OR UPDATE OR DELETE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.sync_performance_bets();

-- Function to settle bets (can be called by cron or admin)
CREATE OR REPLACE FUNCTION public.settle_performance_bets()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
