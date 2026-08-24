-- Function to notify victory
CREATE OR REPLACE FUNCTION public.fn_notify_victory()
RETURNS TRIGGER AS $$
DECLARE
    v_salesperson_name TEXT;
BEGIN
    -- Get salesperson name
    SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.salesperson_id;

    -- Handle Sales (deal_status = 'completed' means WON)
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'completed' AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed') THEN
        INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, value)
        VALUES (
            NEW.salesperson_id,
            'sale',
            'Venda Fechada! 💰',
            v_salesperson_name || ' acabou de fechar um negócio de ' || to_char(NEW.amount, 'L999G999G999D99'),
            NEW.amount
        );
    END IF;

    -- Handle Battle Completion
    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND OLD.status = 'active' AND NEW.winner_id IS NOT NULL THEN
        -- Get winner name
        SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.winner_id;
        
        INSERT INTO public.victory_feed (salesperson_id, event_type, title, description)
        VALUES (
            NEW.winner_id,
            'achievement',
            'Campeão da Arena! 🏆',
            v_salesperson_name || ' venceu a batalha: ' || NEW.title
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for Sales
DROP TRIGGER IF EXISTS tr_notify_sale_victory ON public.sales;
CREATE TRIGGER tr_notify_sale_victory
AFTER UPDATE ON public.sales
FOR EACH ROW
WHEN (NEW.deal_status = 'completed')
EXECUTE FUNCTION public.fn_notify_victory();

-- Trigger for Battles
DROP TRIGGER IF EXISTS tr_notify_battle_victory ON public.sales_battles;
CREATE TRIGGER tr_notify_battle_victory
AFTER UPDATE ON public.sales_battles
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION public.fn_notify_victory();

-- Correct sync_battle_score to use 'completed'
CREATE OR REPLACE FUNCTION public.sync_battle_score()
RETURNS TRIGGER AS $$
DECLARE
    v_battle_id UUID;
    v_metric TEXT;
    v_score NUMERIC;
    v_salesperson_id UUID;
BEGIN
    v_salesperson_id := COALESCE(NEW.salesperson_id, OLD.salesperson_id);
    
    -- Only process for active battles
    FOR v_battle_id, v_metric IN 
        SELECT b.id, b.metric 
        FROM public.sales_battles b
        JOIN public.battle_participants p ON p.battle_id = b.id
        WHERE b.status = 'active' 
        AND p.salesperson_id = v_salesperson_id
        AND (b.starts_at <= NOW() AND b.ends_at >= NOW())
    LOOP
        -- Calculate score based on metric
        IF v_metric = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_score
            FROM public.sales
            WHERE salesperson_id = v_salesperson_id
            AND deal_status = 'completed'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'deals' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.sales
            WHERE salesperson_id = v_salesperson_id
            AND deal_status = 'completed'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'calls' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = v_salesperson_id
            AND activity_type = 'call'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
            
        ELSIF v_metric = 'meetings' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = v_salesperson_id
            AND activity_type = 'meeting'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
        END IF;

        -- Update participant score
        UPDATE public.battle_participants
        SET current_score = v_score,
            updated_at = NOW()
        WHERE battle_id = v_battle_id 
        AND salesperson_id = v_salesperson_id;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
