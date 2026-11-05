CREATE OR REPLACE FUNCTION public.fn_notify_victory()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_salesperson_name TEXT;
BEGIN
    IF TG_TABLE_NAME = 'sales' THEN
        IF NEW.deal_status = 'completed' AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed') THEN
            SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.salesperson_id;

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
    ELSIF TG_TABLE_NAME = 'sales_battles' THEN
        IF NEW.status = 'completed' AND OLD.status = 'active' AND NEW.winner_id IS NOT NULL THEN
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
    END IF;

    RETURN NEW;
END;
$function$
