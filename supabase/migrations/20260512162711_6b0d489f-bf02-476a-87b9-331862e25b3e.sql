-- Update Function to include metadata
CREATE OR REPLACE FUNCTION public.fn_notify_victory()
RETURNS TRIGGER AS $$
DECLARE
    v_salesperson_name TEXT;
BEGIN
    -- Get salesperson name
    SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.salesperson_id;

    -- Handle Sales
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'completed' AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed') THEN
        INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, value, metadata)
        VALUES (
            NEW.salesperson_id,
            'sale',
            'Venda Fechada! 💰',
            v_salesperson_name || ' acabou de fechar um negócio de ' || to_char(NEW.amount, 'L999G999G999D99'),
            NEW.amount,
            jsonb_build_object('sale_id', NEW.id)
        );
    END IF;

    -- Handle Battle Completion
    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND OLD.status = 'active' AND NEW.winner_id IS NOT NULL THEN
        -- Get winner name
        SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.winner_id;
        
        INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, metadata)
        VALUES (
            NEW.winner_id,
            'achievement',
            'Campeão da Arena! 🏆',
            v_salesperson_name || ' venceu a batalha: ' || NEW.title,
            jsonb_build_object('battle_id', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
